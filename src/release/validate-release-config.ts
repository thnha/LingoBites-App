import { featureKeys } from './feature-registry';
import type {
  FeatureRegistryEntry,
  ReleaseConfig,
  ReleaseValidationResult,
} from './types';

export function validateReleaseConfig(
  config: ReleaseConfig,
  registry: FeatureRegistryEntry[],
  dependencies: Record<string, string[]>,
): ReleaseValidationResult {
  const errors: string[] = [];
  const enabled = config.features;
  const registryKeySet = new Set(registry.map(entry => entry.key));

  for (const entry of registry) {
    if (entry.required && !enabled[entry.key]) {
      errors.push(`Required feature "${entry.key}" must be enabled.`);
    }
  }

  for (const key of Object.keys(enabled)) {
    if (!registryKeySet.has(key)) {
      errors.push(`Unknown feature key "${key}".`);
    }
  }

  for (const [key, isOn] of Object.entries(enabled)) {
    if (!isOn) {
      continue;
    }

    const deps = dependencies[key] ?? [];
    for (const dep of deps) {
      if (!enabled[dep]) {
        errors.push(
          `Invalid release config: "${key}" requires "${dep}" to be enabled.`,
        );
      }
    }
  }

  const missingRegistryKeys = featureKeys.filter(key => !(key in enabled));
  if (missingRegistryKeys.length > 0) {
    errors.push(
      `Release config is missing feature keys: ${missingRegistryKeys.join(', ')}.`,
    );
  }

  return { valid: errors.length === 0, errors };
}
