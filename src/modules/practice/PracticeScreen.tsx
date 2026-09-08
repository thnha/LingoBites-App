import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {
  HomeStackParamList,
  LessonsStackParamList,
} from '@/app/navigation/types';
import {AppButton} from '@components/AppButton';
import {AppCard} from '@components/AppCard';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {HandoffProgressTrack} from '@components/HandoffProgressTrack';
import {IconButton} from '@components/IconButton';
import {ImagePlaceholder} from '@components/ImagePlaceholder';
import {MaterialIcon} from '@components/MaterialIcon';
import {ScreenHeader} from '@components/ScreenHeader';
import {useTranslation} from 'react-i18next';
import {useAppTheme, type AppTheme} from '@theme';
import {useQuiz} from './useQuiz';

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'Practice'>
  | NativeStackScreenProps<LessonsStackParamList, 'Practice'>;

export function PracticeScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const {t} = useTranslation();
  const themedStyles = React.useMemo(() => makeStyles(theme), [theme]);
  const {questions, title} = route.params;
  const quiz = useQuiz(questions);

  const headerTitle = title ?? 'Luyện tập nhanh';

  if (questions.length === 0) {
    return (
      <AppScreen>
        <ScreenHeader
          onBack={() => navigation.goBack()}
          rightAction={
            <IconButton
              accessibilityLabel="Đóng"
              icon="close"
              iconSize={24}
              onPress={() => navigation.goBack()}
              tone="bare"
            />
          }
          title={headerTitle}
        />
        <View style={themedStyles.emptyState}>
          <AppText color="muted" style={styles.centerText}>
            {t('errors.empty_section')}
          </AppText>
        </View>
      </AppScreen>
    );
  }

  const {state, current, total, accuracy} = quiz;
  const progress = state.status === 'finished' ? 1 : state.index / total;

  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        rightAction={
          <IconButton
            accessibilityLabel="Đóng"
            icon="close"
            iconSize={24}
            onPress={() => navigation.goBack()}
            tone="bare"
          />
        }
        title={headerTitle}
      />
      <ScrollView
        contentContainerStyle={themedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HandoffProgressTrack
          label={`${Math.min(state.index + 1, total)} / ${total}`}
          progress={progress}
        />

        {state.status === 'finished' ? (
          <ResultCard
            accuracy={accuracy}
            onDone={() => navigation.goBack()}
            onRetry={() => quiz.restart()}
            score={state.score}
            total={total}
          />
        ) : current ? (
          <QuestionBlock quiz={quiz} />
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

function QuestionBlock({quiz}: {quiz: ReturnType<typeof useQuiz>}) {
  const {theme} = useAppTheme();
  const themedStyles = React.useMemo(() => makeStyles(theme), [theme]);
  const {state, current, isLast, isMultipleChoice, correctIndex} = quiz;
  if (!current) {
    return null;
  }
  const answered = state.status === 'answered';

  return (
    <View style={themedStyles.questionBlock}>
      <ImagePlaceholder height={120} label="Câu hỏi luyện tập" />

      <AppText variant="h2">{current.question}</AppText>

      {isMultipleChoice && current.options ? (
        <View style={styles.optionList}>
          {current.options.map((option, optionIndex) => (
            <OptionButton
              key={`${optionIndex}-${option}`}
              answered={answered}
              isCorrect={optionIndex === correctIndex}
              isSelected={optionIndex === state.selectedIndex}
              label={option}
              onPress={() => quiz.select(optionIndex)}
            />
          ))}
        </View>
      ) : (
        <AppCard style={themedStyles.answerCard}>
          {answered ? (
            <>
              <AppText color="muted" variant="caption">
                Đáp án
              </AppText>
              <AppText style={themedStyles.answerText} variant="bodyLg">
                {current.answer}
              </AppText>
            </>
          ) : (
            <AppButton
              title="Hiện đáp án"
              variant="secondary"
              onPress={() => quiz.reveal()}
            />
          )}
        </AppCard>
      )}

      {answered ? (
        <View style={themedStyles.feedbackBlock}>
          {state.isCorrect !== null ? (
            <AppText
              style={
                state.isCorrect
                  ? themedStyles.correctFeedback
                  : themedStyles.incorrectFeedback
              }
              variant="label"
            >
              {state.isCorrect
                ? 'Chính xác!'
                : 'Chưa đúng — xem đáp án được tô sáng.'}
            </AppText>
          ) : null}
          {current.explanation_vi ? (
            <AppText color="muted">{current.explanation_vi}</AppText>
          ) : null}
          <AppButton
            onPress={() => quiz.next()}
            title={isLast ? 'Xem kết quả' : 'Câu tiếp theo'}
          />
        </View>
      ) : null}
    </View>
  );
}

function OptionButton({
  label,
  answered,
  isCorrect,
  isSelected,
  onPress,
}: {
  label: string;
  answered: boolean;
  isCorrect: boolean;
  isSelected: boolean;
  onPress: () => void;
}) {
  const {theme} = useAppTheme();

  let background = theme.colors.surface;
  let border = theme.colors.border;
  let textColor = theme.colors.text.primary;
  if (answered && isCorrect) {
    background = theme.colors.accentSoft;
    border = theme.colors.primary;
    textColor = theme.colors.primary;
  } else if (answered && isSelected) {
    background = theme.colors.secondarySoft;
    border = theme.colors.danger;
    textColor = theme.colors.secondary;
  }
  const themedStyles = React.useMemo(
    () => makeOptionStyles(theme, background, border, textColor),
    [background, border, textColor, theme],
  );

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{disabled: answered, selected: isSelected}}
      disabled={answered}
      onPress={onPress}
      style={({pressed}) => [
        themedStyles.button,
        pressed && !answered && themedStyles.pressed,
      ]}
    >
      <AppText style={themedStyles.label}>{label}</AppText>
    </Pressable>
  );
}

function ResultCard({
  score,
  total,
  accuracy,
  onRetry,
  onDone,
}: {
  score: number;
  total: number;
  accuracy: number;
  onRetry: () => void;
  onDone: () => void;
}) {
  const {theme} = useAppTheme();
  const themedStyles = React.useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={themedStyles.resultBlock}>
      <AppCard style={themedStyles.resultCard}>
        <MaterialIcon
          color={theme.colors.accent}
          name="emoji_events"
          size={40}
        />
        <AppText color="muted" variant="caption">
          Kết quả
        </AppText>
        <AppText style={themedStyles.resultScore} variant="display">
          {score}/{total}
        </AppText>
        <AppText color="secondary">Độ chính xác {accuracy}%</AppText>
      </AppCard>
      <AppButton onPress={onRetry} title="Làm lại" variant="secondary" />
      <AppButton onPress={onDone} title="Hoàn tất" />
    </View>
  );
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: 'center',
  },
  optionList: {
    gap: 10,
  },
});

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    answerCard: {
      gap: theme.spacing.sm,
    },
    answerText: {
      fontWeight: theme.typography.weight.bold,
    },
    correctFeedback: {
      color: theme.colors.primary,
    },
    emptyState: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    feedbackBlock: {
      gap: theme.spacing.sm,
    },
    incorrectFeedback: {
      color: theme.colors.danger,
    },
    questionBlock: {
      gap: theme.spacing.lg,
    },
    resultBlock: {
      gap: theme.spacing.lg,
    },
    resultCard: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xl,
    },
    resultScore: {
      color: theme.colors.primary,
    },
    scrollContent: {
      gap: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
  });
}

function makeOptionStyles(
  theme: AppTheme,
  backgroundColor: string,
  borderColor: string,
  color: string,
) {
  return StyleSheet.create({
    button: {
      backgroundColor,
      borderColor,
      borderRadius: 18,
      borderWidth: 2,
      justifyContent: 'center',
      minHeight: 52,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    label: {
      color,
      fontWeight: theme.typography.weight.medium,
    },
    pressed: {
      opacity: theme.states.pressedOpacity,
    },
  });
}
