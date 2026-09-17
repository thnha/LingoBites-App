import type {ReleaseConfig} from '../types';

const dev: ReleaseConfig = {
  releaseName: 'dev',
  description:
    'Development preset — all implemented features (ready + beta) on. Flags without implementation stay off.',
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
    pastelKidsTheme: false,
    coreTheme: false,
    neoTheme: false,
    comicTheme: false,
    cartoonTheme: false,
    stickerSoftTheme: true,
    reviewSystem: true,
    lessonV2: true,
    youtubeLearning: true,
  },
};

export default dev;
