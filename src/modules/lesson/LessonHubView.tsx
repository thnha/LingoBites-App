import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {AppCard} from '../../components/AppCard';
import {AppText} from '../../components/AppText';
import {BottomActionBar} from '../../components/BottomActionBar';
import {Chip} from '../../components/Chip';
import {ImagePlaceholder} from '../../components/ImagePlaceholder';
import {LessonExploreRow} from '../../components/LessonExploreRow';
import {MaterialIcon} from '../../components/MaterialIcon';
import {SectionHeader} from '../../components/SectionHeader';
import {WordCard} from '../../components/WordCard';
import {useTranslation} from 'react-i18next';
import type {AIOutput, VocabularyItem} from '../../shared/schemas/ai-output-v1';
import {useAppTheme, type AppTheme} from '../../theme';
import type {LessonSaveState} from './LessonResultView';

type Props = {
  lesson: AIOutput;
  imageLabel?: string;
  saveState?: LessonSaveState;
  showSaveButton?: boolean;
  onSave?: () => void;
  saveErrorMessage?: string;
  onOpenSentence?: () => void;
  onOpenVocabulary?: () => void;
  onOpenGrammar?: () => void;
  onOpenPronunciation?: () => void;
  onStartPractice?: () => void;
  onStartLearning?: () => void;
  savedVocabularyIds?: ReadonlySet<string>;
  onToggleWordSave?: (word: VocabularyItem) => void;
};

