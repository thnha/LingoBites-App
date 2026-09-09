import {featureDependencies} from '../feature-dependencies';
import {featureRegistry} from '../feature-registry';
import {getReleaseConfig, listReleaseConfigNames} from '../release-manifest';
import {validateReleaseConfig} from '../validate-release-config';

describe('lessonV2 feature flag (SETE-159 T17 / AC24)', () => {
  it('registers lessonV2 as non-required beta', () => {
    const entry = featureRegistry.find(e => e.key === 'lessonV2');
    expect(entry).toBeDefined();
    expect(entry?.required).toBe(false);
    expect(entry?.status).toBe('beta');
  });

  it('keeps lessonV2 disabled in every release preset until T16/T17 gates pass', () => {
    for (const name of listReleaseConfigNames()) {
      const config = getReleaseConfig(name);
      expect(config.features.lessonV2).toBe(false);
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
