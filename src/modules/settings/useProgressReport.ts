import {
  exportPrivacySafeMetrics,
  formatPercentage,
  getCapabilityProgressReport,
} from '../../shared/db/PilotMetricsRepository';
import type {CapabilityProgressReport} from '../../shared/db/PilotMetricsRepository';

export type {CapabilityProgressReport};

/**
 * Public entry point for pilot-metrics reads. Screens call this instead of
 * importing `shared/db/PilotMetricsRepository` directly (SETE-118 Việc 3) —
 * the repository stays synchronous under the hood, this only relocates
 * which layer is allowed to know about it.
 *
 * Each member forwards to the repository by name at call time (not captured
 * once into an object) so `jest.spyOn(PilotMetricsRepository, ...)` in
 * existing tests keeps working through this indirection.
 */
export function useProgressReport() {
  return progressReport;
}

const progressReport = {
  getCapabilityProgressReport: (
    ...args: Parameters<typeof getCapabilityProgressReport>
  ) => getCapabilityProgressReport(...args),
  exportPrivacySafeMetrics: (
    ...args: Parameters<typeof exportPrivacySafeMetrics>
  ) => exportPrivacySafeMetrics(...args),
  formatPercentage: (...args: Parameters<typeof formatPercentage>) =>
    formatPercentage(...args),
};
