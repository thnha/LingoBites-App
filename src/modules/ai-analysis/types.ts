import type {AIOutput} from '@shared/schemas/ai-output-v1';
import type {
  AnalyzeSourceType,
  ApiErrorCode,
  AnalysisJobStage,
} from '@shared/api/types';

export type {AnalyzeSourceType};

export type AnalyzeErrorCode = ApiErrorCode;

export type AnalysisProgress = {
  percent: number;
  stage: string | null;
  message: string | null;
  stages: AnalysisJobStage[];
};

export type AnalysisProgressCallback = (progress: AnalysisProgress) => void;

export type AnalyzeTextResult =
  | {ok: true; lesson: AIOutput}
  | {ok: false; cancelled: true}
  | {
      ok: false;
      cancelled?: false;
      errorCode: AnalyzeErrorCode;
      message: string;
    };

export type MockFixture = 'full' | 'minimal';

export type AnalyzeOptions = {
  fixture?: MockFixture;
  forceInvalid?: boolean;
  sourceType?: AnalyzeSourceType;
};
