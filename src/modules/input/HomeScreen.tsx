import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {
  HomeStackParamList,
  RootTabParamList,
} from '@/app/navigation/types';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {IconButton} from '@components/IconButton';
import {MaterialIcon} from '@components/MaterialIcon';
import {useContentLibrary, type ContentLessonRow} from '../content';
import {listStartedLessons} from '@shared/db/ContentLessonStateRepository';
import {useFlashcardLibrary, useLessonRepository} from '../lesson';
import {listSavedLessonV2Summaries} from '@shared/db/LessonV2Repository';
import {useAppTheme, type AppTheme} from '@theme';
import {useTranslation} from 'react-i18next';
import {useFeatureFlags} from '@/release';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;
type Shortcut = {
  icon: 'refresh' | 'mic' | 'bolt' | 'school';
  titleKey: string;
  meta: string;
  onPress: () => void;
  testID: string;
};

export function HomeScreen({navigation}: Props) {
  const {theme} = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {t} = useTranslation();
  const {config, isFeatureEnabled} = useFeatureFlags();
  const tabNavigation =
    navigation.getParent<
      import('@react-navigation/native').NavigationProp<RootTabParamList>
    >();
  const {getContentLessonById} = useContentLibrary();
  const {listLessons} = useLessonRepository();
  const {getDueFlashcards} = useFlashcardLibrary();
  const [startedLesson, setStartedLesson] = useState<ContentLessonRow | null>(
    null,
  );
  const [dueCount, setDueCount] = useState(0);
  const [libraryCount, setLibraryCount] = useState(0);
  const imageInputEnabled =
    config.features.imageInput &&
    config.features.ocrScanner &&
    config.features.ocrReviewEdit;

  const isLessonV2Enabled = isFeatureEnabled('lessonV2');

  useFocusEffect(
    useCallback(() => {
      const started = listStartedLessons()[0];
      setStartedLesson(started ? getContentLessonById(started.lessonId) : null);
      setDueCount(getDueFlashcards().length);
      const v1Count = listLessons().length;
      const v2Count = isLessonV2Enabled ? listSavedLessonV2Summaries().length : 0;
      setLibraryCount(v1Count + v2Count);
    }, [getContentLessonById, getDueFlashcards, listLessons, isLessonV2Enabled]),
  );

  const shortcuts: Shortcut[] = [
    {
      icon: 'refresh',
      titleKey: 'home.shortcut_review',
      meta: t('home.shortcut_review_meta', {count: dueCount}),
      onPress: () => navigation.navigate('DailyReview'),
      testID: 'home-shortcut-review',
    },
    {
      icon: 'mic',
      titleKey: 'home.shortcut_speaking',
      meta: t('home.shortcut_speaking_meta'),
      onPress: () =>
        tabNavigation?.navigate('Lessons', {screen: 'SpeakingRoom'}),
      testID: 'home-shortcut-speaking',
    },
    {
      icon: 'bolt',
      titleKey: 'home.shortcut_quick',
      meta: t('home.shortcut_quick_meta'),
      onPress: () =>
        navigation.navigate('Practice', {
          questions: [],
          title: t('home.shortcut_quick'),
        }),
      testID: 'home-shortcut-quick',
    },
    {
      icon: 'school',
      titleKey: 'home.shortcut_library',
      meta: t('home.shortcut_library_meta', {count: libraryCount}),
      onPress: () => tabNavigation?.navigate('Lessons'),
      testID: 'home-shortcut-library',
    },
  ];

  return (
    <AppScreen>
      <View style={styles.header}>
        <View style={styles.brand}>
          <MaterialIcon
            color={theme.colors.primary}
            name="translate"
            size={26}
          />
          <AppText numberOfLines={1} style={styles.brandText}>
            {t('app.name')}
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <AppText variant="h1">{t('home.title_option_c')}</AppText>
          <AppText color="secondary">{t('home.subtitle_option_c')}</AppText>
        </View>
        {startedLesson ? (
          <View style={styles.hero} testID="home-continue-section">
            <AppText variant="h2">{startedLesson.titleVi}</AppText>
            <AppText color="secondary">
              {t('home.continue_meta', {
                duration: startedLesson.estimatedDurationMinutes,
              })}
            </AppText>
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
              <AppText color="secondary" variant="label">
                0%
              </AppText>
            </View>
            <Pressable
              accessibilityLabel={t('home.continue_learning_a11y')}
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate('ContentLessonRuntime', {
                  lessonId: startedLesson.id,
                })
              }
              style={({pressed}) => [
                styles.primaryAction,
                pressed && styles.pressed,
              ]}
              testID="home-continue-action"
            >
              <AppText style={styles.primaryActionText}>
                {t('home.continue_learning')}
              </AppText>
            </Pressable>
          </View>
        ) : null}
        <AppText variant="h2">{t('home.shortcuts_title')}</AppText>
        <View style={styles.shortcutGrid}>
          {shortcuts.map(shortcut => (
            <Pressable
              accessibilityLabel={`${t(shortcut.titleKey)}. ${shortcut.meta}`}
              accessibilityRole="button"
              key={shortcut.testID}
              onPress={shortcut.onPress}
              style={({pressed}) => [
                styles.shortcut,
                pressed && styles.pressed,
              ]}
              testID={shortcut.testID}
            >
              <View style={styles.shortcutIcon}>
                <MaterialIcon
                  color={theme.colors.primary}
                  name={shortcut.icon}
                  size={20}
                />
              </View>
              <View style={styles.shortcutCopy}>
                <AppText variant="h3" style={styles.shortcutTitle}>
                  {t(shortcut.titleKey)}
                </AppText>
                <AppText color="secondary" variant="label">
                  {shortcut.meta}
                </AppText>
              </View>
              <MaterialIcon
                color={theme.colors.text.secondary}
                name="chevron_right"
                size={20}
              />
            </Pressable>
          ))}
        </View>
        <View style={styles.inputSection} testID="home-input-source-section">
          <AppText variant="h2">{t('home.coming_soon')}</AppText>
          <View style={styles.inputSourceGrid}>
            {imageInputEnabled ? (
              <>
                <Pressable
                  accessibilityLabel={t('home.capture_photo_a11y')}
                  accessibilityRole="button"
                  onPress={() =>
                    navigation.navigate('ImageCapture', {sourceType: 'camera'})
                  }
                  style={({pressed}) => [
                    styles.inputSource,
                    pressed && styles.pressed,
                  ]}
                  testID="home-input-camera"
                >
                  <MaterialIcon color={theme.colors.primary} name="photo_camera" size={22} />
                  <AppText variant="h3">{t('home.capture_photo')}</AppText>
                </Pressable>
                <Pressable
                  accessibilityLabel={t('home.upload_image_a11y')}
                  accessibilityRole="button"
                  onPress={() =>
                    navigation.navigate('ImageCapture', {sourceType: 'gallery'})
                  }
                  style={({pressed}) => [
                    styles.inputSource,
                    pressed && styles.pressed,
                  ]}
                  testID="home-input-gallery"
                >
                  <MaterialIcon
                    color={theme.colors.primary}
                    name="add_photo_alternate"
                    size={22}
                  />
                  <AppText variant="h3">{t('home.upload_image')}</AppText>
                </Pressable>
              </>
            ) : null}
            {config.features.pasteTextInput ? (
              <Pressable
                accessibilityLabel={t('home.paste_text_a11y')}
                accessibilityRole="button"
                onPress={() => navigation.navigate('PasteText')}
                style={({pressed}) => [
                  styles.inputSource,
                  pressed && styles.pressed,
                ]}
                testID="home-input-paste"
              >
                <MaterialIcon color={theme.colors.primary} name="content_paste" size={22} />
                <AppText variant="h3">{t('home.paste_text')}</AppText>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    brand: {alignItems: 'center', flexDirection: 'row', gap: 10, minWidth: 0},
    brandText: {
      color: theme.colors.primary,
      fontSize: theme.typography.size.lg,
      fontWeight: theme.typography.weight.medium,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      height: 56,
      justifyContent: 'space-between',
      paddingHorizontal: theme.gutter,
    },
    hero: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      gap: theme.spacing.md,
      padding: theme.spacing.lg,
    },
    intro: {gap: theme.spacing.xs},
    inputSection: {gap: theme.spacing.sm},
    inputSource: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      flex: 1,
      gap: theme.spacing.sm,
      justifyContent: 'center',
      minHeight: 96,
      padding: theme.spacing.md,
    },
    inputSourceGrid: {flexDirection: 'row', gap: theme.spacing.sm},
    primaryAction: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.pill,
      justifyContent: 'center',
      minHeight: 52,
      paddingHorizontal: theme.spacing.lg,
    },
    primaryActionText: {
      color: theme.colors.text.inverse,
      fontWeight: theme.typography.weight.bold,
    },
    progressFill: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.pill,
      height: '100%',
      width: '0%',
    },
    progressRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    progressTrack: {
      backgroundColor: theme.colors.outlineVariant,
      borderRadius: theme.radius.pill,
      flex: 1,
      height: 8,
      overflow: 'hidden',
    },
    pressed: {opacity: theme.states.pressedOpacity},
    scrollContent: {
      gap: theme.spacing.lg,
      paddingBottom: 28,
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
    shortcut: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      minHeight: 88,
      padding: theme.spacing.md,
      width: '50%',
    },
    shortcutCopy: {flex: 1, gap: 2, minWidth: 0},
    shortcutGrid: {
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    shortcutIcon: {
      alignItems: 'center',
      backgroundColor: theme.colors.accentSoft,
      borderRadius: theme.radius.pill,
      height: 36,
      justifyContent: 'center',
      width: 36,
    },
    shortcutTitle: {fontSize: theme.typography.size.md},
  });
}
