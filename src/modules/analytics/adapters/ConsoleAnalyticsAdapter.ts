import type {AnalyticsAdapter, AnalyticsEventName, AnalyticsProperties} from '../types';
import {sanitizeAnalyticsPayload} from '../sanitizeAnalyticsPayload';

export function createConsoleAnalyticsAdapter(): AnalyticsAdapter {
  return {
    track(event: AnalyticsEventName, properties?: AnalyticsProperties) {
      const payload = sanitizeAnalyticsPayload(properties ?? {});
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.info('[analytics]', event, payload);
      }
    },
  };
}
