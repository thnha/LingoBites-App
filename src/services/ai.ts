import {analyzeText} from '../modules/ai-analysis/AIAnalysisService';
import type {AIOutput} from '../shared/schemas/ai-output-v1';

export type AnalyzeSourceType = 'paste_text' | 'camera' | 'gallery';

// TODO(M2): keep as the single AI seam when swapping providers or adding retries.
export async function analyzeLessonText(
  text: string,
  options: {sourceType: AnalyzeSourceType},
) {
  return analyzeText(text, options);
}

export type {AIOutput};
