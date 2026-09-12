import { validateReleaseConfig } from './src/release/validate-release-config';
import { featureRegistry } from './src/release/feature-registry';
import { featureDependencies } from './src/release/feature-dependencies';

const result = validateReleaseConfig(
  {
    releaseName: 'test',
    features: { miniGame: true }
  },
  featureRegistry,
  featureDependencies
);

console.log(result.errors);
