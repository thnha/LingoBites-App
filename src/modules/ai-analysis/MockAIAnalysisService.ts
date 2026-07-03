import {AI_ANALYSIS_FAILED_MESSAGE} from '../../shared/copy/userMessages';
import {
  invalidMissingFieldOutput,
  validFullOutput,
  validMinimalOutput,
} from '../../shared/fixtures';
import {validateAIOutput} from '../../shared/schemas/ai-output-v1';
import type {AnalyzeOptions, AnalyzeTextResult} from './types';

export async function analyzeTextWithMock(
  confirmedText: string,
  options?: AnalyzeOptions,
): Promise<AnalyzeTextResult> {
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
