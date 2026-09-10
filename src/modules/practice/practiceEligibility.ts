import type {LessonV2} from '@shared/schemas/lesson-v2';

/** D3 minimum validated source thresholds (configurable product policy). */
export const PRACTICE_MIN_VOCABULARY_WITH_MEANING = 4;
export const PRACTICE_MIN_SENTENCES_WITH_TRANSLATION = 1;

export function isTerminalLessonForPractice(lesson: LessonV2): boolean {
  return (
    lesson.status === 'ready' ||
    lesson.status === 'ready_with_warnings' ||
    lesson.status === 'partially_ready'
  );
}

export function countValidatedSources(lesson: LessonV2): {
  vocabularyWithMeaning: number;
  sentencesWithTranslation: number;
} {
  const vocabularyWithMeaning = lesson.vocabulary.filter(
    item => item.meaning_vi.trim().length > 0,
  ).length;
  const sentencesWithTranslation = lesson.sentences.filter(
    sentence =>
      sentence.status === 'ready' &&
      typeof sentence.translation === 'string' &&
      sentence.translation.trim().length > 0,
  ).length;
  return {vocabularyWithMeaning, sentencesWithTranslation};
}

export function hasMinimumValidatedSource(lesson: LessonV2): boolean {
  const counts = countValidatedSources(lesson);
  return (
    counts.vocabularyWithMeaning >= PRACTICE_MIN_VOCABULARY_WITH_MEANING ||
    counts.sentencesWithTranslation >= PRACTICE_MIN_SENTENCES_WITH_TRANSLATION
  );
}

export function isLessonEligibleForPractice(lesson: LessonV2): boolean {
  return isTerminalLessonForPractice(lesson) && hasMinimumValidatedSource(lesson);
}
