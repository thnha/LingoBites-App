import {AI_ANALYSIS_FAILED_MESSAGE} from '../../../shared/copy/userMessages';
import {analyzeTextWithMock} from '../MockAIAnalysisService';

describe('analyzeTextWithMock', () => {
  it('returns validated lesson for full fixture', async () => {
    const result = await analyzeTextWithMock('Sample confirmed text.');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lesson.original_text).toBe('Sample confirmed text.');
    }
  });

  it('returns validated lesson for minimal fixture', async () => {
    const result = await analyzeTextWithMock('Staff only.', {fixture: 'minimal'});
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lesson.vocabulary).toEqual([]);
    }
  });

  it('returns friendly error when forced invalid', async () => {
    const result = await analyzeTextWithMock('ignored', {forceInvalid: true});
    expect(result).toEqual({
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });
  });
});
