import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import {makeTestReleaseConfig, THEME_UI_FLAGS} from '@/test-support';
import {AppThemeProvider} from '@theme';
import {trackEvent} from '@modules/analytics';
import {UnifiedLessonGenerationScreen} from '../UnifiedLessonGenerationScreen';

jest.mock('../lessonJobClient', () => ({
  ...jest.requireActual('../lessonJobClient'),
  fetchLessonGenerationJob: jest.fn(),
  createLessonGenerationJob: jest.fn(),
}));

jest.mock('@modules/analytics', () => ({
  trackEvent: jest.fn(),
}));

const {fetchLessonGenerationJob, createLessonGenerationJob} = jest.requireMock(
  '../lessonJobClient',
) as {
  fetchLessonGenerationJob: jest.Mock;
  createLessonGenerationJob: jest.Mock;
};

const tracked = trackEvent as jest.Mock;

const JOB_ID = '00000000-0000-4000-8000-000000000070';
const LESSON_ID = '00000000-0000-4000-8000-000000000071';

function jobResult(status: string, overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    requestId: 'req-1',
    job: {
      id: JOB_ID,
      status,
      revision: 3,
      pollAfterMs: 1000,
      lessonId: null,
      error: null,
      warnings: [],
      ...overrides,
    },
  };
}

function screenProps(extraParams: Record<string, unknown> = {}) {
  const navigation = {replace: jest.fn(), goBack: jest.fn()};
  const props = {
    navigation,
    route: {
      key: 'unified-generation',
      name: 'UnifiedLessonGeneration' as const,
      params: {jobId: JOB_ID, confirmedText: 'Hello world', ...extraParams},
    },
  } as unknown as React.ComponentProps<typeof UnifiedLessonGenerationScreen>;
  return {navigation, props};
}

async function renderScreen(
  props: React.ComponentProps<typeof UnifiedLessonGenerationScreen>,
) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider
        releaseConfig={makeTestReleaseConfig(THEME_UI_FLAGS)}
      >
        <AppThemeProvider>
          <UnifiedLessonGenerationScreen {...props} />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  return tree;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('UnifiedLessonGenerationScreen', () => {
  it('replaces with the canonical lesson route on materialization', async () => {
    fetchLessonGenerationJob.mockResolvedValue(
      jobResult('ready', {lessonId: LESSON_ID}),
    );
    const {navigation, props} = screenProps();
    const tree = await renderScreen(props);

    expect(
      tree.root.findByProps({testID: 'unified-generation-opening'}),
    ).toBeDefined();
    expect(navigation.replace).toHaveBeenCalledWith('CurriculumLesson', {
      lessonId: LESSON_ID,
    });
    expect(tracked).toHaveBeenCalledWith('unified_generation_started', {
      job_id: JOB_ID,
    });
    expect(tracked).toHaveBeenCalledWith('unified_generation_completed', {
      job_id: JOB_ID,
      lesson_id: LESSON_ID,
      outcome: 'materialized',
    });
  });

  it('retries a failed job as a fresh job id and stays canonical', async () => {
    fetchLessonGenerationJob.mockResolvedValue(
      jobResult('failed', {error: {code: 'X', message: 'Boom.'}}),
    );
    const NEW_JOB = '00000000-0000-4000-8000-000000000072';
    createLessonGenerationJob.mockResolvedValue({
      ok: true,
      requestId: 'req-2',
      job: {
        id: NEW_JOB,
        status: 'skeleton_ready',
        revision: 1,
        pollAfterMs: 1000,
        lessonId: null,
        error: null,
        warnings: [],
      },
    });
    const {navigation, props} = screenProps();
    const tree = await renderScreen(props);

    expect(
      tree.root.findByProps({testID: 'unified-generation-failed'}),
    ).toBeDefined();
    expect(navigation.replace).not.toHaveBeenCalled();
    await act(async () => {
      tree.root
        .findByProps({testID: 'unified-generation-retry'})
        .props.onPress();
    });
    expect(createLessonGenerationJob).toHaveBeenCalledWith({
      confirmedText: 'Hello world',
      level: undefined,
    });
    expect(navigation.replace).toHaveBeenCalledWith('UnifiedLessonGeneration', {
      jobId: NEW_JOB,
      confirmedText: 'Hello world',
      level: undefined,
    });
    expect(tracked).toHaveBeenCalledWith('unified_generation_completed', {
      job_id: JOB_ID,
      outcome: 'failed',
    });
  });

  it('hides retry without creation context and goes back', async () => {
    fetchLessonGenerationJob.mockResolvedValue(
      jobResult('failed', {error: {code: 'X', message: 'Boom.'}}),
    );
    const {navigation, props} = screenProps({confirmedText: undefined});
    const tree = await renderScreen(props);
    expect(
      tree.root.findAllByProps({testID: 'unified-generation-retry'}),
    ).toHaveLength(0);
    await act(async () => {
      tree.root
        .findByProps({testID: 'unified-generation-back'})
        .props.onPress();
    });
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });
});
