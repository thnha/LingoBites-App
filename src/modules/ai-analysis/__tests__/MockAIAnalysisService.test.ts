import {AI_ANALYSIS_FAILED_MESSAGE} from '../../../shared/copy/userMessages';
import {simulateAnalysisJob} from '../MockAIAnalysisService';
import type {AnalysisProgress} from '../types';

const EXPECTED_STAGE_NAMES = [
  'source_analysis',
  'sentence_analysis',
  'learning_points',
  'pronunciation',
  'practice',
  'finalizing',
];

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('simulateAnalysisJob', () => {
  it('returns validated lesson for full fixture', async () => {
    const pending = simulateAnalysisJob('Sample confirmed text.');
    await jest.runAllTimersAsync();
    const result = await pending;
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lesson.original_text).toBe('Sample confirmed text.');
    }
  });

  it('returns validated lesson for minimal fixture', async () => {
    const pending = simulateAnalysisJob('Staff only.', {fixture: 'minimal'});
    await jest.runAllTimersAsync();
    const result = await pending;
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lesson.vocabulary).toEqual([]);
    }
  });

  it('returns friendly error when forced invalid', async () => {
    const pending = simulateAnalysisJob('ignored', {forceInvalid: true});
    await jest.runAllTimersAsync();
    const result = await pending;
    expect(result).toEqual({
      ok: false,
      errorCode: 'AI_INVALID_OUTPUT',
      message: AI_ANALYSIS_FAILED_MESSAGE,
    });
  });

  it('emits six staged progress snapshots with the expected percents and stage names', async () => {
    const onProgress = jest.fn();
    const pending = simulateAnalysisJob(
      'Sample confirmed text.',
      undefined,
      onProgress,
    );
    await jest.runAllTimersAsync();
    await expect(pending).resolves.toEqual(expect.objectContaining({ok: true}));

    expect(onProgress.mock.calls.map(([value]) => value.percent)).toEqual([
      15, 50, 75, 85, 95, 100,
    ]);
    expect(onProgress.mock.calls.map(([value]) => value.stage)).toEqual([
      'source_analysis',
      'sentence_analysis',
      'learning_points',
      'pronunciation',
      'practice',
      'finalizing',
    ]);
  });

  it('includes all six stage names in every snapshot, with completed stages staying completed and the current stage processing until the final emission', async () => {
    const onProgress = jest.fn();
    const pending = simulateAnalysisJob(
      'Sample confirmed text.',
      undefined,
      onProgress,
    );
    await jest.runAllTimersAsync();
    await pending;

    const snapshots: AnalysisProgress[] = onProgress.mock.calls.map(
      ([value]) => value,
    );

    snapshots.forEach((snapshot, index) => {
      expect(snapshot.stages.map(stage => stage.name)).toEqual(
        EXPECTED_STAGE_NAMES,
      );

      // Every stage at or before the current index is completed; the
      // current stage itself is 'processing' except on the final snapshot
      // where it is 'completed'.
      snapshot.stages.forEach((stage, stageIndex) => {
        if (stageIndex < index) {
          expect(stage.status).toBe('completed');
        } else if (stageIndex === index) {
          const isFinalSnapshot = index === snapshots.length - 1;
          expect(stage.status).toBe(isFinalSnapshot ? 'completed' : 'processing');
        } else {
          expect(stage.status).toBe('pending');
        }
      });
    });
  });

  it('never hands out a snapshot that shares arrays or objects with a previously delivered one', async () => {
    const onProgress = jest.fn();
    const pending = simulateAnalysisJob(
      'Sample confirmed text.',
      undefined,
      onProgress,
    );
    await jest.runAllTimersAsync();
    await pending;

    const snapshots: AnalysisProgress[] = onProgress.mock.calls.map(
      ([value]) => value,
    );

    for (let i = 0; i < snapshots.length; i += 1) {
      for (let j = i + 1; j < snapshots.length; j += 1) {
        expect(snapshots[i]).not.toBe(snapshots[j]);
        expect(snapshots[i].stages).not.toBe(snapshots[j].stages);
        snapshots[i].stages.forEach((stage, index) => {
          expect(stage).not.toBe(snapshots[j].stages[index]);
        });
      }
    }
  });

  it('stops emitting progress and resolves as cancelled when aborted mid-run', async () => {
    const onProgress = jest.fn();
    const controller = new AbortController();
    const pending = simulateAnalysisJob(
      'Sample confirmed text.',
      undefined,
      onProgress,
      controller.signal,
    );

    // Advance through exactly one stage's timer before aborting.
    await jest.advanceTimersByTimeAsync(450);
    expect(onProgress).toHaveBeenCalledTimes(1);

    controller.abort();
    await jest.runAllTimersAsync();

    const result = await pending;
    expect(result).toEqual({ok: false, cancelled: true});
    expect(onProgress).toHaveBeenCalledTimes(1);
  });
});
