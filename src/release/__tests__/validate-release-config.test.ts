import {featureDependencies} from '../feature-dependencies';
import {featureRegistry} from '../feature-registry';
import {getReleaseConfig} from '../release-manifest';
import {validateReleaseConfig} from '../validate-release-config';

describe('validateReleaseConfig', () => {
  it('accepts close-beta-1 preset', () => {
    const config = getReleaseConfig('close-beta-1');
    const result = validateReleaseConfig(
      config,
      featureRegistry,
      featureDependencies,
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('accepts theme-release preset', () => {
    const config = getReleaseConfig('theme-release');
    const result = validateReleaseConfig(
      config,
      featureRegistry,
      featureDependencies,
    );
    expect(result.valid).toBe(true);
  });

  it('accepts mini-game-release preset', () => {
    const config = getReleaseConfig('mini-game-release');
    const result = validateReleaseConfig(
      config,
      featureRegistry,
      featureDependencies,
    );
    expect(result.valid).toBe(true);
  });

  it('accepts situation-learning-release preset', () => {
    const config = getReleaseConfig('situation-learning-release');
    const result = validateReleaseConfig(
      config,
      featureRegistry,
      featureDependencies,
    );
    expect(result.valid).toBe(true);
  });

  it('accepts lingobites-mvp preset with review enabled and legacy ingestion disabled', () => {
    const config = getReleaseConfig('lingobites-mvp');
    const result = validateReleaseConfig(
      config,
      featureRegistry,
      featureDependencies,
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);

    // The MVP keeps the saved-lesson + review path so the offline review flow
    // is reachable, while disabling legacy OCR/AI/paste ingestion.
    expect(config.features.reviewSystem).toBe(true);
    expect(config.features.lingobitesMvpReviewFlow).toBe(true);
    expect(config.features.lessonResultView).toBe(true);
    expect(config.features.lessonSave).toBe(true);
    expect(config.features.lessonHistory).toBe(true);
    expect(config.features.pasteTextInput).toBe(false);
    expect(config.features.imageInput).toBe(false);
    expect(config.features.ocrScanner).toBe(false);
    expect(config.features.aiLessonAnalysis).toBe(false);
  });

  it('accepts all-features preset with every implemented feature enabled', () => {
    const config = getReleaseConfig('all-features');
    const result = validateReleaseConfig(
      config,
      featureRegistry,
      featureDependencies,
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);

    // Every ready/beta feature is on; not_implemented stays off so the
    // validator never reports "Cannot enable ... not_implemented".
    for (const entry of featureRegistry) {
      if (entry.status === 'not_implemented') {
        expect(config.features[entry.key]).toBe(false);
      } else {
        expect(config.features[entry.key]).toBe(true);
      }
    }
    expect(config.features.lessonV2).toBe(true);
  });

  it('rejects miniGame when lessonSave is disabled', () => {
    const config = getReleaseConfig('close-beta-1');
    const result = validateReleaseConfig(
      {
        ...config,
        features: {
          ...config.features,
          miniGame: true,
          reviewSystem: true,
          lessonSave: false,
        },
      },
      featureRegistry,
      featureDependencies,
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes('miniGame'))).toBe(true);
  });

  it('rejects reviewSystem when lessonSave is disabled', () => {
    const config = getReleaseConfig('close-beta-1');
    const result = validateReleaseConfig(
      {
        ...config,
        features: {
          ...config.features,
          reviewSystem: true,
          lessonSave: false,
        },
      },
      featureRegistry,
      featureDependencies,
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes('reviewSystem'))).toBe(
      true,
    );
  });

  it('rejects unknown feature keys', () => {
    const config = getReleaseConfig('close-beta-1');
    const result = validateReleaseConfig(
      {
        ...config,
        features: {
          ...config.features,
          unknownFeature: true,
        },
      },
      featureRegistry,
      featureDependencies,
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes('unknownFeature'))).toBe(
      true,
    );
  });
});

import {DEFAULT_RELEASE_NAME} from '../release-manifest';

describe('DEFAULT_RELEASE_NAME', () => {
  it('remains lingobites-mvp', () => {
    expect(DEFAULT_RELEASE_NAME).toBe('lingobites-mvp');
  });
});
