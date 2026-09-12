import type {FeatureKey} from './feature-registry';

// Each array represents an "OR" condition.
// Inside each array, the strings represent "AND" conditions.
// e.g. [['A', 'B'], ['C']] means (A and B) OR (C).
export type DependencyGroup = FeatureKey[];

export const featureDependencies: Record<FeatureKey, DependencyGroup[]> = {
  pasteTextInput: [],
  imageInput: [],
  ocrScanner: [['imageInput']],
  ocrReviewEdit: [['ocrScanner']],
  aiLessonAnalysis: [['pasteTextInput'], ['ocrReviewEdit']],
  lessonResultView: [],
  lessonSave: [['lessonResultView']],
  lessonHistory: [['lessonSave']],
  shortPractice: [['lessonResultView']],
  pronunciationSupport: [['lessonResultView']],

  themeSystem: [],
  themeSwitcher: [['themeSystem']],
  darkTheme: [['themeSystem']],
  pastelKidsTheme: [['themeSystem']],
  coreTheme: [['themeSystem']],
  neoTheme: [['themeSystem']],
  comicTheme: [['themeSystem']],
  cartoonTheme: [['themeSystem']],
  stickerSoftTheme: [['themeSystem']],

  reviewSystem: [['lessonSave']],
  miniGame: [['lessonSave', 'reviewSystem']],
  wordMatchGame: [['miniGame', 'lessonSave']],
  fillBlankGame: [['miniGame', 'lessonSave']],
  tenseQuizGame: [['miniGame', 'lessonSave']],
  sentenceOrderGame: [['miniGame', 'lessonSave']],
  flashcardChallenge: [['miniGame', 'reviewSystem']],

  situationLearning: [['aiLessonAnalysis', 'lessonSave']],
  dialogueGenerator: [['situationLearning']],
  phraseExtractor: [['situationLearning']],
  situationPractice: [['situationLearning', 'reviewSystem']],

  // Standalone v2 flow; when OFF the app keeps using the v1 lesson path (AC24).
  lessonV2: [],
  youtubeLearning: [],
};
