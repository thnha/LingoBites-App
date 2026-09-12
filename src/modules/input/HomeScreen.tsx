import React, {useCallback, useMemo, useState} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, View} from 'react-native';
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
import {useContentLibrary, type ContentLessonRow} from '../content';
import {
  listSavedLessons,
  listStartedLessons,
} from '@shared/db/ContentLessonStateRepository';
import {useLessonRepository} from '../lesson';
import {useAppTheme, type AppTheme} from '@theme';
import {useFloatingTabBarClearance} from '@/app/navigation/tabBarMetrics';
import {useTranslation} from 'react-i18next';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

// 2×2 explore grid from the paper-cut mock (SETE-279). Background/ink pairs
// reuse the contrast-locked chip convention (accentSoft+primary,
// tertiarySoft+onTertiaryContainer, secondarySoft+secondary) plus the
// standard surfaceContainer+text.primary body pairing for the fourth cell.
type ExploreCell = {
  icon: HandoffIconName;
  backgroundKey:
    | 'accentSoft'
    | 'tertiarySoft'
    | 'secondarySoft'
    | 'surfaceContainer';
  inkKey: 'primary' | 'onTertiaryContainer' | 'secondary' | 'text.primary';
  titleKey: string;
  metaKey: string;
  testID: string;
};

type RecentItem = {
  kind: 'personal' | 'packaged';
  id: string;
  title: string;
  meta: string;
  level?: string;
};

type RelearnTarget = {
  kind: 'personal' | 'packaged';
  id: string;
  title: string;
  level: string;
};

const RECENT_LIMIT = 3;
const SUGGESTION_LIMIT = 3;
const LINK_HIT_SLOP = {top: 10, bottom: 10, left: 10, right: 10};

// SETE-281: hero card palette sampled from the design reference (deep-blue
// card, coral/mint blobs, light badge pill, yellow CTA). These are fixed
// brand colors — identical in every theme — because the card background is
// fixed too (theme `inverse` ink is near-black in the dark theme, so theme
// tokens cannot be used here).
const HERO_BLUE = '#226FAB';
const HERO_CORAL = '#EB6B6C';
const HERO_MINT = '#6BD2AD';
const HERO_BADGE_BG = '#DAF1FA';
const HERO_BADGE_INK = '#134F7E';
const HERO_TITLE = '#FFFFFF';
const HERO_CTA_BG = '#FFD35E';
const HERO_CTA_INK = '#40320D';

