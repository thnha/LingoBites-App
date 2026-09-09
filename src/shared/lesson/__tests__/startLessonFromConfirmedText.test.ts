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
});
