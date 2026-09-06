import { getReleaseConfig } from '../../../release';
import {
  isIngestionRouteHiddenForMvp,
  LEGACY_INGESTION_ROUTE_NAMES,
} from '../ingestionRouteGate';

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
});
