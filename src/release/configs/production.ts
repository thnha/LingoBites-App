import type {ReleaseConfig} from '../types';

const production: ReleaseConfig = {
  releaseName: 'production',
  description:
    'Production preset — all implemented features (ready + beta) on. Flags without implementation stay off.',
  features: {
    pasteTextInput: true,
    imageInput: true,
    ocrScanner: true,
    ocrReviewEdit: true,
    aiLessonAnalysis: true,
    lessonResultView: true,
    lessonSave: true,
    lessonHistory: true,
    shortPractice: true,
    themeSystem: true,
    themeSwitcher: true,
    darkTheme: true,
    pastelKidsTheme: true,
    coreTheme: true,
    neoTheme: true,
    comicTheme: true,
    cartoonTheme: true,
    stickerSoftTheme: true,
    reviewSystem: true,
    lessonV2: true,
    youtubeLearning: true,
  },
};

export default production;
