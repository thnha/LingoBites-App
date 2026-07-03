import type { FeatureRegistryEntry } from './types';

export const featureRegistry: FeatureRegistryEntry[] = [
  {
    key: 'pasteTextInput',
    module: 'modules/input',
    required: true,
    releaseGroup: 'foundation',
  },
  {
    key: 'imageInput',
    module: 'modules/input',
    required: true,
    releaseGroup: 'foundation',
  },
  {
    key: 'ocrScanner',
    module: 'modules/ocr',
    required: true,
    releaseGroup: 'foundation',
  },
  {
    key: 'ocrReviewEdit',
    module: 'modules/ocr',
    required: true,
    releaseGroup: 'foundation',
  },
  {
    key: 'aiLessonAnalysis',
    module: 'modules/ai-analysis',
    required: true,
    releaseGroup: 'foundation',
  },
  {
    key: 'lessonResultView',
    module: 'modules/lesson',
    required: true,
    releaseGroup: 'foundation',
  },
  {
    key: 'lessonSave',
    module: 'modules/lesson',
    required: true,
    releaseGroup: 'foundation',
  },
  {
    key: 'lessonHistory',
    module: 'modules/lesson',
    required: true,
    releaseGroup: 'foundation',
  },
  {
    key: 'shortPractice',
    module: 'modules/practice',
    required: false,
    releaseGroup: 'foundation',
  },
  {
    key: 'pronunciationSupport',
    module: 'modules/pronunciation',
    required: false,
    releaseGroup: 'foundation',
  },
  {
    key: 'themeSystem',
    module: 'theme',
    required: false,
    releaseGroup: 'ui',
  },
  {
    key: 'themeSwitcher',
    module: 'theme',
    required: false,
    releaseGroup: 'ui',
  },
  {
    key: 'darkTheme',
    module: 'theme',
    required: false,
    releaseGroup: 'ui',
  },
  {
    key: 'pastelKidsTheme',
    module: 'theme',
    required: false,
    releaseGroup: 'ui',
  },
  {
    key: 'coreTheme',
    module: 'theme',
    required: false,
    releaseGroup: 'ui',
  },
  {
    key: 'neoTheme',
    module: 'theme',
    required: false,
    releaseGroup: 'ui',
  },
  {
    key: 'comicTheme',
    module: 'theme',
    required: false,
    releaseGroup: 'ui',
  },
  {
    key: 'cartoonTheme',
    module: 'theme',
    required: false,
    releaseGroup: 'ui',
  },
  {
    key: 'reviewSystem',
    module: 'features/lesson-review',
    required: false,
    releaseGroup: 'practice',
  },
  {
    key: 'miniGame',
    module: 'features/mini-games',
    required: false,
    releaseGroup: 'practice',
  },
  {
    key: 'wordMatchGame',
    module: 'features/mini-games/word-match',
    required: false,
    releaseGroup: 'practice',
  },
  {
    key: 'fillBlankGame',
    module: 'features/mini-games/fill-blank',
    required: false,
    releaseGroup: 'practice',
  },
  {
    key: 'tenseQuizGame',
    module: 'features/mini-games/tense-quiz',
    required: false,
    releaseGroup: 'practice',
  },
  {
    key: 'sentenceOrderGame',
    module: 'features/mini-games/sentence-order',
    required: false,
    releaseGroup: 'practice',
  },
  {
    key: 'flashcardChallenge',
    module: 'features/mini-games/flashcard-challenge',
    required: false,
    releaseGroup: 'practice',
  },
  {
    key: 'situationLearning',
    module: 'features/situation-learning',
    required: false,
    releaseGroup: 'expansion',
  },
  {
    key: 'dialogueGenerator',
    module: 'features/situation-learning',
    required: false,
    releaseGroup: 'expansion',
  },
  {
    key: 'phraseExtractor',
    module: 'features/situation-learning',
    required: false,
    releaseGroup: 'expansion',
  },
  {
    key: 'situationPractice',
    module: 'features/situation-learning',
    required: false,
    releaseGroup: 'expansion',
  },
];

export type FeatureKey = (typeof featureRegistry)[number]['key'];

export const featureKeys = featureRegistry.map(entry => entry.key);
