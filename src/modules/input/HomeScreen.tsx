import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {
  HomeStackParamList,
  RootTabParamList,
} from '../../app/navigation/types';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import {IconButton} from '../../components/IconButton';
import {MaterialIcon} from '../../components/MaterialIcon';
import {Medallion} from '../../components/Medallion';
import {RecentLessonRow} from '../../components/RecentLessonRow';
import {SectionHeader} from '../../components/SectionHeader';
import {useFeatureEnabled} from '../../release';
import {NO_LESSONS_MESSAGE} from '../../shared/copy/userMessages';
import {getDueFlashcards} from '../../shared/db/FlashcardRepository';
import {listLessons} from '../../shared/db/LessonRepository';
import {useAppTheme, type AppTheme} from '../../theme';
import type {LessonCardView} from '../../types/lesson';
import {trackEvent} from '../analytics';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

export function HomeScreen({navigation}: Props) {
  const {theme} = useAppTheme();
  const themedStyles = useMemo(() => makeStyles(theme), [theme]);
  const {t} = useTranslation();
  const reviewSystemEnabled = useFeatureEnabled('reviewSystem');
  const mvpReviewFlowEnabled = useFeatureEnabled('lingobitesMvpReviewFlow');
  const tabNavigation =
    navigation.getParent<NavigationProp<RootTabParamList>>();
  const [recentLessons, setRecentLessons] = useState<LessonCardView[]>([]);
  const [dueReviewCount, setDueReviewCount] = useState(0);

  function selectInputMethod(method: 'camera' | 'gallery' | 'paste_text') {
    trackEvent('input_method_selected', {method, screen: 'Home'});
    if (method === 'camera') {
      navigation.navigate('ImageCapture', {sourceType: 'camera'});
      return;
    }
    if (method === 'gallery') {
      navigation.navigate('ImageCapture', {sourceType: 'gallery'});
      return;
    }
    navigation.navigate('PasteText');
  }

  useFocusEffect(
    useCallback(() => {
      setRecentLessons(
        listLessons(3).map(item => ({
          id: item.id,
          title: item.title,
          meta: t('home.vocab_count', {count: item.vocabularyCount}),
          blurb: item.previewText,
        })),
      );
      setDueReviewCount(reviewSystemEnabled ? getDueFlashcards().length : 0);
    }, [reviewSystemEnabled, t]),
  );

  const emptyRecent = useMemo(
    () => recentLessons.length === 0,
    [recentLessons],
  );

  return (
    <AppScreen>
      <View style={themedStyles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialIcon
            color={theme.colors.primary}
            name="translate"
            size={26}
          />
          <AppText numberOfLines={1} style={themedStyles.headerTitle}>
            {t('app.name')}
          </AppText>
        </View>
        <IconButton
          accessibilityLabel={t('home.settings_a11y')}
          icon="settings"
          onPress={() => tabNavigation?.navigate('Profile')}
          tone="surface"
        />
      </View>

      <ScrollView
        contentContainerStyle={themedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCopy}>
          <AppText variant="h1">{t('home.title')}</AppText>
          <AppText color="secondary" variant="body">
            {t(mvpReviewFlowEnabled ? 'home.mvp_subtitle' : 'home.subtitle')}
          </AppText>
        </View>

        {reviewSystemEnabled && dueReviewCount > 0 ? (
          <Pressable
            accessibilityLabel={t('home.daily_review_widget_a11y')}
            accessibilityRole="button"
            onPress={() => navigation.navigate('DailyReview')}
            style={({pressed}) => [
              themedStyles.dailyReviewCard,
              pressed && themedStyles.pressed,
            ]}
            testID="daily-review-widget"
          >
            <View style={themedStyles.dailyReviewIcon}>
              <MaterialIcon
                color={theme.colors.primary}
                name="refresh"
                size={26}
              />
            </View>
            <View style={styles.dailyReviewCopy}>
              <AppText variant="h3">
                {t('home.daily_review_widget_title')}
              </AppText>
              <AppText color="secondary" variant="label">
                {t('home.daily_review_widget_due', {count: dueReviewCount})}
              </AppText>
            </View>
            <MaterialIcon
              color={theme.colors.primary}
              name="chevron_right"
              size={24}
            />
          </Pressable>
        ) : null}

        {mvpReviewFlowEnabled ? (
          <View style={themedStyles.mvpCard} testID="mvp-no-content-card">
            <View style={themedStyles.mvpIcon}>
              <MaterialIcon
                color={theme.colors.primary}
                name="menu_book"
                size={30}
              />
            </View>
            <AppText style={styles.centerText} variant="h3">
              {t('home.mvp_content_title')}
            </AppText>
            <AppText color="secondary" style={styles.centerText}>
              {t('home.mvp_content_body')}
            </AppText>
            <Pressable
              accessibilityLabel={t('home.mvp_open_lessons_a11y')}
              accessibilityRole="button"
              onPress={() => tabNavigation?.navigate('Lessons')}
              style={({pressed}) => [
                themedStyles.mvpButton,
                pressed && themedStyles.pressed,
              ]}
              testID="mvp-open-lessons"
            >
              <AppText style={themedStyles.mvpButtonText}>
                {t('home.mvp_open_lessons')}
              </AppText>
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable
              accessibilityLabel={t('home.capture_photo_a11y')}
              accessibilityRole="button"
              onPress={() => selectInputMethod('camera')}
              style={({pressed}) => [
                themedStyles.cameraButton,
                pressed && themedStyles.pressed,
              ]}
            >
              <View style={themedStyles.cameraIcon}>
                <MaterialIcon
                  color={theme.colors.accentInk}
                  filled
                  name="photo_camera"
                  size={42}
                />
              </View>
              <AppText style={themedStyles.cameraTitle}>
                {t('home.capture_photo')}
              </AppText>
              <AppText style={themedStyles.cameraHint}>
                {t('home.capture_photo_hint')}
              </AppText>
            </Pressable>

            <View style={styles.inputActions}>
              <Pressable
                accessibilityLabel={t('home.upload_image_a11y')}
                accessibilityRole="button"
                onPress={() => selectInputMethod('gallery')}
                style={({pressed}) => [
                  themedStyles.galleryButton,
                  pressed && themedStyles.pressed,
                ]}
              >
                <MaterialIcon
                  color={theme.colors.text.inverse}
                  name="upload_file"
                  size={30}
                />
                <AppText style={themedStyles.galleryButtonText}>
                  {t('home.upload_image')}
                </AppText>
              </Pressable>

              <Pressable
                accessibilityLabel={t('home.paste_text_a11y')}
                accessibilityRole="button"
                onPress={() => selectInputMethod('paste_text')}
                style={({pressed}) => [
                  themedStyles.pasteButton,
                  pressed && themedStyles.pressed,
                ]}
              >
                <MaterialIcon
                  color={theme.colors.primary}
                  name="content_paste"
                  size={30}
                />
                <AppText style={themedStyles.pasteButtonText}>
                  {t('home.paste_text')}
                </AppText>
              </Pressable>
            </View>
          </>
        )}

        <View style={styles.recentSection}>
          <SectionHeader
            title={t('home.recent_lessons')}
            action={
              <Pressable
                accessibilityLabel={t('home.view_all_a11y')}
                accessibilityRole="button"
                onPress={() => tabNavigation?.navigate('Lessons')}
                style={styles.viewAllButton}
              >
                <AppText style={themedStyles.viewAllText}>
                  {t('home.view_all')}
                </AppText>
              </Pressable>
            }
          />
          {emptyRecent ? (
            <View style={themedStyles.emptyRecent}>
              <Medallion label="📚" />
              <AppText color="secondary">
                {mvpReviewFlowEnabled
                  ? t('home.mvp_empty_lessons')
                  : NO_LESSONS_MESSAGE}
              </AppText>
            </View>
          ) : (
            recentLessons.map((item, index) => (
              <RecentLessonRow
                key={item.id}
                index={index}
                lesson={item}
                onPress={() =>
                  navigation.navigate('SavedLessonDetail', {lessonId: item.id})
                }
              />
            ))
          )}
        </View>

        {!mvpReviewFlowEnabled ? (
          <View style={themedStyles.tipCard}>
            <MaterialIcon
              color={theme.colors.tertiary}
              name="lightbulb"
              size={22}
            />
            <AppText style={themedStyles.tipText}>{t('home.tip')}</AppText>
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: 'center',
  },
  dailyReviewCopy: {
    flex: 1,
    gap: 2,
  },
  headerTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  heroCopy: {
    gap: 6,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 14,
  },
  recentSection: {
    gap: 10,
  },
  viewAllButton: {
    justifyContent: 'center',
    minHeight: 44,
  },
});

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    cameraButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.xl,
      elevation: 8,
      gap: 10,
      opacity: 1,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xxl,
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 16},
      shadowOpacity: 0.16,
      shadowRadius: 34,
    },
    cameraHint: {
      color: theme.colors.accentInk,
      fontSize: theme.typography.size.xs,
      opacity: 0.85,
    },
    cameraIcon: {
      alignItems: 'center',
      backgroundColor: theme.colors.overlayLight,
      borderRadius: theme.radius.pill,
      height: 84,
      justifyContent: 'center',
      width: 84,
    },
    cameraTitle: {
      color: theme.colors.accentInk,
      fontSize: theme.typography.presets.h2.fontSize,
      fontWeight: theme.typography.weight.medium,
    },
    dailyReviewCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.accent,
      borderRadius: theme.radius.lg,
      borderWidth: 1.5,
      flexDirection: 'row',
      gap: theme.spacing.md,
      opacity: 1,
      padding: theme.spacing.lg,
      ...theme.shadow.soft,
    },
    dailyReviewIcon: {
      alignItems: 'center',
      backgroundColor: theme.colors.accentSoft,
      borderRadius: theme.radius.pill,
      height: 48,
      justifyContent: 'center',
      width: 48,
    },
    emptyRecent: {
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    galleryButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.secondaryContainer,
      borderRadius: theme.radius.lg,
      flex: 1,
      gap: 10,
      opacity: 1,
      paddingHorizontal: 14,
      paddingVertical: 22,
      ...theme.shadow.strong,
    },
    galleryButtonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.size.sm,
      fontWeight: theme.typography.weight.medium,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      height: 56,
      justifyContent: 'space-between',
      paddingHorizontal: theme.gutter,
    },
    headerTitle: {
      color: theme.colors.primary,
      fontSize: theme.typography.size.lg,
      fontWeight: theme.typography.weight.medium,
    },
    mvpButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.pill,
      marginTop: theme.spacing.sm,
      opacity: 1,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    mvpButtonText: {
      color: theme.colors.primary,
      fontWeight: theme.typography.weight.medium,
    },
    mvpCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.accentSoft,
      borderRadius: theme.radius.xl,
      gap: theme.spacing.sm,
      padding: theme.spacing.xl,
    },
    mvpIcon: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.pill,
      height: 64,
      justifyContent: 'center',
      width: 64,
    },
    pasteButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.accentSoft,
      borderRadius: theme.radius.lg,
      borderWidth: 2,
      elevation: 2,
      flex: 1,
      gap: 10,
      opacity: 1,
      paddingHorizontal: 14,
      paddingVertical: 22,
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.05,
      shadowRadius: 22,
    },
    pasteButtonText: {
      color: theme.colors.primary,
      fontSize: theme.typography.size.sm,
      fontWeight: theme.typography.weight.medium,
    },
    pressed: {
      opacity: theme.states.pressedOpacity,
    },
    scrollContent: {
      gap: theme.spacing.lg,
      paddingBottom: 28,
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
    tipCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.tertiarySoft,
      borderRadius: theme.radius.lg,
      flexDirection: 'row',
      gap: theme.spacing.md,
      padding: theme.spacing.lg,
    },
    tipText: {
      color: theme.colors.tertiary,
      flex: 1,
      fontSize: 13,
      fontWeight: theme.typography.weight.medium,
    },
    viewAllText: {
      color: theme.colors.primary,
      fontWeight: theme.typography.weight.medium,
    },
  });
}
