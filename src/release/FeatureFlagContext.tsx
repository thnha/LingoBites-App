import React, { createContext, useMemo } from 'react';
import { featureDependencies } from './feature-dependencies';
import { featureRegistry } from './feature-registry';
import type { FeatureKey } from './feature-registry';
import {
  DEFAULT_RELEASE_NAME,
  getReleaseConfig,
  type ReleaseConfigName,
} from './release-manifest';
import type { ReleaseConfig } from './types';
import { validateReleaseConfig } from './validate-release-config';

export type FeatureFlagContextValue = {
  releaseName: string;
  config: ReleaseConfig;
  isFeatureEnabled: (key: FeatureKey) => boolean;
};

export const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(
  null,
);

type FeatureFlagProviderProps = {
  children: React.ReactNode;
  releaseName?: ReleaseConfigName;
};

export function FeatureFlagProvider({
  children,
  releaseName = DEFAULT_RELEASE_NAME,
}: FeatureFlagProviderProps) {
  const value = useMemo(() => {
    const config = getReleaseConfig(releaseName);
    const validation = validateReleaseConfig(
      config,
      featureRegistry,
      featureDependencies,
    );

    if (!validation.valid) {
      throw new Error(
        `Invalid release config "${releaseName}":\n${validation.errors.join('\n')}`,
      );
    }

    return {
      releaseName: config.releaseName,
      config,
      isFeatureEnabled: (key: FeatureKey) => Boolean(config.features[key]),
    };
  }, [releaseName]);

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}
