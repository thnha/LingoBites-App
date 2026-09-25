import {featureRegistry} from '../feature-registry';
import {getReleaseConfig, listReleaseConfigNames} from '../release-manifest';
import {validateReleaseConfig} from '../validate-release-config';
import {featureDependencies} from '../feature-dependencies';

describe('unifiedLesson feature flag (LING-21 TASK-006)', () => {
  it('registers unifiedLesson as non-required and not yet implemented', () => {
    const entry = featureRegistry.find(e => e.key === 'unifiedLesson');
    expect(entry).toBeDefined();
    expect(entry?.required).toBe(false);
    expect(entry?.status).toBe('not_implemented');
  });

  it('keeps unified mode disabled in every release preset', () => {
    expect(listReleaseConfigNames()).toEqual(['dev', 'production']);
    for (const name of listReleaseConfigNames()) {
      const config = getReleaseConfig(name);
      expect(config.features.unifiedLesson).toBe(false);
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
