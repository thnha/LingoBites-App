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
import {RecentLessonRow} from '@components/RecentLessonRow';
import {useContentLibrary, type ContentLessonRow} from '../content';
import {listStartedLessons} from '@shared/db/ContentLessonStateRepository';
import {useFlashcardLibrary, useLessonRepository} from '../lesson';
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
  inkKey: 'onPrimaryContainer' | 'onTertiaryContainer' | 'onSecondaryContainer';
  onPress: () => void;
  testID: string;
};

type RecentItem = {
  kind: 'personal' | 'packaged';
  id: string;
  title: string;
  meta: string;
};

const RECENT_LIMIT = 3;
const SUGGESTION_LIMIT = 3;
const LINK_HIT_SLOP = {top: 10, bottom: 10, left: 10, right: 10};

/**
 * Learning-only home (SETE-247): Tiếp tục học → Hôm nay học gì →
 * Bài học gần đây. Creation moved to the Create tab; practice lives in
 * the "Hôm nay học gì" chips (with the real due-card count) and in Thư viện.
 * No fake numbers: the streak chip is omitted (no data source) and the
 * continue block shows no progress bar (no progress source) — just meta.
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
  const {listLessons} = useLessonRepository();
  const {getDueFlashcards} = useFlashcardLibrary();
  const [startedLesson, setStartedLesson] = useState<ContentLessonRow | null>(
    null,
  );
  const [dueCount, setDueCount] = useState(0);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [suggestions, setSuggestions] = useState<RecentItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      const started = listStartedLessons()[0];
      setStartedLesson(started ? getContentLessonById(started.lessonId) : null);
      setDueCount(getDueFlashcards().length);
      const personal: RecentItem[] = listLessons(RECENT_LIMIT).map(item => ({
        kind: 'personal',
        id: item.id,
        title: item.title,
        meta: t('home.vocab_count', {count: item.vocabularyCount}),
      }));
      const packaged: RecentItem[] =
        personal.length < RECENT_LIMIT
          ? listActivePackageLessons()
              .slice(0, RECENT_LIMIT - personal.length)
              .map(item => ({
                kind: 'packaged' as const,
                id: item.id,
                title: item.titleVi,
                meta: `${item.level} · ${item.estimatedDurationMinutes} phút`,
              }))
          : [];
      setRecentItems([...personal, ...packaged]);
      setSuggestions(
        listActivePackageLessons()
          .slice(0, SUGGESTION_LIMIT)
          .map(item => ({
            kind: 'packaged' as const,
            id: item.id,
            title: item.titleVi,
            meta: `${item.level} · ${item.estimatedDurationMinutes} phút`,
          })),
      );
    }, [
      getContentLessonById,
      getDueFlashcards,
      listActivePackageLessons,
      listLessons,
      t,
    ]),
  );

  const hasData = recentItems.length > 0 || dueCount > 0;
  const showEmpty = !startedLesson && !hasData;

  const todayChips: TodayChip[] = [
    {
      icon: 'refresh',
      value: String(dueCount),
      labelKey: 'home.shortcut_review',
      a11yLabel: `${t('home.shortcut_review')}. ${t(
        'home.shortcut_review_meta',
        {count: dueCount},
      )}`,
      backgroundKey: 'accentSoft',
      inkKey: 'onPrimaryContainer',
      onPress: () => navigation.navigate('DailyReview'),
      testID: 'home-today-review',
    },
    {
      icon: 'mic',
      value: t('home.shortcut_speaking_meta'),
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
    {
      icon: 'bolt',
      value: t('home.shortcut_quick_meta'),
      labelKey: 'home.shortcut_quick',
      a11yLabel: `${t('home.shortcut_quick')}. ${t('home.shortcut_quick_meta')}`,
      backgroundKey: 'secondarySoft',
      inkKey: 'onSecondaryContainer',
      onPress: () =>
        navigation.navigate('Practice', {
          questions: [],
          title: t('home.shortcut_quick'),
        }),
      testID: 'home-today-quick',
    },
  ];

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
          <AppText variant="label" color="muted" numberOfLines={1}>
            {t('home.greeting_top')}
          </AppText>
          <AppText variant="h3" numberOfLines={1}>
            {t('home.greeting_title')}
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
        contentContainerStyle={[styles.scrollContent, {paddingBottom: feedClearance}]}
        showsVerticalScrollIndicator={false}
      >
        {showEmpty ? (
          <View style={styles.emptyCard} testID="home-empty-section">
            <View style={styles.emptyMedallion}>
              <MaterialIcon
                color={theme.colors.primary}
                name="auto_stories"
                size={28}
              />
            </View>
            <AppText variant="h3" style={styles.centerText}>
              {t('home.empty_title')}
            </AppText>
            <AppText color="secondary" style={styles.centerText}>
              {t('home.empty_body')}
            </AppText>
            <AppButton
              accessibilityLabel={t('home.empty_create_a11y')}
              title={t('home.empty_create')}
              variant="primary-accent"
              onPress={() => tabNavigation?.navigate('Create')}
              testID="home-empty-create"
              style={styles.fullWidthButton}
            />
            <Pressable
              accessibilityLabel={t('home.empty_try_a11y')}
              accessibilityRole="link"
              hitSlop={LINK_HIT_SLOP}
              onPress={() =>
                tabNavigation?.navigate('Lessons', {
                  screen: 'ContentLessonList',
                })
              }
              style={styles.textLink}
              testID="home-empty-try"
            >
              <AppText variant="label" style={styles.textLinkLabel}>
                {t('home.empty_try')}
              </AppText>
            </Pressable>
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
        {!showEmpty ? (
          <View style={styles.section} testID="home-today-section">
            <View style={styles.sectionHeader}>
              <AppText variant="h3">{t('home.today_title')}</AppText>
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
        ) : null}
        {!showEmpty && recentItems.length > 0 ? (
          <View style={styles.section} testID="home-recent-section">
            <View style={styles.sectionHeader}>
              <AppText variant="h3">{t('home.recent_lessons')}</AppText>
              <Pressable
                accessibilityLabel={t('home.view_all_a11y')}
                accessibilityRole="button"
                hitSlop={LINK_HIT_SLOP}
                onPress={() => tabNavigation?.navigate('Lessons')}
                style={styles.viewAllChip}
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
            </View>
            <View style={styles.recentList}>
              {recentItems.map((item, index) => (
                <View key={item.id} testID={`home-recent-item-${item.id}`}>
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
        {showEmpty && suggestions.length > 0 ? (
          <View style={styles.section} testID="home-empty-suggestions">
            <AppText variant="h3">{t('home.offline_section_title')}</AppText>
            <View style={styles.recentList}>
              {suggestions.map((item, index) => (
                <View
                  key={item.id}
                  testID={`home-empty-suggestion-${item.id}`}
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
      gap: theme.spacing.xl,
      paddingBottom: 28,
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
    section: {gap: theme.spacing.md},
    sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
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
      minHeight: 52,
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
    viewAllChip: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
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
    emptyCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      gap: theme.spacing.md,
      padding: theme.spacing.lg,
      ...theme.shadow.soft,
    },
    emptyMedallion: {
      alignItems: 'center',
      backgroundColor: theme.colors.accentSoft,
      borderRadius: theme.radius.pill,
      height: 64,
      justifyContent: 'center',
      width: 64,
    },
    centerText: {textAlign: 'center'},
    pressed: {opacity: theme.states.pressedOpacity},
  });
}
