import {createLessonV2Skeleton} from '@shared/api/lessonV2Client';
import {
  resolveLessonDestination,
  startLessonFromConfirmedText,
} from '../startLessonFromConfirmedText';

jest.mock('@shared/api/lessonV2Client', () => ({
  createLessonV2Skeleton: jest.fn(),
}));

const createSkeleton = createLessonV2Skeleton as jest.MockedFunction<
  typeof createLessonV2Skeleton
>;

describe('startLessonFromConfirmedText', () => {
  beforeEach(() => jest.clearAllMocks());

  it('resolves the destination from the lessonV2 flag', () => {
    expect(resolveLessonDestination({lessonV2: true})).toBe('v2_progressive');
    expect(resolveLessonDestination({lessonV2: false})).toBe('v1_analyze');
  });

  it('resolves unified only when the flag and readiness agree', () => {
    expect(
      resolveLessonDestination(
        {lessonV2: true, unifiedLesson: true},
        {unifiedReady: true},
      ),
    ).toBe('unified_lesson');
    expect(
      resolveLessonDestination(
        {lessonV2: true, unifiedLesson: true},
        {unifiedReady: false},
      ),
    ).toBe('v2_progressive');
    expect(
      resolveLessonDestination({lessonV2: true, unifiedLesson: true}),
    ).toBe('v2_progressive');
    expect(
      resolveLessonDestination(
        {lessonV2: false, unifiedLesson: true},
        {unifiedReady: true},
      ),
    ).toBe('unified_lesson');
  });

  it('keeps the V1 route and does not call the V2 API when the flag is off', async () => {
    const navigate = jest.fn();
    const result = await startLessonFromConfirmedText({
      confirmedText: 'hello',
      sourceType: 'paste_text',
      destination: 'v1_analyze',
      origin: 'PasteText',
      navigate,
    });

    expect(result).toEqual({ok: true});
    expect(createSkeleton).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('Analyzing', {
      confirmedText: 'hello',
      sourceType: 'paste_text',
      origin: 'PasteText',
    });
  });

  it('blocks overlong V2 input before making a request', async () => {
    const navigate = jest.fn();
    const result = await startLessonFromConfirmedText({
      confirmedText: Array.from({length: 501}, () => 'word').join(' '),
      sourceType: 'camera',
      destination: 'v2_progressive',
      origin: 'OCRReview',
      navigate,
    });

    expect(result.ok).toBe(false);
    expect(createSkeleton).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('creates one job and navigates to generation progress for unified', async () => {
    const navigate = jest.fn();
    const createGenerationJob = jest.fn().mockResolvedValue({
      ok: true,
      job: {id: 'job-1'},
    });
    const result = await startLessonFromConfirmedText({
      confirmedText: 'hello world',
      sourceType: 'paste_text',
      destination: 'unified_lesson',
      origin: 'PasteText',
      navigate,
      createGenerationJob,
    });

    expect(result).toEqual({ok: true});
    expect(createSkeleton).not.toHaveBeenCalled();
    expect(createGenerationJob).toHaveBeenCalledWith({
      confirmedText: 'hello world',
    });
    expect(navigate).toHaveBeenCalledWith('UnifiedLessonGeneration', {
      jobId: 'job-1',
      confirmedText: 'hello world',
    });
  });

  it('fails closed for unified when no job creator is injected', async () => {
    const navigate = jest.fn();
    const result = await startLessonFromConfirmedText({
      confirmedText: 'hello world',
      sourceType: 'paste_text',
      destination: 'unified_lesson',
      origin: 'PasteText',
      navigate,
    });

    expect(result.ok).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('maps unified creation failure to the retryable contract', async () => {
    const navigate = jest.fn();
    const createGenerationJob = jest.fn().mockResolvedValue({
      ok: false,
      message: 'Server busy.',
      retryable: true,
    });
    const result = await startLessonFromConfirmedText({
      confirmedText: 'hello world',
      sourceType: 'paste_text',
      destination: 'unified_lesson',
      origin: 'PasteText',
      navigate,
      createGenerationJob,
    });

    expect(result).toEqual({
      ok: false,
      message: 'Server busy.',
      retryable: true,
    });
    expect(navigate).not.toHaveBeenCalled();
  });
});
