import type { FeatureKey } from './feature-registry';

export const featureDependencies: Record<FeatureKey, string[]> = {
  pasteTextInput: [],
  imageInput: [],
  ocrScanner: ['imageInput'],
  ocrReviewEdit: ['ocrScanner'],
  aiLessonAnalysis: ['pasteTextInput'],
  lessonResultView: ['aiLessonAnalysis'],
  lessonSave: ['lessonResultView'],
  lessonHistory: ['lessonSave'],
  shortPractice: ['lessonResultView'],
  pronunciationSupport: ['lessonResultView'],

  themeSystem: [],
  themeSwitcher: ['themeSystem'],
  darkTheme: ['themeSystem'],
  pastelKidsTheme: ['themeSystem'],

  reviewSystem: ['lessonSave'],
  miniGame: ['lessonSave', 'reviewSystem'],
  wordMatchGame: ['miniGame', 'lessonSave'],
  fillBlankGame: ['miniGame', 'lessonSave'],
  tenseQuizGame: ['miniGame', 'lessonSave'],
  sentenceOrderGame: ['miniGame', 'lessonSave'],
  flashcardChallenge: ['miniGame', 'reviewSystem'],

  situationLearning: ['aiLessonAnalysis', 'lessonSave'],
  dialogueGenerator: ['situationLearning'],
  phraseExtractor: ['situationLearning'],
  situationPractice: ['situationLearning', 'reviewSystem'],
};
