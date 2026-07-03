import {AI_ANALYSIS_FAILED_MESSAGE, EMPTY_INPUT_MESSAGE} from '../../shared/copy/userMessages';
import {validFullOutput} from '../../shared/fixtures';
import {useScanStore} from '../useScanStore';

const mockAnalyzeText = jest.fn();

jest.mock('../../services/ai', () => ({
  analyzeLessonText: (...args: unknown[]) => mockAnalyzeText(...args),
}));

describe('useScanStore', () => {
  beforeEach(() => {
    mockAnalyzeText.mockReset();
    useScanStore.setState({job: {status: 'idle'}});
  });

  it('transitions text → success', async () => {
    mockAnalyzeText.mockResolvedValue({ok: true, lesson: validFullOutput});

    await useScanStore.getState().scanFromText('Hello world');

    expect(useScanStore.getState().job).toEqual({
      status: 'success',
      data: validFullOutput,
    });
  });

  it('transitions empty text → empty', async () => {
    await useScanStore.getState().scanFromText('   ');

    expect(useScanStore.getState().job.status).toBe('empty');
    expect(mockAnalyzeText).not.toHaveBeenCalled();
  });

  it('transitions text → error', async () => {
    mockAnalyzeText.mockResolvedValue({
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });

    await useScanStore.getState().scanFromText('Hello');

    expect(useScanStore.getState().job).toEqual({
      status: 'error',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });
  });

  it('reset returns to idle', async () => {
    mockAnalyzeText.mockResolvedValue({ok: true, lesson: validFullOutput});
    await useScanStore.getState().scanFromText('Hello');
    useScanStore.getState().reset();
    expect(useScanStore.getState().job).toEqual({status: 'idle'});
  });
});
