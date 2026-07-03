export type FeatureReleaseGroup =
  | 'foundation'
  | 'ui'
  | 'practice'
  | 'expansion';

export type FeatureRegistryEntry = {
  key: string;
  module: string;
  required: boolean;
  releaseGroup: FeatureReleaseGroup;
  description?: string;
};

export type ReleaseConfig = {
  releaseName: string;
  description?: string;
  features: Record<string, boolean>;
};

export type ReleaseValidationResult = {
  valid: boolean;
  errors: string[];
};
