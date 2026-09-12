import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {
  HomeStackParamList,
  RootTabParamList,
} from '@/app/navigation/types';
import {AppButton} from '@components/AppButton';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {IconButton} from '@components/IconButton';
import {MaterialIcon} from '@components/MaterialIcon';
import type {HandoffIconName} from '@components/icons/iconRegistry';
import {RecentLessonRow} from '@components/RecentLessonRow';
import {useContentLibrary, type ContentLessonRow} from '../content';
import {
  listSavedLessons,
  listStartedLessons,
} from '@shared/db/ContentLessonStateRepository';
import {useFlashcardLibrary, useLessonRepository} from '../lesson';
import type {PracticeQuestion} from '@shared/schemas/ai-output-v1';
import {resolveQuickPractice} from '../practice/resolveQuickPractice';
import {useAppTheme, type AppTheme} from '@theme';
import {useFloatingTabBarClearance} from '@/app/navigation/tabBarMetrics';
import {useTranslation} from 'react-i18next';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

type TodayChip = {
  icon: 'refresh' | 'mic' | 'bolt';
  value: string;
  labelKey: string;
  a11yLabel: string;
  backgroundKey: 'accentSoft' | 'tertiarySoft' | 'secondarySoft';
  // Ink is paired by the Chip convention (accentSoft+primary,
  // secondarySoft+secondary): onPrimaryContainer is unreadable on the light
  // accentSoft tint in the neo/comic/core themes (1.0–1.2:1).
  inkKey: 'primary' | 'onTertiaryContainer' | 'secondary';
  onPress: () => void;
  testID: string;
};

type RecentItem = {
  kind: 'personal' | 'packaged';
  id: string;
  title: string;
  meta: string;
};

type RelearnTarget = {
  kind: 'personal' | 'packaged';
  id: string;
  title: string;
  level: string;
};

type StarterAction = {
  icon: HandoffIconName;
  backgroundKey: 'accentSoft' | 'secondarySoft' | 'tertiarySoft';
  inkKey: 'primary' | 'secondary' | 'onTertiaryContainer';
  title: string;
  subtitle: string;
  a11yLabel: string;
  onPress: () => void;
  testID: string;
};

const RECENT_LIMIT = 3;
const SUGGESTION_LIMIT = 3;
const LINK_HIT_SLOP = {top: 10, bottom: 10, left: 10, right: 10};

/**
 * Learning-only home (SETE-250, Option B): the top slot always shows one
 * card — "Tiếp tục" while a lesson is started, otherwise the "Bắt đầu từ
 * đâu?" starter list. Every section below decides its own empty state, so no
 * data combination can leave the screen without an action. No fake numbers:
 * the streak chip is omitted (no data source) and the continue block shows
 * no progress bar (no progress source) — just meta.
 */
