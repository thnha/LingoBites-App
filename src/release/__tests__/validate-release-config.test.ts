import { featureDependencies } from '../feature-dependencies';
import { featureRegistry } from '../feature-registry';
import { getReleaseConfig } from '../release-manifest';
import { validateReleaseConfig } from '../validate-release-config';

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

  it('rejects when a required feature is disabled', () => {
    const config = getReleaseConfig('close-beta-1');
    const result = validateReleaseConfig(
      {
        ...config,
        features: {
          ...config.features,
          lessonSave: false,
        },
      },
      featureRegistry,
      featureDependencies,
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes('lessonSave'))).toBe(
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
