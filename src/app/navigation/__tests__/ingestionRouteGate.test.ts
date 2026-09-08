import {getReleaseConfig} from '@/release';
import {
  isCapabilityChainEnabled,
  isIngestionRouteEnabled,
  isIngestionRouteHiddenForMvp,
  LEGACY_INGESTION_ROUTE_NAMES,
} from '../ingestionRouteGate';

const enabled = (overrides: Record<string, boolean> = {}) => ({
  pasteTextInput: true,
  imageInput: true,
  ocrScanner: true,
  ocrReviewEdit: true,
  aiLessonAnalysis: true,
  ...overrides,
});

describe('isIngestionRouteHiddenForMvp', () => {
  it('leaves ingestion routes registered when MVP review flow is disabled', () => {
    for (const route of LEGACY_INGESTION_ROUTE_NAMES) {
      expect(isIngestionRouteHiddenForMvp(route, false)).toBe(false);
    }
  });

  it('gates every legacy ingestion route when MVP review flow is enabled', () => {
    for (const route of LEGACY_INGESTION_ROUTE_NAMES) {
      expect(isIngestionRouteHiddenForMvp(route, true)).toBe(true);
    }
  });

  it('keeps non-ingestion routes visible in MVP mode', () => {
    expect(isIngestionRouteHiddenForMvp('HomeMain', true)).toBe(false);
    expect(isIngestionRouteHiddenForMvp('DailyReview', true)).toBe(false);
    expect(isIngestionRouteHiddenForMvp('LessonResult', true)).toBe(false);
    expect(isIngestionRouteHiddenForMvp('SavedLessonDetail', true)).toBe(false);
  });

  it('follows the lingobites-mvp release config', () => {
    const mvpConfig = getReleaseConfig('lingobites-mvp');
    const standardConfig = getReleaseConfig('situation-learning-release');

    expect(mvpConfig.features.lingobitesMvpReviewFlow).toBe(true);
    expect(standardConfig.features.lingobitesMvpReviewFlow).toBe(false);

    for (const route of LEGACY_INGESTION_ROUTE_NAMES) {
      expect(
        isIngestionRouteHiddenForMvp(
          route,
          Boolean(mvpConfig.features.lingobitesMvpReviewFlow),
        ),
      ).toBe(true);
      expect(
        isIngestionRouteHiddenForMvp(
          route,
          Boolean(standardConfig.features.lingobitesMvpReviewFlow),
        ),
      ).toBe(false);
    }
  });

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
