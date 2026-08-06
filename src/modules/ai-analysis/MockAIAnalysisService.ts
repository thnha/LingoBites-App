import {AI_ANALYSIS_FAILED_MESSAGE} from '../../shared/copy/userMessages';
import {
  invalidMissingFieldOutput,
  validFullOutput,
  validMinimalOutput,
} from '../../shared/fixtures';
import {validateAIOutput} from '../../shared/schemas/ai-output-v1';
import type {AnalysisJobStage} from '../../shared/api/types';
import type {
  AnalyzeOptions,
  AnalyzeTextResult,
  AnalysisProgress,
  AnalysisProgressCallback,
} from './types';

const MOCK_STAGE_INTERVAL_MS = 450;
const MOCK_STAGES = [
  {name: 'source_analysis', weight: 15, message: 'Đang dịch và sắp xếp nội dung'},
  {name: 'sentence_analysis', weight: 35, message: 'Đang phân tích từng câu'},
  {name: 'learning_points', weight: 25, message: 'Đang tìm ngữ pháp và từ vựng'},
  {name: 'pronunciation', weight: 10, message: 'Đang chuẩn bị hướng dẫn phát âm'},
  {name: 'practice', weight: 10, message: 'Đang tạo bài luyện tập'},
  {name: 'finalizing', weight: 5, message: 'Đang kiểm tra bài học'},
] as const;

const cancelledResult = (): AnalyzeTextResult => ({ok: false, cancelled: true});

function isAborted(signal?: AbortSignal): boolean {
  return signal?.aborted === true;
}

/** Waits `ms` unless `signal` aborts first; resolves `false` when aborted. */
function waitFor(ms: number, signal?: AbortSignal): Promise<boolean> {
  if (isAborted(signal)) return Promise.resolve(false);
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve(true);
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      resolve(false);
    };
    signal?.addEventListener('abort', onAbort, {once: true});
  });
}

/** Builds a freshly-created six-item stage array for the given progress index. */
function buildStages(completedThroughIndex: number): AnalysisJobStage[] {
  return MOCK_STAGES.map((stage, index) => ({
    name: stage.name,
    status:
      index < completedThroughIndex
        ? 'completed'
        : index === completedThroughIndex
          ? 'processing'
          : 'pending',
    attempts: 1,
  }));
}

function buildFinalStages(): AnalysisJobStage[] {
  return MOCK_STAGES.map(stage => ({
    name: stage.name,
    status: 'completed',
    attempts: 1,
  }));
}

export async function simulateAnalysisJob(
  confirmedText: string,
  options?: AnalyzeOptions,
  onProgress?: AnalysisProgressCallback,
  signal?: AbortSignal,
): Promise<AnalyzeTextResult> {
  let percent = 0;

  for (let index = 0; index < MOCK_STAGES.length; index += 1) {
    const stage = MOCK_STAGES[index];
    const completed = await waitFor(MOCK_STAGE_INTERVAL_MS, signal);
    if (!completed || isAborted(signal)) {
      return cancelledResult();
    }

    percent += stage.weight;
    const isFinalStage = index === MOCK_STAGES.length - 1;
    const snapshot: AnalysisProgress = {
      percent,
      stage: stage.name,
      message: stage.message,
      stages: isFinalStage ? buildFinalStages() : buildStages(index),
    };
    onProgress?.(snapshot);
  }

  return runMockAnalysis(confirmedText, options);
}

function runMockAnalysis(
  confirmedText: string,
  options?: AnalyzeOptions,
): AnalyzeTextResult {
  if (options?.forceInvalid) {
    const validation = validateAIOutput(invalidMissingFieldOutput);
    if (!validation.valid) {
      return {
        ok: false,
        errorCode: 'AI_INVALID_OUTPUT',
        message: AI_ANALYSIS_FAILED_MESSAGE,
      };
    }
  }

  const baseFixture =
    options?.fixture === 'minimal' ? validMinimalOutput : validFullOutput;
  const candidate = {
    ...baseFixture,
    original_text: confirmedText.trim(),
  };

  const validation = validateAIOutput(candidate);
  if (!validation.valid) {
    return {
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    };
  }

  return {ok: true, lesson: validation.data};
}
