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
  SavedLessonDetail: {lessonId: string};
  FlashcardList: {lessonId?: string} | undefined;
  DailyReview: undefined;
  Today: undefined;
} & LearningDetailParamList;

/**
 * Ingestion stack behind the Create tab (SETE-247): all lesson-creation
 * entry points and their downstream flow screens moved here from HomeStack
 * so Home stays learning-only.
 */
export type CreateStackParamList = {
  CreateMain: undefined;
  /**
   * SETE-283 (HVB-04): opened from the Home video card with
   * `fromHome: true` so Back returns to Home instead of CreateMain.
   * Opened from inside the Create stack (e.g. History CTA) without it,
   * so Back follows the stack.
   *
   * SETE-289: YouTubeHistory moved to the RootStack (no `fromHome`
   * needed there — a plain goBack pops to the source tab), so only
   * YouTubeInput keeps the flag.
   */
  YouTubeInput:
    | {
        fromHome?: boolean;
        url?: string;
        /**
         * SETE-316 (Option A2): set when returning from Processing after a
         * transcript error — Step 2 opens pre-expanded with a recovery
         * banner. Always merged into existing params (never replaced) so
         * the fromHome exit contract above survives the round-trip.
         */
        transcriptRequired?: string;
      }
    | undefined;
  YouTubeProcessing: {
    url: string;
    manualCues?: import('@shared/schemas/youtube-transcript-v1').RawCue[];
  };
  YouTubeLesson:
    | {
        lesson: import('@shared/schemas/youtube-transcript-v1').YouTubeTranscript;
        /**
         * SETE-283 (HVB-07): set when the lesson reached the player even
         * though local persistence failed — the screen must warn instead
         * of presenting the lesson as saved.
         */
        saveFailed?: boolean;
      }
    | {
        lessonId: string;
      };
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
  ProgressiveLesson: {lessonId: string; initialLesson?: LessonV2};
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
  /**
   * Speaking Room + shadowing activity (SETE-110 / M5).
   * SETE-325 (C-3): the YouTube lesson passes the tapped sentence in so
   * the room opens with context. Optional so existing bare navigations
   * keep working.
   */
  SpeakingRoom: {sentenceText?: string} | undefined;
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
  Create: NavigatorScreenParams<CreateStackParamList> | undefined;
  Lessons: NavigatorScreenParams<LessonsStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

/**
 * SETE-289: root stack above the Tab.Navigator. `YouTubeHistory` lives
 * here so it renders without the bottom bar and without touching tab
 * state — a plain `goBack()` pops back to the source tab. `YouTubeLesson`
 * and the `LearningDetail` screens are registered here as well so opening
 * a saved lesson from History stays above the tabs. The Create stack keeps
 * its own `YouTubeLesson` registration for the fresh-create flow
 * (`YouTubeProcessing.replace('YouTubeLesson')`), matching the existing
 * multi-stack convention (`SavedLessonDetail`, `ProgressiveLesson`).
 */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<RootTabParamList> | undefined;
  YouTubeHistory: undefined;
  YouTubeLesson: CreateStackParamList['YouTubeLesson'];
  /**
   * SETE-303 / T6: account gate. `BootGate` covers bootstrapping and
   * retryable boot failures; `Onboarding` collects the required display
   * name. Neither is reachable once the account is authenticated.
   */
  BootGate: undefined;
  Onboarding: undefined;
} & LearningDetailParamList;
