import {analyzeTextWithApi} from '../../shared/api/analyzeClient';
import {getAppConfig} from '../../shared/api/appConfig';
import {getTextLengthBucket, trackEvent} from '../analytics';
import {analyzeTextWithMock} from './MockAIAnalysisService';
import type {AnalyzeOptions, AnalyzeTextResult} from './types';

const DEFAULT_PROMPT_VERSION = 'lesson-analysis-v1';
const DEFAULT_LEVEL = 'Beginner';

export async function analyzeText(
  confirmedText: string,
  options?: AnalyzeOptions,
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
    ? await analyzeTextWithMock(trimmed, options)
    : await analyzeTextWithApi(trimmed, options?.sourceType ?? 'paste_text');

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
