import type {PracticeQuestion} from '../../shared/schemas/ai-output-v1';

export type QuizStatus = 'answering' | 'answered' | 'finished';

export type QuizState = {
  /** Index of the question currently shown. */
  index: number;
  /** Option the user tapped (multiple choice only); null until answered. */
  selectedIndex: number | null;
  status: QuizStatus;
  /** true / false for graded questions, null for reveal-only questions. */
  isCorrect: boolean | null;
  /** Number of correct multiple-choice answers so far. */
  score: number;
  /** How many questions have been answered or revealed. */
  answeredCount: number;
};

export const initialQuizState: QuizState = {
  index: 0,
  selectedIndex: null,
  status: 'answering',
  isCorrect: null,
  score: 0,
  answeredCount: 0,
};

export function isMultipleChoice(question: PracticeQuestion): boolean {
  return (
    question.type === 'multiple_choice' &&
    Array.isArray(question.options) &&
    question.options.length >= 2
  );
}

/** Index of the correct option within `options`, or -1 when not found. */
export function correctOptionIndex(question: PracticeQuestion): number {
  if (!question.options) {
    return -1;
  }
  return question.options.findIndex(option => option === question.answer);
}

export function selectAnswer(
  state: QuizState,
  question: PracticeQuestion,
  optionIndex: number,
): QuizState {
  if (state.status !== 'answering') {
    return state;
  }
  const isCorrect = optionIndex === correctOptionIndex(question);
  return {
    ...state,
    selectedIndex: optionIndex,
    status: 'answered',
    isCorrect,
    score: state.score + (isCorrect ? 1 : 0),
    answeredCount: state.answeredCount + 1,
  };
}

/** Reveal the answer for questions that are not graded multiple choice. */
export function revealAnswer(state: QuizState): QuizState {
  if (state.status !== 'answering') {
    return state;
  }
  return {
    ...state,
    status: 'answered',
    isCorrect: null,
    answeredCount: state.answeredCount + 1,
  };
}

export function goNext(state: QuizState, total: number): QuizState {
  const isLast = state.index >= total - 1;
  if (isLast) {
    return {...state, status: 'finished'};
  }
  return {
    ...state,
    index: state.index + 1,
    selectedIndex: null,
    status: 'answering',
    isCorrect: null,
  };
}

export function accuracyPercent(state: QuizState, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((state.score / total) * 100);
}

export function restartQuiz(): QuizState {
  return {...initialQuizState};
}