/**
 * Paper-cut home (SETE-279): hero → 2×2 explore grid → "Tiếp tục học" rail.
 * The hero always shows one CTA — "Học tiếp" while a lesson is started,
 * otherwise a single pick/create entry — so no data combination leaves the
 * screen without an action. No fake numbers: no streak tag (no data source),
 * no weekly-goal ring (no weekly-goal source), no progress bar — just meta.
 * Explore cells point at the Lessons tab until their real routes are mapped.
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
  const [startedLesson, setStartedLesson] = useState<ContentLessonRow | null>(
    null,
  );
  const [ownItems, setOwnItems] = useState<RecentItem[]>([]);
  const [suggestions, setSuggestions] = useState<RecentItem[]>([]);
  const [libraryCount, setLibraryCount] = useState<number | null>(null);
  const [relearnTarget, setRelearnTarget] = useState<RelearnTarget | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      const started = listStartedLessons()[0];
      const startedRow = started
        ? getContentLessonById(started.lessonId)
        : null;
      setStartedLesson(startedRow);

      // Rail candidates: only lessons the user actually created. Never
      // backfill with unopened catalog lessons, and never repeat the lesson
      // already shown in the hero.
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
            level: getLessonById(item.id)?.level,
          })),
      );

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
            level: item.level,
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
      getLessonById,
      listActivePackageLessons,
      listLessons,
      t,
    ]),
  );

  const showStarter = !startedLesson;
  // The hero collapses to a single create CTA only when the library is
  // verifiably empty and there is no past lesson to revisit.
  const starterBare = showStarter && libraryCount === 0 && !relearnTarget;
  // Single hero CTA priority: pick from the packaged library when it is
  // verifiably non-empty, otherwise create. The past lesson (relearnTarget),
  // if any, stays reachable through the rail below.
  const heroPick = showStarter && !starterBare && (libraryCount ?? 0) > 0;

  // SETE-279: temporary destinations. The user maps each cell to its real
  // route later — until then every cell lands on the Lessons tab.
  const goLessonsTab = () => tabNavigation?.navigate('Lessons');
  const exploreCells: ExploreCell[] = [
    {
      icon: 'play_circle',
      backgroundKey: 'accentSoft',
      inkKey: 'primary',
      titleKey: 'home.explore_video',
      metaKey: 'home.explore_video_meta',
      testID: 'home-explore-video',
    },
    {
      icon: 'article',
      backgroundKey: 'tertiarySoft',
      inkKey: 'onTertiaryContainer',
      titleKey: 'home.explore_news',
      metaKey: 'home.explore_news_meta',
      testID: 'home-explore-news',
    },
    {
      icon: 'smartphone',
      backgroundKey: 'secondarySoft',
      inkKey: 'secondary',
      titleKey: 'home.explore_offline',
      metaKey: 'home.explore_offline_meta',
      testID: 'home-explore-offline',
    },
    {
      icon: 'fitness_center',
      backgroundKey: 'surfaceContainer',
      inkKey: 'text.primary',
      titleKey: 'home.explore_practice',
      metaKey: 'home.explore_practice_meta',
      testID: 'home-explore-practice',
    },
  ];

  // "Tiếp tục học" rail: the started lesson first, then personal and
  // packaged candidates, deduplicated by id.
  const railItems: RecentItem[] = useMemo(() => {
    const seen = new Set<string>();
    const items: RecentItem[] = [];
    if (startedLesson) {
      seen.add(startedLesson.id);
      items.push({
        kind: 'packaged',
        id: startedLesson.id,
        title: startedLesson.titleVi,
        meta: `${startedLesson.level} · ${startedLesson.estimatedDurationMinutes} phút`,
        level: startedLesson.level,
      });
    }
    for (const item of [...ownItems, ...suggestions]) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
    }
    return items;
  }, [startedLesson, ownItems, suggestions]);

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
          <View
            style={styles.heroCard}
            testID="home-starter-section"
            accessibilityRole="none"
          >
            <HeroDecor />
            <View style={styles.heroCopy} testID="home-hero-section">
              <View style={styles.heroBadge}>
                <AppText variant="label" style={styles.heroBadgeLabel}>
                  {t('home.greeting_top')}
                </AppText>
              </View>
              <AppText variant="h3" style={styles.heroTitle} numberOfLines={2}>
                {starterBare
                  ? t('home.empty_title')
                  : heroPick
                  ? t('home.starter_pick')
                  : t('home.starter_title')}
              </AppText>
              <AppText variant="caption" style={styles.heroBody}>
                {starterBare
                  ? t('home.empty_body')
                  : heroPick && libraryCount !== null
                  ? t('home.starter_pick_meta', {n: libraryCount})
                  : t('home.starter_create_meta')}
              </AppText>
              {starterBare ? (
                <HeroCta
                  accessibilityLabel={t('home.empty_create_a11y')}
                  label={t('home.empty_create')}
                  onPress={() => tabNavigation?.navigate('Create')}
                  testID="home-starter-first"
                />
              ) : heroPick ? (
                <HeroCta
                  accessibilityLabel={t('home.starter_pick')}
                  label={t('home.starter_pick')}
                  onPress={() =>
                    tabNavigation?.navigate('Lessons', {
                      screen: 'ContentLessonList',
                    })
                  }
                  testID="home-starter-pick"
                />
              ) : (
                <HeroCta
                  accessibilityLabel={`${t('home.starter_create')}. ${t(
                    'home.starter_create_meta',
                  )}`}
                  label={t('home.starter_create')}
                  onPress={() => tabNavigation?.navigate('Create')}
                  testID="home-starter-create"
                />
              )}
            </View>
            <HeroMascot />
          </View>
        ) : null}
        {startedLesson ? (
          <View style={styles.heroCard} testID="home-continue-section">
            <HeroDecor />
            <View style={styles.heroCopy} testID="home-hero-section">
              <View style={styles.heroBadge}>
                <AppText variant="label" style={styles.heroBadgeLabel}>
                  {t('home.continue_label')}
                </AppText>
              </View>
              <AppText variant="h3" style={styles.heroTitle} numberOfLines={2}>
                {startedLesson.titleVi}
              </AppText>
              <AppText variant="caption" style={styles.heroBody}>
                {t('home.continue_meta', {
                  duration: startedLesson.estimatedDurationMinutes,
                })}
              </AppText>
              <HeroCta
                accessibilityLabel={t('home.continue_learning_a11y')}
                label={t('home.continue_learning')}
                onPress={() =>
                  navigation.navigate('ContentLessonRuntime', {
                    lessonId: startedLesson.id,
                  })
                }
                testID="home-continue-action"
              />
            </View>
            <HeroMascot />
          </View>
        ) : null}
        <View style={styles.section} testID="home-explore-section">
          <View style={styles.sectionHeader}>
            <AppText variant="h3" style={styles.sectionTitle}>
              {t('home.explore_title')}
            </AppText>
            <Pressable
              accessibilityLabel={t('home.view_all_a11y')}
              accessibilityRole="button"
              hitSlop={LINK_HIT_SLOP}
              onPress={goLessonsTab}
              style={styles.textLink}
              testID="home-explore-view-all"
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
          <View style={styles.exploreGrid}>
            {exploreCells.map(cell => {
              const backgroundColor = theme.colors[cell.backgroundKey];
              const ink =
                cell.inkKey === 'text.primary'
                  ? theme.colors.text.primary
                  : theme.colors[cell.inkKey];
              const a11yLabel = `${t(cell.titleKey)}. ${t(cell.metaKey)}`;
              return (
                <Pressable
                  accessibilityLabel={a11yLabel}
                  accessibilityRole="button"
                  key={cell.testID}
                  onPress={goLessonsTab}
                  testID={cell.testID}
                  style={styles.exploreCellWrap}
                >
                  {({pressed}) => (
                    <View
                      style={[
                        styles.exploreCell,
                        {backgroundColor},
                        pressed && styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.exploreIconTile,
                          {backgroundColor: theme.colors.surface},
                        ]}
                      >
                        <MaterialIcon color={ink} name={cell.icon} size={24} />
                      </View>
                      <AppText
                        variant="label"
                        style={[styles.exploreTitle, {color: ink}]}
                        numberOfLines={2}
                      >
                        {t(cell.titleKey)}
                      </AppText>
                      <AppText
                        variant="caption"
                        style={[styles.exploreMeta, {color: ink}]}
                        numberOfLines={2}
                      >
                        {t(cell.metaKey)}
                      </AppText>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.section} testID="home-lessons-section">
          <View style={styles.sectionHeader}>
            <AppText variant="h3" style={styles.sectionTitle}>
              {t('home.continue_rail_title')}
            </AppText>
            {railItems.length > 0 ? (
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
          {railItems.length > 0 ? (
            <ScrollView
              horizontal
              contentContainerStyle={styles.railContent}
              showsHorizontalScrollIndicator={false}
              testID="home-continue-rail"
            >
              {railItems.map(item => (
                <Pressable
                  accessibilityLabel={`${item.title}, ${item.meta}`}
                  accessibilityRole="button"
                  key={item.id}
                  onPress={() => openRecentItem(item)}
                  testID={`home-recent-item-${item.id}`}
                  style={styles.railCardWrap}
                >
                  {({pressed}) => (
                    <View style={[styles.railCard, pressed && styles.pressed]}>
                      <View style={styles.railThumb}>
                        <MaterialIcon
                          color={theme.colors.primary}
                          name={
                            item.kind === 'personal' ? 'menu_book' : 'article'
                          }
                          size={24}
                        />
                      </View>
                      <View style={styles.railCopy}>
                        {item.level ? (
                          <View style={styles.railTag}>
                            <AppText
                              variant="caption"
                              style={styles.railTagLabel}
                            >
                              {item.level}
                            </AppText>
                          </View>
                        ) : null}
                        <AppText variant="label" numberOfLines={2}>
                          {item.title}
                        </AppText>
                        <AppText
                          color="muted"
                          variant="caption"
                          numberOfLines={1}
                        >
                          {item.meta}
                        </AppText>
                      </View>
                      <MaterialIcon
                        color={theme.colors.text.secondary}
                        name="chevron_right"
                        size={22}
                      />
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
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
      </ScrollView>
    </AppScreen>
  );
}

/**
 * CTA drawn on the fixed deep-blue hero surface: yellow background with dark
 * ink (SETE-281 design reference). Fixed colors in every theme — the pairing
 * is contrast-locked in HomeScreenChipContrast.test.tsx.
 */
