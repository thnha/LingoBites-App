export const LEGACY_INGESTION_ROUTE_NAMES = [
  'PasteText',
  'ImageCapture',
  'OCRReview',
  'Analyzing',
] as const;

export type LegacyIngestionRouteName =
  (typeof LEGACY_INGESTION_ROUTE_NAMES)[number];

export function isIngestionRouteHiddenForMvp(
  routeName: string,
  mvpReviewFlowEnabled: boolean,
): boolean {
  return (
    mvpReviewFlowEnabled &&
    (LEGACY_INGESTION_ROUTE_NAMES as readonly string[]).includes(routeName)
  );
}
