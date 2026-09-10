import type {
  AIOutput,
  GrammarPoint,
  PracticeQuestion,
  Sentence,
  VocabularyItem,
} from '@shared/schemas/ai-output-v1';
import type {LessonV2} from '@shared/schemas/lesson-v2';
import type {AnalyzeSourceType, OCRSourceType} from '@shared/api/types';
import type {NavigatorScreenParams} from '@react-navigation/native';

/**
 * Learning-mode drill-down screens shared by the Home and Lessons stacks.
 * Reachable from the lesson result / saved lesson detail when the
 * `shortPractice` feature flag is enabled. Data is passed in-memory (the
 * lesson is already validated and held by the originating screen), so no
 * repository lookup is needed here.
 */
export type LearningDetailParamList = {
  SentenceDetail: {
    sentences: Sentence[];
    index: number;
    practice: PracticeQuestion[];
  };
  WordDetail: {
    word: VocabularyItem;
    practice: PracticeQuestion[];
    lessonId?: string;
  };
  GrammarDetail: {
    grammar: GrammarPoint;
    related: GrammarPoint[];
    practice: PracticeQuestion[];
  };
  Practice:
    | {questions: PracticeQuestion[]; title?: string}
    | {lessonId: string; sessionId: string; title?: string};
};

export type HomeStackParamList = {
  HomeMain: undefined;
  ContentLessonRuntime: {lessonId: string};
  PasteText: {analyzeError?: string} | undefined;
  ImageCapture: {sourceType: OCRSourceType};
  OCRReview: {
    imageUri: string;
    fileName?: string;
    mimeType?: string;
    width?: number;
    height?: number;
    sourceType: OCRSourceType;
    extractedText: string;
    warnings?: string[];
    analyzeError?: string;
  };
  Analyzing: {
    confirmedText: string;
    sourceType: AnalyzeSourceType;
    origin: 'PasteText' | 'OCRReview';
  };
  LessonResult: {
    lesson: AIOutput;
    confirmedText: string;
    sourceType: AnalyzeSourceType;
    ocrRawText?: string;
  };
  SavedLessonDetail: {lessonId: string};
  ProgressiveLesson: {lessonId: string; initialLesson?: LessonV2};
  FlashcardList: {lessonId?: string} | undefined;
  DailyReview: undefined;
  Today: undefined;
} & LearningDetailParamList;

export type LessonsStackParamList = {
  LessonsList: undefined;
  SavedLessonDetail: {lessonId: string};
  ProgressiveLesson: {lessonId: string; initialLesson?: LessonV2};
  FlashcardList: {lessonId?: string} | undefined;
  /** Imported content-package lessons (M1-M3), separate from the OCR flow above. */
  ContentLessonList: undefined;
  ContentLessonDetail: {lessonId: string};
  ContentLessonRuntime: {lessonId: string};
  /** Speaking Room + shadowing activity (SETE-110 / M5). */
  SpeakingRoom: undefined;
  SpeakingShadowing: undefined;
  Today: undefined;
} & LearningDetailParamList;

export type ProfileStackParamList = {
  ProfileMain: undefined;
  PrivacyNote: undefined;
  ProgressReport: undefined;
  FeatureStatus: undefined;
  TtsSpike: undefined;
  ProgressiveLesson: {lessonId: string; initialLesson?: LessonV2};
};

export type RootTabParamList = {
  Home: undefined;
  Lessons: NavigatorScreenParams<LessonsStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