function HeroCta({
  accessibilityLabel,
  label,
  onPress,
  testID,
}: {
  accessibilityLabel: string;
  label: string;
  onPress: () => void;
  testID: string;
}) {
  const {theme} = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      testID={testID}
      style={({pressed}) => [
        styles.heroCta,
        pressed && {opacity: theme.states.pressedOpacity},
      ]}
    >
      <AppText variant="label" style={styles.heroCtaLabel}>
        {label}
      </AppText>
    </Pressable>
  );
}

/**
 * Corner blobs clipped by the hero card (SETE-281 design reference: coral
 * circle top-right, mint blob bottom-left). Purely decorative.
 */
function HeroDecor() {
  const {theme} = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View
      style={styles.heroDecor}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.heroBlobCoral} />
      <View style={styles.heroBlobMint} />
    </View>
  );
}

/**
 * Cat mascot (SETE-281 design reference): user-supplied artwork bundled as a
 * transparent PNG. Purely decorative.
 */
function HeroMascot() {
  const {theme} = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View
      style={styles.heroMascot}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Image
        source={require('../../assets/home-hero-cat.png')}
        style={styles.heroMascotImage}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
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
    heroCard: {
      alignItems: 'center',
      backgroundColor: HERO_BLUE,
      borderRadius: theme.radius.xl,
      flexDirection: 'row',
      gap: theme.spacing.md,
      minHeight: 250,
      overflow: 'hidden',
      padding: theme.spacing.lg,
      ...theme.shadow.soft,
    },
    heroDecor: {
      ...StyleSheet.absoluteFill,
    },
    heroBlobCoral: {
      backgroundColor: HERO_CORAL,
      borderRadius: 60,
      height: 120,
      position: 'absolute',
      right: -40,
      top: -48,
      width: 120,
    },
    heroBlobMint: {
      backgroundColor: HERO_MINT,
      borderRadius: 45,
      bottom: -60,
      height: 90,
      left: -44,
      position: 'absolute',
      width: 80,
    },
    heroCopy: {flex: 1, gap: theme.spacing.sm, minWidth: 0},
    heroBadge: {
      alignSelf: 'flex-start',
      backgroundColor: HERO_BADGE_BG,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
    },
    heroBadgeLabel: {
      color: HERO_BADGE_INK,
    },
    heroTitle: {
      color: HERO_TITLE,
    },
    heroBody: {
      color: HERO_TITLE,
      opacity: 0.92,
    },
    heroMascot: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginBottom: -110,
      marginRight: -18,
      width: 128,
    },
    heroMascotImage: {
      height: 140,
      width: 112,
    },
    heroCta: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: HERO_CTA_BG,
      borderRadius: 999,
      justifyContent: 'center',
      marginTop: theme.spacing.xs,
      // Height stays flexible so AX text sizes wrap instead of clipping.
      minHeight: 48,
      minWidth: 160,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    heroCtaLabel: {
      color: HERO_CTA_INK,
      textAlign: 'center',
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
    exploreGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    exploreCellWrap: {
      flexBasis: '47%',
      flexGrow: 1,
      minWidth: 140,
    },
    exploreCell: {
      borderRadius: theme.radius.lg,
      gap: 6,
      minHeight: 132,
      padding: theme.spacing.md,
      ...theme.shadow.soft,
    },
    exploreIconTile: {
      alignItems: 'center',
      borderRadius: 14,
      height: 44,
      justifyContent: 'center',
      width: 44,
    },
    exploreTitle: {},
    exploreMeta: {},
    railContent: {
      gap: theme.spacing.sm,
      paddingRight: theme.gutter,
    },
    railCardWrap: {
      width: 248,
    },
    railCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      minHeight: 96,
      padding: theme.spacing.md,
      ...theme.shadow.soft,
    },
    railThumb: {
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceContainer,
      borderRadius: 14,
      height: 52,
      justifyContent: 'center',
      width: 52,
    },
    railCopy: {flex: 1, gap: 4, minWidth: 0},
    railTag: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.accentSoft,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    railTagLabel: {
      color: theme.colors.primary,
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
    pressed: {opacity: theme.states.pressedOpacity},
  });
}
