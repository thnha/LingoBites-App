import React, {useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {AppButton} from '../../components/AppButton';
import {AppCard} from '../../components/AppCard';
import {AppText} from '../../components/AppText';
import {ChunkRow} from '../../components/ChunkRow';
import {QuizOption} from '../../components/QuizOption';
import {WordCard} from '../../components/WordCard';
import {
  EMPTY_GRAMMAR_MESSAGE,
  EMPTY_SECTION_MESSAGE,
  EMPTY_VOCABULARY_MESSAGE,
  SAVE_LESSON_ERROR_MESSAGE,
  SAVE_LESSON_LABEL,
  SAVE_LESSON_SAVED_LABEL,
} from '../../shared/copy/userMessages';
import type {
  AIOutput,
  GrammarPoint,
  Sentence,
  VocabularyItem,
} from '../../shared/schemas/ai-output-v1';
import {useAppTheme} from '../../theme';

const VISIBLE_VOCAB_LIMIT = 5;
const VISIBLE_GRAMMAR_LIMIT = 3;

export type LessonSaveState = 'unsaved' | 'saving' | 'saved' | 'error';

type Props = {
  lesson: AIOutput;
  saveState?: LessonSaveState;
  onSave?: () => void;
  saveErrorMessage?: string;
  showSaveButton?: boolean;
  /**
   * Drill-down callbacks. When provided, the matching list items become
   * tappable and open the dedicated detail screens. Gated by the
   * `shortPractice` feature flag at the screen layer.
   */
  onOpenSentence?: (sentence: Sentence, index: number, total: number) => void;
  onOpenWord?: (word: VocabularyItem) => void;
  onOpenGrammar?: (grammar: GrammarPoint) => void;
  onStartPractice?: () => void;
};

export function LessonResultView({
  lesson,
  saveState = 'unsaved',
  onSave,
  saveErrorMessage,
  showSaveButton = true,
  onOpenSentence,
  onOpenWord,
  onOpenGrammar,
  onStartPractice,
}: Props) {
  const {theme} = useAppTheme();
  const [vocabExpanded, setVocabExpanded] = useState(false);

  const sentences = lesson.sentences ?? [];
  const vocabulary = lesson.vocabulary ?? [];
  const grammarPoints = lesson.grammar_points ?? [];

  const visibleVocabulary =
    vocabExpanded || vocabulary.length <= VISIBLE_VOCAB_LIMIT
      ? vocabulary
      : vocabulary.slice(0, VISIBLE_VOCAB_LIMIT);
  const hiddenVocabCount = Math.max(
    vocabulary.length - VISIBLE_VOCAB_LIMIT,
    0,
  );
  const visibleGrammar = grammarPoints.slice(0, VISIBLE_GRAMMAR_LIMIT);
  const pronunciation = lesson.pronunciation ?? {
    sentence_audio_texts: [],
    focus_words: [],
  };
  const practice = lesson.practice ?? [];
  const hasPronunciation =
    pronunciation.focus_words.length > 0 ||
    pronunciation.sentence_audio_texts.length > 0;

  const saveDisabled = saveState === 'saving' || saveState === 'saved';
  const saveLabel =
    saveState === 'saved' ? SAVE_LESSON_SAVED_LABEL : SAVE_LESSON_LABEL;

  const saveBackground =
    saveState === 'saved'
      ? theme.colors.border
      : saveState === 'error'
        ? theme.colors.danger
        : theme.components.button.primary.background;

  const saveTextColor =
    saveState === 'saved'
      ? theme.colors.text.secondary
      : theme.components.button.primary.text;

  return (
    <ScrollView
      contentContainerStyle={{
        padding: theme.spacing.xl,
        gap: theme.spacing.lg,
        paddingBottom: theme.spacing.xxl,
      }}>
      <AppText variant="title">{lesson.title}</AppText>
      <AppText color="muted">
        {lesson.detected_language} · {lesson.level}
      </AppText>

      <Section title="Bản gốc">
        <AppText>{lesson.original_text}</AppText>
      </Section>

      <Section title="Dịch tiếng Việt">
        <AppText>{lesson.vietnamese_translation}</AppText>
      </Section>

      <Section title="Tóm tắt">
        <AppText>
          {lesson.summary || 'Chưa có tóm tắt cho đoạn này.'}
        </AppText>
      </Section>

      <Section title="Tách câu">
        {sentences.length === 0 ? (
          <EmptyText />
        ) : (
          sentences.map((sentence, sentenceIndex) => (
            <Tappable
              key={sentence.id}
              accessibilityLabel={sentence.original}
              onPress={
                onOpenSentence
                  ? () => onOpenSentence(sentence, sentenceIndex, sentences.length)
                  : undefined
              }>
              <AppCard>
                <ChunkRow
                  original={sentence.original}
                  translation={sentence.translation}
                  hint={sentence.simple_meaning}
                />
              </AppCard>
            </Tappable>
          ))
        )}
      </Section>

      <Section title={`Từ vựng (${vocabulary.length})`}>
        {vocabulary.length === 0 ? (
          <EmptyText message={EMPTY_VOCABULARY_MESSAGE} />
        ) : (
          <>
            {visibleVocabulary.map(item => (
              <Tappable
                key={item.id}
                accessibilityLabel={item.word}
                onPress={onOpenWord ? () => onOpenWord(item) : undefined}>
                <WordCard
                  word={item.word}
                  meaning={item.meaning_vi}
                  example={item.example}
                />
              </Tappable>
            ))}
            {!vocabExpanded && hiddenVocabCount > 0 ? (
              <Pressable
                onPress={() => setVocabExpanded(true)}
                style={{alignSelf: 'flex-start', paddingVertical: theme.spacing.xs}}>
                <AppText
                  style={{
                    color: theme.colors.primary,
                    fontWeight: theme.typography.weight.bold,
                  }}>
                  xem thêm ({hiddenVocabCount})
                </AppText>
              </Pressable>
            ) : null}
          </>
        )}
      </Section>

      <Section title={`Ngữ pháp (${grammarPoints.length})`}>
        {grammarPoints.length === 0 ? (
          <EmptyText message={EMPTY_GRAMMAR_MESSAGE} />
        ) : (
          visibleGrammar.map(item => (
            <Tappable
              key={item.id}
              accessibilityLabel={item.vietnamese_name || item.name}
              onPress={onOpenGrammar ? () => onOpenGrammar(item) : undefined}>
              <AppCard style={{gap: theme.spacing.xs}}>
                <AppText style={{fontWeight: theme.typography.weight.bold}}>
                  {item.vietnamese_name || item.name}
                </AppText>
                <AppText>{item.explanation_vi}</AppText>
              </AppCard>
            </Tappable>
          ))
        )}
      </Section>

      <Section title="Luyện phát âm">
        {!hasPronunciation ? (
          <EmptyText />
        ) : (
          <>
            {pronunciation.focus_words.map(word => (
              <AppCard key={word.word} style={{gap: theme.spacing.xs}}>
                <AppText style={{fontWeight: theme.typography.weight.bold}}>
                  {word.word}
                </AppText>
                {word.pronunciation_guide_vi ? (
                  <AppText>{word.pronunciation_guide_vi}</AppText>
                ) : null}
                {word.tip_vi ? (
                  <AppText color="muted">{word.tip_vi}</AppText>
                ) : null}
              </AppCard>
            ))}
            {pronunciation.sentence_audio_texts.map(sentence => (
              <AppCard key={sentence} style={{gap: theme.spacing.xs}}>
                <AppText>{sentence}</AppText>
              </AppCard>
            ))}
          </>
        )}
      </Section>

      <Section title="Luyện tập">
        {practice.length === 0 ? (
          <EmptyText />
        ) : (
          <>
            {onStartPractice ? (
              <AppButton title="Luyện tập nhanh" onPress={onStartPractice} />
            ) : null}
            {practice.map(item => (
              <View key={item.id} style={{gap: theme.spacing.sm}}>
                <AppText variant="label">{item.question}</AppText>
                <QuizOption label={`Đáp án: ${item.answer}`} />
              </View>
            ))}
          </>
        )}
      </Section>

      {showSaveButton ? (
        <>
          {saveState === 'unsaved' || saveState === 'saving' ? (
            <AppButton
              title={saveLabel}
              loading={saveState === 'saving'}
              disabled={saveDisabled}
              onPress={onSave}
              testID={
                saveDisabled ? 'save-lesson-disabled' : 'save-lesson-enabled'
              }
            />
          ) : (
            <Pressable
              disabled={saveDisabled}
              onPress={onSave}
              style={({pressed}) => [
                {
                  alignItems: 'center',
                  backgroundColor: saveBackground,
                  borderRadius: theme.components.button.primary.radius,
                  justifyContent: 'center',
                  marginTop: theme.spacing.sm,
                  minHeight: theme.components.button.primary.height,
                  opacity: saveDisabled ? theme.states.disabledOpacity : 1,
                },
                pressed && !saveDisabled && {opacity: theme.states.pressedOpacity},
              ]}
              testID={
                saveDisabled ? 'save-lesson-disabled' : 'save-lesson-enabled'
              }>
              <AppText
                style={{
                  color: saveTextColor,
                  fontWeight: theme.typography.weight.bold,
                }}>
                {saveLabel}
              </AppText>
            </Pressable>
          )}
          {saveState === 'error' ? (
            <AppText color="danger" style={{textAlign: 'center'}}>
              {saveErrorMessage ?? SAVE_LESSON_ERROR_MESSAGE}
            </AppText>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

function Section({title, children}: React.PropsWithChildren<{title: string}>) {
  const {theme} = useAppTheme();
  return (
    <View style={{gap: theme.spacing.sm}}>
      <AppText variant="subtitle" style={{fontWeight: theme.typography.weight.bold}}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

function EmptyText({message = EMPTY_SECTION_MESSAGE}: {message?: string}) {
  return <AppText color="muted">{message}</AppText>;
}

/**
 * Wraps a list item so it becomes a button when `onPress` is provided, and
 * renders inert content otherwise (used when drill-down is feature-gated off).
 */
function Tappable({
  onPress,
  accessibilityLabel,
  children,
}: React.PropsWithChildren<{onPress?: () => void; accessibilityLabel?: string}>) {
  const {theme} = useAppTheme();
  if (!onPress) {
    return <>{children}</>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({pressed}) => (pressed ? {opacity: theme.states.pressedOpacity} : null)}>
      {children}
    </Pressable>
  );
}
