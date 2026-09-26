import {featureRegistry} from '../feature-registry';
import {getReleaseConfig, listReleaseConfigNames} from '../release-manifest';
import {validateReleaseConfig} from '../validate-release-config';
import {featureDependencies} from '../feature-dependencies';

describe('unifiedLesson feature flag (LING-41 TASK-006)', () => {
  it('registers unifiedLesson as non-required beta (activatable behind the capability gate)', () => {
    const entry = featureRegistry.find(e => e.key === 'unifiedLesson');
    expect(entry).toBeDefined();
    expect(entry?.required).toBe(false);
    expect(entry?.status).toBe('beta');
  });

  it('enables unified mode in every release preset behind the fail-closed capability gate', () => {
    expect(listReleaseConfigNames()).toEqual(['dev', 'production']);
    for (const name of listReleaseConfigNames()) {
      const config = getReleaseConfig(name);
      // The flag is on; activation still requires all five Server
      // capabilities, so old/unreachable backends keep legacy flows.
      expect(config.features.unifiedLesson).toBe(true);
      const result = validateReleaseConfig(
        config,
        featureRegistry,
        featureDependencies,
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    }
  });
});
