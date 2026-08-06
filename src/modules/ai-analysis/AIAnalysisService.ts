import {runAnalysisJob} from '../../shared/api/analysisJobClient';
import {getAppConfig} from '../../shared/api/appConfig';
import {getTextLengthBucket, trackEvent} from '../analytics';
import {simulateAnalysisJob} from './MockAIAnalysisService';
import type {
  AnalyzeOptions,
  AnalyzeTextResult,
  AnalysisProgressCallback,
} from './types';

const DEFAULT_PROMPT_VERSION = 'lesson-analysis-v1';
const DEFAULT_LEVEL = 'Beginner';

export async function analyzeText(
  confirmedText: string,
  options?: AnalyzeOptions,
  onProgress?: AnalysisProgressCallback,
  signal?: AbortSignal,
): Promise<AnalyzeTextResult> {
  const trimmed = confirmedText.trim();
  const textLengthBucket = getTextLengthBucket(trimmed.length);

  trackEvent('ai_analysis_started', {
    text_length_bucket: textLengthBucket,
    level: DEFAULT_LEVEL,
    prompt_version: DEFAULT_PROMPT_VERSION,
  });

  const startedAt = Date.now();
  const {useMockAi} = getAppConfig();

  const result = useMockAi
    ? await simulateAnalysisJob(trimmed, options, onProgress, signal)
    : await runAnalysisJob(
        trimmed,
        options?.sourceType ?? 'paste_text',
        onProgress,
        signal,
      );

  if (!result.ok && result.cancelled) {
    return result;
  }

  const durationMs = Date.now() - startedAt;

  if (result.ok) {
    trackEvent('ai_analysis_completed', {
      status: 'success',
      duration_ms: durationMs,
      schema_valid: true,
      sentence_count: result.lesson.sentences?.length ?? 0,
      vocabulary_count: result.lesson.vocabulary?.length ?? 0,
      grammar_count: result.lesson.grammar_points?.length ?? 0,
    });
    return result;
  }

  trackEvent('ai_analysis_completed', {
    status: 'failed',
    duration_ms: durationMs,
    error_code: result.errorCode,
  });

  return result;
}
