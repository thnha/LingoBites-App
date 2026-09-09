import type {FeatureKey} from '@/release';
import {featureDependencies} from '@/release';

export const INGESTION_ROUTE_REQUIREMENTS = {
  PasteText: 'pasteTextInput',
  ImageCapture: 'imageInput',
  OCRReview: 'ocrReviewEdit',
  Analyzing: 'aiLessonAnalysis',
  ProgressiveLesson: 'lessonV2',
} as const satisfies Record<string, FeatureKey>;

export type IngestionRouteName = keyof typeof INGESTION_ROUTE_REQUIREMENTS;

/** @deprecated Kept for callers outside navigation while presets migrate. */
export const LEGACY_INGESTION_ROUTE_NAMES = Object.keys(
  INGESTION_ROUTE_REQUIREMENTS,
) as IngestionRouteName[];
export type LegacyIngestionRouteName = IngestionRouteName;

type FeatureFlags = Partial<Record<FeatureKey, boolean>>;

/** Resolves a feature and all of its OR/AND dependency groups. */
export function isCapabilityChainEnabled(
  feature: FeatureKey,
  flags: FeatureFlags,
  dependencies: Record<FeatureKey, FeatureKey[][]> = featureDependencies,
  visiting = new Set<FeatureKey>(),
): boolean {
  if (!flags[feature] || visiting.has(feature)) {
    return false;
  }

  const nextVisiting = new Set(visiting).add(feature);
  const groups = dependencies[feature] ?? [];
  return (
    groups.length === 0 ||
    groups.some(group =>
      group.every(dependency =>
        isCapabilityChainEnabled(dependency, flags, dependencies, nextVisiting),
      ),
    )
  );
}

export function isIngestionRouteEnabled(
  routeName: string,
  flags: FeatureFlags,
): boolean {
  const feature = INGESTION_ROUTE_REQUIREMENTS[routeName as IngestionRouteName];
  return feature ? isCapabilityChainEnabled(feature, flags) : false;
}

/** @deprecated Route registration must use capability flags. */
export function isIngestionRouteHiddenForMvp(
  routeName: string,
  mvpReviewFlowEnabled: boolean,
): boolean {
  return (
    mvpReviewFlowEnabled &&
    LEGACY_INGESTION_ROUTE_NAMES.includes(routeName as IngestionRouteName)
  );
}
