import {
  isCapabilityChainEnabled,
  isIngestionRouteEnabled,
} from '../ingestionRouteGate';

const enabled = (overrides: Record<string, boolean> = {}) => ({
  pasteTextInput: true,
  imageInput: true,
  ocrScanner: true,
  ocrReviewEdit: true,
  aiLessonAnalysis: true,
  ...overrides,
});

describe('isIngestionRouteEnabled', () => {

  it('registers each route only when its complete capability chain is enabled', () => {
    expect(isIngestionRouteEnabled('PasteText', enabled())).toBe(true);
    expect(isIngestionRouteEnabled('ImageCapture', enabled())).toBe(true);
    expect(isIngestionRouteEnabled('OCRReview', enabled())).toBe(true);
    expect(isIngestionRouteEnabled('Analyzing', enabled())).toBe(true);

    expect(
      isIngestionRouteEnabled('ImageCapture', enabled({imageInput: false})),
    ).toBe(false);
    expect(
      isIngestionRouteEnabled('OCRReview', enabled({ocrScanner: false})),
    ).toBe(false);
    expect(
      isIngestionRouteEnabled('Analyzing', enabled({aiLessonAnalysis: false})),
    ).toBe(false);
    expect(
      isIngestionRouteEnabled('PasteText', enabled({pasteTextInput: false})),
    ).toBe(false);
    expect(isIngestionRouteEnabled('Unknown', enabled())).toBe(false);
  });

  it('gates Progressive Lesson by the lessonV2 capability', () => {
    expect(
      isIngestionRouteEnabled('ProgressiveLesson', {
        ...enabled(),
        lessonV2: true,
      }),
    ).toBe(true);
    expect(
      isIngestionRouteEnabled('ProgressiveLesson', {
        ...enabled(),
        lessonV2: false,
      }),
    ).toBe(false);
  });

  it('supports OR dependency groups without allowing a disabled capability', () => {
    const dependencies = {
      pasteTextInput: [],
      imageInput: [],
      ocrScanner: [['imageInput']],
      ocrReviewEdit: [['ocrScanner']],
      aiLessonAnalysis: [['pasteTextInput'], ['ocrReviewEdit']],
    } as never;

    expect(
      isCapabilityChainEnabled(
        'aiLessonAnalysis',
        enabled({pasteTextInput: true, ocrReviewEdit: false}),
        dependencies,
      ),
    ).toBe(true);
    expect(
      isCapabilityChainEnabled(
        'aiLessonAnalysis',
        enabled({pasteTextInput: false, ocrReviewEdit: false}),
        dependencies,
      ),
    ).toBe(false);
  });
});
