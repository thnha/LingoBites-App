import type {
  AIOutput,
  GrammarPoint,
  PracticeQuestion,
  Sentence,
  VocabularyItem,
} from '../../shared/schemas/ai-output-v1';
import type {OCRSourceType} from '../../shared/api/types';
import type {AnalyzeSourceType} from '../../modules/ai-analysis/types';

/**
 * Learning-mode drill-down screens shared by the Home and Lessons stacks.
 * Reachable from the lesson result / saved lesson detail when the
 * `shortPractice` feature flag is enabled. Data is passed in-memory (the
 * lesson is already validated and held by the originating screen), so no
 * repository lookup is needed here.
 */
export type LearningDetailParamList = {
  SentenceDetail: {
    sentence: Sentence;
    index: number;
    total: number;
    practice: PracticeQuestion[];
  };
  WordDetail: {word: VocabularyItem; practice: PracticeQuestion[]};
  GrammarDetail: {
    grammar: GrammarPoint;
    related: GrammarPoint[];
    practice: PracticeQuestion[];
  };
  Practice: {questions: PracticeQuestion[]; title?: string};
};

export type HomeStackParamList = {
  HomeMain: undefined;
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
} & LearningDetailParamList;

export type LessonsStackParamList = {
  LessonsList: undefined;
  SavedLessonDetail: {lessonId: string};
} & LearningDetailParamList;

export type ProfileStackParamList = {
  ProfileMain: undefined;
  PrivacyNote: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Lessons: undefined;
  Profile: undefined;
};
