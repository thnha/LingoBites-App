import React, {useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useAppTheme, type AppTheme} from '@theme';
import {blockBaseStyles} from './blockStyles';
import type {
  CurriculumLessonAnswerInput,
  CurriculumLessonCheckResult,
} from './curriculumLessonClient';
import type {CurriculumLessonExercise} from './curriculumLessonSchema';

export type CurriculumLessonCheckFn = (
  exerciseId: string,
  answer: CurriculumLessonAnswerInput,
) => Promise<CurriculumLessonCheckResult>;

type Props = {
  exercise: CurriculumLessonExercise;
  onCheckExercise: CurriculumLessonCheckFn;
};

type Feedback =
  | {state: 'correct'; message: string}
  | {state: 'incorrect'; message: string}
  | {state: 'error'; message: string};

function extraStyles(theme: AppTheme) {
  return StyleSheet.create({
    options: {
      gap: theme.spacing.sm,
    },
    option: {
      alignItems: 'center',
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      minHeight: 48,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    optionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
    },
    optionLabel: {
      color: theme.colors.text.primary,
      flex: 1,
      fontSize: theme.typography.size.md,
    },
    feedbackCorrect: {
      backgroundColor: theme.colors.secondarySoft,
      borderColor: theme.colors.secondary,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      gap: theme.spacing.xs,
      padding: theme.spacing.md,
    },
    feedbackIncorrect: {
      backgroundColor: theme.colors.surfaceMuted,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      gap: theme.spacing.xs,
      padding: theme.spacing.md,
    },
    feedbackTitle: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.bold,
    },
    feedbackBody: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.size.sm,
    },
    pendingRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
  });
}

function feedbackFromResult(result: CurriculumLessonCheckResult): Feedback {
  if (!result.ok) {
    return {state: 'error', message: result.message};
  }
  const lines = Object.values(result.explanation);
  const detail = lines.length > 0 ? lines.join('\n') : null;
  if (result.correct) {
    return {
      state: 'correct',
      message: detail ?? 'Correct!',
    };
  }
  return {
    state: 'incorrect',
    message: detail ?? 'Not quite — try again.',
  };
}

/**
 * Renders an `exercise` block (multiple choice). All interaction state is
 * local: the selected option, the pending submission, and the feedback.
 * The server check itself is injected via `onCheckExercise` so this
 * renderer never touches the network; duplicate taps while a check is
 * pending are suppressed as UX only.
 */
export function ExerciseBlockView({exercise, onCheckExercise}: Props) {
  const {theme} = useAppTheme();
  const styles = blockBaseStyles(theme);
  const extra = extraStyles(theme);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const submit = async () => {
    if (pending || !selectedOptionId) {
      return;
    }
    setPending(true);
    setFeedback(null);
    try {
      const result = await onCheckExercise(exercise.id, {
        optionId: selectedOptionId,
      });
      setFeedback(feedbackFromResult(result));
    } catch {
      setFeedback({
        state: 'error',
        message: 'Could not check your answer. Please try again.',
      });
    } finally {
      setPending(false);
    }
  };

  const optionsDisabled = pending;
  const submitDisabled = pending || !selectedOptionId;

  return (
    <View testID="block-exercise">
      <Text testID="block-exercise-instruction" style={styles.secondary}>
        {exercise.instruction}
      </Text>
      <Text testID="block-exercise-prompt" style={styles.title}>
        {exercise.prompt}
      </Text>
      <View testID="block-exercise-options" style={extra.options}>
        {exercise.config.options.map(option => {
          const selected = option.id === selectedOptionId;
          return (
            <Pressable
              key={option.id}
              testID={`exercise-option-${option.id}`}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityHint="Selects this answer"
              accessibilityState={{
                selected,
                disabled: optionsDisabled,
              }}
              disabled={optionsDisabled}
              onPress={() => setSelectedOptionId(option.id)}
            >
              <View
                style={[extra.option, selected ? extra.optionSelected : null]}
              >
                <Text style={extra.optionLabel}>{option.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {pending ? (
        <View testID="exercise-pending" style={extra.pendingRow}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.secondary}>Checking your answer…</Text>
        </View>
      ) : null}
      <Pressable
        testID="exercise-submit"
        accessibilityRole="button"
        accessibilityLabel="Check answer"
        accessibilityHint="Submits the selected answer for checking"
        accessibilityState={{disabled: submitDisabled}}
        disabled={submitDisabled}
        onPress={submit}
        style={[styles.button, submitDisabled ? styles.buttonDisabled : null]}
      >
        <Text style={styles.buttonText}>Check</Text>
      </Pressable>
      {feedback ? (
        <View
          testID={`exercise-feedback-${feedback.state}`}
          style={
            feedback.state === 'correct'
              ? extra.feedbackCorrect
              : extra.feedbackIncorrect
          }
        >
          <Text style={extra.feedbackTitle}>
            {feedback.state === 'correct'
              ? 'Correct!'
              : feedback.state === 'incorrect'
              ? 'Not quite'
              : 'Something went wrong'}
          </Text>
          <Text testID="exercise-feedback-message" style={extra.feedbackBody}>
            {feedback.message}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
