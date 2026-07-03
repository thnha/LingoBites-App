import type {AIOutput} from '../../shared/schemas/ai-output-v1';
import type {ApiErrorCode} from '../../shared/api/types';

export type AnalyzeErrorCode = ApiErrorCode;

export type AnalyzeTextResult =
  | {ok: true; lesson: AIOutput}
  | {ok: false; errorCode: AnalyzeErrorCode; message: string};

export type MockFixture = 'full' | 'minimal';

export type AnalyzeSourceType = 'paste_text' | 'camera' | 'gallery';

export type AnalyzeOptions = {
  fixture?: MockFixture;
  forceInvalid?: boolean;
  sourceType?: AnalyzeSourceType;
};
