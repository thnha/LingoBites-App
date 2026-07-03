import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {AppCard} from '../../components/AppCard';
import {AppText} from '../../components/AppText';
import {BottomActionBar} from '../../components/BottomActionBar';
import {Chip} from '../../components/Chip';
import {ImagePlaceholder} from '../../components/ImagePlaceholder';
import {LessonExploreRow} from '../../components/LessonExploreRow';
import {MaterialIcon} from '../../components/MaterialIcon';
import {SectionHeader} from '../../components/SectionHeader';
import {
  SAVE_LESSON_ERROR_MESSAGE,
  SAVE_LESSON_LABEL,
  SAVE_LESSON_SAVED_LABEL,
} from '../../shared/copy/userMessages';
import type {AIOutput} from '../../shared/schemas/ai-output-v1';
import {useAppTheme} from '../../theme';
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
}: Props) {
  const {theme} = useAppTheme();
  const sentences = lesson.sentences ?? [];
  const vocabulary = lesson.vocabulary ?? [];
  const grammarPoints = lesson.grammar_points ?? [];
  const practice = lesson.practice ?? [];
  const hasPronunciation =
    (lesson.pronunciation?.focus_words.length ?? 0) > 0 ||
    (lesson.pronunciation?.sentence_audio_texts.length ?? 0) > 0;

  const saveDisabled = saveState === 'saving' || saveState === 'saved';
  const saveLabel =
    saveState === 'saved' ? SAVE_LESSON_SAVED_LABEL : SAVE_LESSON_LABEL;

  return (
    <View style={{flex: 1}}>
      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            borderRadius: theme.radius.lg,
            height: 170,
            overflow: 'hidden',
            position: 'relative',
          }}>
          <ImagePlaceholder height={170} label={imageLabel ?? lesson.title} />
          <View
            style={{
              backgroundColor: 'rgba(0,40,36,0.55)',
              bottom: 0,
              left: 0,
              padding: 16,
              position: 'absolute',
              right: 0,
            }}>
            <AppText style={{color: '#ffffff', fontSize: 22, fontWeight: '600'}}>
              {lesson.title}
            </AppText>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8}}>
              <Chip label={lesson.detected_language || 'English'} tone="accent" />
              <Chip label={lesson.level} tone="gold" />
            </View>
          </View>
        </View>

        <AppCard
          style={{
            borderBottomColor: theme.colors.accentSoft,
            borderBottomWidth: 4,
            gap: theme.spacing.sm,
          }}>
          <View style={{alignItems: 'center', flexDirection: 'row', gap: 8}}>
            <MaterialIcon color={theme.colors.primary} name="description" size={22} />
            <AppText style={{color: theme.colors.primary, fontWeight: '600'}} variant="h3">
              Bản gốc
            </AppText>
          </View>
          <AppText color="secondary" variant="bodyLg">
            {lesson.original_text}
          </AppText>
        </AppCard>

        <AppCard
          style={{
            borderBottomColor: theme.colors.secondarySoft,
            borderBottomWidth: 4,
            gap: theme.spacing.sm,
          }}>
          <View style={{alignItems: 'center', flexDirection: 'row', gap: 8}}>
            <MaterialIcon color={theme.colors.secondary} name="translate" size={22} />
            <AppText style={{color: theme.colors.secondary, fontWeight: '600'}} variant="h3">
              Bản dịch
            </AppText>
          </View>
          <AppText color="secondary" variant="bodyLg">
            {lesson.vietnamese_translation}
          </AppText>
        </AppCard>

        <View style={{gap: 10}}>
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
      </ScrollView>

      <BottomActionBar
        style={{
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.outlineVariant,
          gap: theme.spacing.sm,
          paddingBottom: theme.spacing.lg,
        }}>
        <View style={{flexDirection: 'row', gap: theme.spacing.sm}}>
          <Pressable
            accessibilityLabel="Bắt đầu học"
            accessibilityRole="button"
            disabled={!onStartLearning}
            onPress={onStartLearning}
            style={({pressed}) => [
              {
                alignItems: 'center',
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.lg,
                flex: 1,
                flexDirection: 'row',
                gap: 8,
                justifyContent: 'center',
                minHeight: 52,
                opacity:
                  !onStartLearning || pressed ? theme.states.pressedOpacity : 1,
              },
            ]}>
            <MaterialIcon color={theme.colors.text.inverse} filled name="school" size={22} />
            <AppText style={{color: theme.colors.text.inverse, fontSize: 18, fontWeight: '600'}}>
              Bắt đầu học
            </AppText>
          </Pressable>
          <Pressable
            accessibilityLabel="Chia sẻ"
            accessibilityRole="button"
            style={({pressed}) => [
              {
                alignItems: 'center',
                backgroundColor: theme.colors.secondaryContainer,
                borderRadius: 18,
                height: 56,
                justifyContent: 'center',
                opacity: pressed ? theme.states.pressedOpacity : 1,
                width: 56,
              },
            ]}>
            <MaterialIcon color={theme.colors.text.inverse} name="share" size={22} />
          </Pressable>
        </View>
        {showSaveButton && onSave ? (
          <Pressable
            accessibilityLabel={saveLabel}
            accessibilityRole="button"
            disabled={saveDisabled}
            onPress={onSave}
            style={({pressed}) => [
              {
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary,
                borderRadius: theme.radius.lg,
                borderWidth: 2,
                flexDirection: 'row',
                gap: 8,
                justifyContent: 'center',
                minHeight: 52,
                opacity: saveDisabled
                  ? theme.states.disabledOpacity
                  : pressed
                    ? theme.states.pressedOpacity
                    : 1,
              },
            ]}>
            <MaterialIcon color={theme.colors.primary} name="bookmark_add" size={22} />
            <AppText style={{color: theme.colors.primary, fontSize: 18, fontWeight: '600'}}>
              {saveState === 'saving' ? 'Đang lưu...' : saveLabel}
            </AppText>
          </Pressable>
        ) : null}
        {saveState === 'error' ? (
          <AppText color="danger" style={{textAlign: 'center'}}>
            {saveErrorMessage ?? SAVE_LESSON_ERROR_MESSAGE}
          </AppText>
        ) : null}
      </BottomActionBar>
    </View>
  );
}
