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

  it('keeps lessonV2 disabled in legacy presets and enables only lesson-v2-beta', () => {
    for (const name of listReleaseConfigNames()) {
      const config = getReleaseConfig(name);
      expect(config.features.lessonV2).toBe(name === 'lesson-v2-beta');
      const result = validateReleaseConfig(
        config,
        featureRegistry,
        featureDependencies,
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    }
  });

  it('enables the complete OCR and Lesson V2 route capability set in lesson-v2-beta', () => {
    const config = getReleaseConfig('lesson-v2-beta');

    expect(config.features.imageInput).toBe(true);
    expect(config.features.ocrScanner).toBe(true);
    expect(config.features.ocrReviewEdit).toBe(true);
    expect(config.features.lessonV2).toBe(true);
  });
});