export function LessonHubView({
  lesson,
  imageLabel,
  saveState = 'unsaved',
  showSaveButton = true,
  onSave,
  saveErrorMessage,
  onOpenSentence,
  onOpenVocabulary,
  onOpenGrammar,
  onOpenPronunciation,
  onStartPractice,
  onStartLearning,
  savedVocabularyIds,
  onToggleWordSave,
}: Props) {
  const {theme} = useAppTheme();
  const {t} = useTranslation();
  const themedStyles = React.useMemo(() => makeStyles(theme), [theme]);
  const sentences = lesson.sentences ?? [];
  const vocabulary = lesson.vocabulary ?? [];
  const grammarPoints = lesson.grammar_points ?? [];
  const practice = lesson.practice ?? [];
  const hasPronunciation =
    (lesson.pronunciation?.focus_words.length ?? 0) > 0 ||
    (lesson.pronunciation?.sentence_audio_texts.length ?? 0) > 0;

  const saveDisabled = saveState === 'saving' || saveState === 'saved';
  const saveLabel =
    saveState === 'saved' ? t('lesson.saved_label') : t('lesson.save_label');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={themedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={themedStyles.heroImage}>
          <ImagePlaceholder height={170} label={imageLabel ?? lesson.title} />
          <View style={themedStyles.heroOverlay}>
            <AppText style={themedStyles.heroTitle}>{lesson.title}</AppText>
            <View style={styles.heroChips}>
              <Chip
                label={lesson.detected_language || 'English'}
                tone="accent"
              />
              <Chip label={lesson.level} tone="gold" />
            </View>
          </View>
        </View>

        <AppCard style={themedStyles.originalCard}>
          <View style={styles.sectionTitleRow}>
            <MaterialIcon
              color={theme.colors.primary}
              name="description"
              size={22}
            />
            <AppText style={themedStyles.originalTitle} variant="h3">
              Bản gốc
            </AppText>
          </View>
          <AppText color="secondary" variant="bodyLg">
            {lesson.original_text}
          </AppText>
        </AppCard>

        <AppCard style={themedStyles.translationCard}>
          <View style={styles.sectionTitleRow}>
            <MaterialIcon
              color={theme.colors.secondary}
              name="translate"
              size={22}
            />
            <AppText style={themedStyles.translationTitle} variant="h3">
              Bản dịch
            </AppText>
          </View>
          <AppText color="secondary" variant="bodyLg">
            {lesson.vietnamese_translation}
          </AppText>
        </AppCard>

        <View style={styles.exploreSection}>
          <SectionHeader title="Khám phá bài học" />
          <LessonExploreRow
            disabled={sentences.length === 0}
            icon="menu_book"
            medallionTone="teal"
            onPress={onOpenSentence}
            subtitle="Tách từng câu thành các cụm nghĩa"
            title="Học từng câu"
          />
          <LessonExploreRow
            disabled={vocabulary.length === 0}
            icon="style"
            medallionTone="coral"
            onPress={onOpenVocabulary}
            subtitle="Những từ đáng nhớ nhất"
            title="Từ vựng chính"
          />
          <LessonExploreRow
            disabled={grammarPoints.length === 0}
            icon="rule"
            medallionTone="gold"
            onPress={onOpenGrammar}
            subtitle="Thì và cấu trúc trong bài"
            title="Ngữ pháp trong ngữ cảnh"
          />
          <LessonExploreRow
            disabled={!hasPronunciation && sentences.length === 0}
            icon="mic"
            medallionTone="teal"
            onPress={onOpenPronunciation}
            subtitle="Nghe và lặp lại to"
            title="Phát âm"
          />
          <LessonExploreRow
            badge={practice.length > 0 ? 'HOT' : undefined}
            disabled={practice.length === 0}
            icon="bolt"
            medallionTone="coral"
            onPress={onStartPractice}
            subtitle="Quiz nhanh cho bài này"
            title="Luyện tập nhanh"
          />
        </View>

        {vocabulary.length > 0 ? (
          <View style={themedStyles.vocabularySection}>
            <SectionHeader title="Từ vựng chính" />
            {vocabulary.map(item => (
              <WordCard
                key={item.id}
                word={item.word}
                meaning={item.meaning_vi}
                example={item.example}
                saved={savedVocabularyIds?.has(item.id) ?? false}
                onToggleSave={
                  onToggleWordSave ? () => onToggleWordSave(item) : undefined
                }
                saveTestID={`word-card-save-${item.id}`}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>

      <BottomActionBar style={themedStyles.actionBar}>
        <View style={themedStyles.actionRow}>
          <Pressable
            accessibilityLabel="Bắt đầu học"
            accessibilityRole="button"
            disabled={!onStartLearning}
            onPress={onStartLearning}
            style={({pressed}) => [
              themedStyles.primaryAction,
              (!onStartLearning || pressed) && themedStyles.pressed,
            ]}
          >
            <MaterialIcon
              color={theme.colors.text.inverse}
              name="school"
              size={22}
            />
            <AppText style={themedStyles.primaryActionText}>
              Bắt đầu học
            </AppText>
          </Pressable>
          <Pressable
            accessibilityLabel="Chia sẻ"
            accessibilityRole="button"
            style={({pressed}) => [
              themedStyles.shareButton,
              pressed && themedStyles.pressed,
            ]}
          >
            <MaterialIcon
              color={theme.colors.text.inverse}
              name="share"
              size={22}
            />
          </Pressable>
        </View>
        {showSaveButton && onSave ? (
          <Pressable
            accessibilityLabel={saveLabel}
            accessibilityRole="button"
            disabled={saveDisabled}
            onPress={onSave}
            style={({pressed}) => [
              themedStyles.saveButton,
              saveDisabled
                ? themedStyles.disabled
                : pressed && themedStyles.pressed,
            ]}
          >
            <MaterialIcon
              color={theme.colors.primary}
              name="bookmark_add"
              size={22}
            />
            <AppText style={themedStyles.saveButtonText}>
              {saveState === 'saving' ? 'Đang lưu...' : saveLabel}
            </AppText>
          </Pressable>
        ) : null}
        {saveState === 'error' ? (
          <AppText color="danger" style={styles.centerText}>
            {saveErrorMessage ?? t('errors.save_lesson_failed')}
          </AppText>
        ) : null}
      </BottomActionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  exploreSection: {
    gap: 10,
  },
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    actionBar: {
      backgroundColor: theme.colors.background,
      borderTopColor: theme.colors.outlineVariant,
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing.lg,
    },
    actionRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    disabled: {
      opacity: theme.states.disabledOpacity,
    },
    heroImage: {
      borderRadius: theme.radius.lg,
      height: 170,
      overflow: 'hidden',
      position: 'relative',
    },
    heroOverlay: {
      backgroundColor: theme.colors.overlay,
      bottom: 0,
      left: 0,
      padding: theme.spacing.lg,
      position: 'absolute',
      right: 0,
    },
    heroTitle: {
      color: theme.colors.onOverlay,
      fontSize: theme.typography.presets.h2.fontSize,
      fontWeight: theme.typography.weight.medium,
    },
    originalCard: {
      borderBottomColor: theme.colors.accentSoft,
      borderBottomWidth: 4,
      gap: theme.spacing.sm,
    },
    originalTitle: {
      color: theme.colors.primary,
      fontWeight: theme.typography.weight.medium,
    },
    pressed: {
      opacity: theme.states.pressedOpacity,
    },
    primaryAction: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.lg,
      flex: 1,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      minHeight: 52,
      opacity: 1,
    },
    primaryActionText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.medium,
    },
    saveButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.primary,
      borderRadius: theme.radius.lg,
      borderWidth: 2,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      minHeight: 52,
      opacity: 1,
    },
    saveButtonText: {
      color: theme.colors.primary,
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.medium,
    },
    scrollContent: {
      gap: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
    shareButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.secondaryContainer,
      borderRadius: 18,
      height: 56,
      justifyContent: 'center',
      opacity: 1,
      width: 56,
    },
    translationCard: {
      borderBottomColor: theme.colors.secondarySoft,
      borderBottomWidth: 4,
      gap: theme.spacing.sm,
    },
    translationTitle: {
      color: theme.colors.secondary,
      fontWeight: theme.typography.weight.medium,
    },
    vocabularySection: {
      gap: theme.spacing.sm,
    },
  });
}
