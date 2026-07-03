export {createConsoleAnalyticsAdapter} from './adapters/ConsoleAnalyticsAdapter';
export {createFirebaseAnalyticsAdapter} from './adapters/FirebaseAnalyticsAdapter';
export {
  createInMemoryAnalyticsAdapter,
  type RecordedAnalyticsEvent,
} from './adapters/InMemoryAnalyticsAdapter';
export {
  getImageSizeCategory,
  resetAnalyticsAdapter,
  setAnalyticsAdapter,
  trackAppOpened,
  trackEvent,
} from './analyticsService';
export {getTextLengthBucket, type TextLengthBucket} from './textLengthBucket';
export {sanitizeAnalyticsPayload} from './sanitizeAnalyticsPayload';
export type {
  AnalyticsAdapter,
  AnalyticsEventName,
  InputMethod,
} from './types';