export function HomeScreen({navigation}: Props) {
  const {theme} = useAppTheme();
  const feedClearance = useFloatingTabBarClearance();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {t} = useTranslation();
  const tabNavigation =
    navigation.getParent<
      import('@react-navigation/native').NavigationProp<RootTabParamList>
    >();
  const {getContentLessonById, listActivePackageLessons} = useContentLibrary();
  const {getLessonById, listLessons} = useLessonRepository();
  const {getDueFlashcards} = useFlashcardLibrary();
  const [startedLesson, setStartedLesson] = useState<ContentLessonRow | null>(
    null,
  );
  const [dueCount, setDueCount] = useState(0);
  const [ownItems, setOwnItems] = useState<RecentItem[]>([]);
  const [suggestions, setSuggestions] = useState<RecentItem[]>([]);
  const [libraryCount, setLibraryCount] = useState<number | null>(null);
  const [relearnTarget, setRelearnTarget] = useState<RelearnTarget | null>(
    null,
  );
  const [quickQuestions, setQuickQuestions] = useState<PracticeQuestion[]>([]);
  const [quickTitle, setQuickTitle] = useState('');

  useFocusEffect(
    useCallback(() => {
      const started = listStartedLessons()[0];
      const startedRow = started
        ? getContentLessonById(started.lessonId)
        : null;
      setStartedLesson(startedRow);
      setDueCount(getDueFlashcards().length);

      // "Bài học của bạn": only lessons the user actually created. Never
      // backfill with unopened catalog lessons, and never repeat the lesson
      // already shown in the Continue card.
      const personal = listLessons();
      setOwnItems(
        personal
          .filter(item => item.id !== startedRow?.id)
          .slice(0, RECENT_LIMIT)
          .map(item => ({
            kind: 'personal' as const,
            id: item.id,
            title: item.title,
            meta: t('home.vocab_count', {count: item.vocabularyCount}),
          })),
      );

      const {questions: quick, title: quickLessonTitle} = resolveQuickPractice(
        personal,
        getLessonById,
      );
      setQuickQuestions(quick);
      setQuickTitle(quickLessonTitle);

      let packaged: ReturnType<typeof listActivePackageLessons> = [];
      let count: number | null = null;
      try {
        packaged = listActivePackageLessons();
        count = packaged.length;
      } catch {
        count = null;
      }
      setLibraryCount(count);
      setSuggestions(
        packaged
          .filter(item => item.id !== startedRow?.id)
          .slice(0, SUGGESTION_LIMIT)
          .map(item => ({
            kind: 'packaged' as const,
            id: item.id,
            title: item.titleVi,
            meta: `${item.level} · ${item.estimatedDurationMinutes} phút`,
          })),
      );

      // "Học lại bài cũ": newest saved-or-personal lesson by timestamp.
      // No is_completed flag exists yet, so recency is the proxy.
      const candidates: (RelearnTarget & {at: string})[] = [];
      const newestPersonal = personal[0];
      if (newestPersonal) {
        const record = getLessonById(newestPersonal.id);
        if (record) {
          candidates.push({
            kind: 'personal',
            id: record.id,
            title: record.title,
            level: record.level,
            at: [record.updatedAt, record.createdAt]
              .filter(Boolean)
              .sort()
              .pop() as string,
          });
        }
      }
      const newestSaved = listSavedLessons()[0];
      if (newestSaved) {
        const row = getContentLessonById(newestSaved.lessonId);
        if (row) {
          candidates.push({
            kind: 'packaged',
            id: row.id,
            title: row.titleVi,
            level: row.level,
            at: newestSaved.updatedAt,
          });
        }
      }
      candidates.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
      const [newest] = candidates;
      setRelearnTarget(
        newest
          ? {
              kind: newest.kind,
              id: newest.id,
              title: newest.title,
              level: newest.level,
            }
          : null,
      );
    }, [
      getContentLessonById,
      getDueFlashcards,
      getLessonById,
      listActivePackageLessons,
      listLessons,
      t,
    ]),
  );

  const showStarter = !startedLesson;
  // The starter card collapses to a single create CTA only when the library
  // is verifiably empty and there is no past lesson to revisit.
  const starterBare = showStarter && libraryCount === 0 && !relearnTarget;

  const openRelearnTarget = (target: RelearnTarget) => {
    if (target.kind === 'personal') {
      navigation.navigate('SavedLessonDetail', {lessonId: target.id});
    } else {
      navigation.navigate('ContentLessonRuntime', {lessonId: target.id});
    }
  };

  const starterActions: StarterAction[] = [];
  if (!starterBare) {
    if (libraryCount === null || libraryCount > 0) {
      const subtitle =
        libraryCount !== null
          ? t('home.starter_pick_meta', {n: libraryCount})
          : t('home.starter_pick_meta_plain');
      starterActions.push({
        icon: 'menu_book',
        backgroundKey: 'accentSoft',
        inkKey: 'primary',
        title: t('home.starter_pick'),
        subtitle,
        a11yLabel: `${t('home.starter_pick')}. ${subtitle}`,
        onPress: () =>
          tabNavigation?.navigate('Lessons', {
            screen: 'ContentLessonList',
          }),
        testID: 'home-starter-pick',
      });
    }
    starterActions.push({
      icon: 'edit',
      backgroundKey: 'secondarySoft',
      inkKey: 'secondary',
      title: t('home.starter_create'),
      subtitle: t('home.starter_create_meta'),
      a11yLabel: `${t('home.starter_create')}. ${t(
        'home.starter_create_meta',
      )}`,
      onPress: () => tabNavigation?.navigate('Create'),
      testID: 'home-starter-create',
    });
    if (relearnTarget) {
      const subtitle = t('home.starter_relearn_meta', {
        title: relearnTarget.title,
        level: relearnTarget.level,
      });
      const target = relearnTarget;
      starterActions.push({
        icon: 'history_edu',
        backgroundKey: 'tertiarySoft',
        inkKey: 'onTertiaryContainer',
        title: t('home.starter_relearn'),
        subtitle,
        a11yLabel: `${t('home.starter_relearn')}. ${subtitle}`,
        onPress: () => openRelearnTarget(target),
        testID: 'home-starter-relearn',
      });
    }
  }

  const reviewA11y =
    dueCount > 0
      ? `${t('home.shortcut_review')}. ${t('home.shortcut_review_meta', {
          count: dueCount,
        })}`
      : `${t('home.shortcut_review')}. ${t('home.daily_review_widget_none')}`;
  const todayChips: TodayChip[] = [
    {
      icon: 'refresh',
      value: dueCount > 0 ? String(dueCount) : t('home.shortcut_review_done'),
      labelKey: 'home.shortcut_review',
      a11yLabel: reviewA11y,
      backgroundKey: 'accentSoft',
      inkKey: 'primary',
      onPress: () => navigation.navigate('DailyReview'),
      testID: 'home-today-review',
    },
    {
      icon: 'mic',
      value: t('home.shortcut_speaking_value'),
      labelKey: 'home.shortcut_speaking',
      a11yLabel: `${t('home.shortcut_speaking')}. ${t(
        'home.shortcut_speaking_meta',
      )}`,
      backgroundKey: 'tertiarySoft',
      inkKey: 'onTertiaryContainer',
      onPress: () =>
        tabNavigation?.navigate('Lessons', {screen: 'SpeakingRoom'}),
      testID: 'home-today-speaking',
    },
  ];
  if (quickQuestions.length > 0) {
    const questions = quickQuestions;
    const title = quickTitle || t('home.shortcut_quick');
    todayChips.push({
      icon: 'bolt',
      value: t('home.shortcut_quick_meta'),
      labelKey: 'home.shortcut_quick',
      a11yLabel: `${t('home.shortcut_quick')}. ${t(
        'home.shortcut_quick_meta',
      )}`,
      backgroundKey: 'secondarySoft',
      inkKey: 'secondary',
      onPress: () => navigation.navigate('Practice', {questions, title}),
      testID: 'home-today-quick',
    });
  }

  const openRecentItem = (item: RecentItem) => {
    if (item.kind === 'personal') {
      navigation.navigate('SavedLessonDetail', {lessonId: item.id});
    } else {
      navigation.navigate('ContentLessonRuntime', {lessonId: item.id});
    }
  };

  return (
    <AppScreen>
      <View style={styles.header}>
        <View style={styles.greeting} testID="home-greeting">
          <AppText variant="h3" numberOfLines={1}>
            {t('home.greeting_top')}
          </AppText>
        </View>
        <IconButton
          accessibilityLabel={t('home.settings_a11y')}
          icon="settings"
          onPress={() => tabNavigation?.navigate('Profile')}
          testID="home-settings"
          tone="surface"
        />
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: feedClearance},
        ]}
        showsVerticalScrollIndicator={false}
      >
        {showStarter ? (
          <View style={styles.starterCard} testID="home-starter-section">
            <AppText variant="h3">
              {starterBare ? t('home.empty_title') : t('home.starter_title')}
            </AppText>
            {starterBare ? (
              <>
                <AppText color="secondary">{t('home.empty_body')}</AppText>
                <AppButton
                  accessibilityLabel={t('home.empty_create_a11y')}
                  title={t('home.empty_create')}
                  variant="primary-accent"
                  onPress={() => tabNavigation?.navigate('Create')}
                  testID="home-starter-first"
                  style={styles.fullWidthButton}
                />
              </>
            ) : (
              <View style={styles.starterList}>
                {starterActions.map((action, index) => (
                  <StarterRow
                    key={action.testID}
                    action={action}
                    showDivider={index < starterActions.length - 1}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}
        {startedLesson ? (
          <View style={styles.continueCard} testID="home-continue-section">
            <AppText variant="caption" style={styles.continueKicker}>
              {t('home.continue_label')}
            </AppText>
            <AppText variant="h3" numberOfLines={2}>
              {startedLesson.titleVi}
            </AppText>
            <AppText color="muted" variant="caption">
              {t('home.continue_meta', {
                duration: startedLesson.estimatedDurationMinutes,
              })}
            </AppText>
            <AppButton
              accessibilityLabel={t('home.continue_learning_a11y')}
              title={t('home.continue_learning')}
              variant="primary-accent"
              onPress={() =>
                navigation.navigate('ContentLessonRuntime', {
                  lessonId: startedLesson.id,
                })
              }
              testID="home-continue-action"
              style={styles.fullWidthButton}
            />
          </View>
        ) : null}
        <View style={styles.section} testID="home-today-section">
          <View style={styles.sectionHeader}>
            <AppText variant="h3" style={styles.sectionTitle}>
              {t('home.today_title')}
            </AppText>
            <Pressable
              accessibilityLabel={t('home.today_swap_a11y')}
              accessibilityRole="button"
              hitSlop={LINK_HIT_SLOP}
              onPress={() => navigation.navigate('Today')}
              style={styles.textLink}
              testID="home-today-swap"
            >
              <AppText variant="label" style={styles.textLinkLabel}>
                {t('home.today_swap')}
              </AppText>
            </Pressable>
          </View>
          <View style={styles.todayRow}>
            {todayChips.map(chip => (
              <Pressable
                accessibilityLabel={chip.a11yLabel}
                accessibilityRole="button"
                key={chip.testID}
                onPress={chip.onPress}
                style={({pressed}) => [
                  styles.todayChip,
                  {backgroundColor: theme.colors[chip.backgroundKey]},
                  pressed && styles.pressed,
                ]}
                testID={chip.testID}
              >
                <View style={styles.todayIconCell}>
                  <MaterialIcon
                    color={theme.colors[chip.inkKey]}
                    name={chip.icon}
                    size={22}
                  />
                </View>
                <AppText
                  style={[
                    styles.todayValue,
                    {color: theme.colors[chip.inkKey]},
                  ]}
                  numberOfLines={2}
                >
                  {chip.value}
                </AppText>
                <AppText
                  style={[
                    styles.todayLabel,
                    {color: theme.colors[chip.inkKey]},
                  ]}
                  numberOfLines={2}
                >
                  {t(chip.labelKey)}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.section} testID="home-lessons-section">
          <View style={styles.sectionHeader}>
            <AppText variant="h3" style={styles.sectionTitle}>
              {t('home.recent_lessons')}
            </AppText>
            {ownItems.length > 0 ? (
              <Pressable
                accessibilityLabel={t('home.view_all_a11y')}
                accessibilityRole="button"
                hitSlop={LINK_HIT_SLOP}
                onPress={() => tabNavigation?.navigate('Lessons')}
                style={styles.textLink}
                testID="home-recent-view-all"
              >
                <AppText
                  variant="label"
                  style={styles.textLinkLabel}
                  numberOfLines={1}
                >
                  {t('home.view_all')}
                </AppText>
              </Pressable>
            ) : null}
          </View>
          {ownItems.length > 0 ? (
            <View style={styles.recentList}>
              {ownItems.map((item, index) => (
                <View key={item.id} testID={`home-recent-item-${item.id}`}>
                  <RecentLessonRow
                    index={index}
                    lesson={{id: item.id, title: item.title, meta: item.meta}}
                    onPress={() => openRecentItem(item)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.lessonsEmpty}>
              <AppText color="secondary">
                {t('home.lessons_empty_lead')}
              </AppText>
              {startedLesson ? (
                <AppButton
                  accessibilityLabel={t('home.empty_create_a11y')}
                  title={t('home.empty_create')}
                  variant="primary-accent"
                  onPress={() => tabNavigation?.navigate('Create')}
                  testID="home-lessons-create"
                  style={styles.fullWidthButton}
                />
              ) : null}
            </View>
          )}
        </View>
        {ownItems.length === 0 && suggestions.length > 0 ? (
          <View style={styles.section} testID="home-offline-suggestions">
            <AppText variant="h3">{t('home.offline_section_title')}</AppText>
            <View style={styles.recentList}>
              {suggestions.map((item, index) => (
                <View
                  key={item.id}
                  testID={`home-offline-suggestion-${item.id}`}
                >
                  <RecentLessonRow
                    index={index}
                    lesson={{id: item.id, title: item.title, meta: item.meta}}
                    onPress={() => openRecentItem(item)}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

function StarterRow({
  action,
  showDivider,
}: {
  action: StarterAction;
  showDivider: boolean;
}) {
  const {theme} = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={action.a11yLabel}
      accessibilityRole="button"
      onPress={action.onPress}
      style={({pressed}) => [
        stylesRow.row,
        showDivider && {
          borderBottomColor: theme.colors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
        pressed && {opacity: theme.states.pressedOpacity},
      ]}
      testID={action.testID}
    >
      <View
        style={[
          stylesRow.thumb,
          {backgroundColor: theme.colors[action.backgroundKey]},
        ]}
      >
        <MaterialIcon
          color={theme.colors[action.inkKey]}
          name={action.icon}
          size={22}
        />
      </View>
      <View style={stylesRow.text}>
        <AppText variant="label">{action.title}</AppText>
        <AppText color="muted" variant="caption">
          {action.subtitle}
        </AppText>
      </View>
      <MaterialIcon
        color={theme.colors.text.secondary}
        name="chevron_right"
        size={22}
      />
    </Pressable>
  );
}

const stylesRow = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    minHeight: 68,
    paddingVertical: 12,
  },
  thumb: {
    alignItems: 'center',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  text: {flex: 1, gap: 2, minWidth: 0},
});

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      height: 56,
      justifyContent: 'space-between',
      paddingHorizontal: theme.gutter,
    },
    greeting: {flex: 1, gap: 0, minWidth: 0, paddingRight: theme.spacing.sm},
    scrollContent: {
      flexGrow: 1,
      gap: theme.spacing.xl,
      paddingBottom: 28,
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
    section: {gap: theme.spacing.md},
    sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'space-between',
    },
    // Lets long AX titles wrap instead of pushing the section link off-screen.
    sectionTitle: {flex: 1, minWidth: 0},
    starterCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      gap: theme.spacing.md,
      padding: theme.spacing.lg,
      ...theme.shadow.soft,
    },
    starterList: {
      paddingBottom: theme.spacing.xs,
    },
    continueCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      gap: theme.spacing.md,
      padding: theme.spacing.lg,
      ...theme.shadow.soft,
    },
    continueKicker: {
      color: theme.colors.primary,
      textTransform: 'uppercase',
    },
    fullWidthButton: {
      alignSelf: 'stretch',
      // Height stays flexible so AX text sizes wrap instead of clipping.
      height: 'auto',
      minHeight: 52,
      paddingVertical: theme.spacing.sm,
    },
    lessonsEmpty: {
      gap: theme.spacing.md,
    },
    todayRow: {flexDirection: 'row', gap: theme.spacing.sm},
    todayChip: {
      alignItems: 'center',
      borderRadius: 20,
      flex: 1,
      gap: 4,
      justifyContent: 'center',
      minHeight: 88,
      minWidth: 0,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
    },
    todayIconCell: {
      alignItems: 'center',
      height: 36,
      justifyContent: 'center',
      width: 36,
    },
    todayValue: {
      fontSize: 16,
      fontWeight: theme.typography.weight.bold,
      lineHeight: 20,
      textAlign: 'center',
    },
    todayLabel: {
      fontSize: 12.5,
      fontWeight: theme.typography.weight.medium,
      lineHeight: 16,
      textAlign: 'center',
    },
    recentList: {gap: theme.spacing.sm},
    textLink: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    textLinkLabel: {
      color: theme.colors.primary,
    },
    pressed: {opacity: theme.states.pressedOpacity},
  });
}
