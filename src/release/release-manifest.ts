import closeBeta1 from './configs/close-beta-1.json';
import miniGameRelease from './configs/mini-game-release.json';
import situationLearningRelease from './configs/situation-learning-release.json';
import themeRelease from './configs/theme-release.json';
import type { ReleaseConfig } from './types';

export const DEFAULT_RELEASE_NAME = 'close-beta-1';

export type ReleaseConfigName =
  | 'close-beta-1'
  | 'theme-release'
  | 'mini-game-release'
  | 'situation-learning-release';

const releaseConfigs: Record<ReleaseConfigName, ReleaseConfig> = {
  'close-beta-1': closeBeta1 as ReleaseConfig,
  'theme-release': themeRelease as ReleaseConfig,
  'mini-game-release': miniGameRelease as ReleaseConfig,
  'situation-learning-release': situationLearningRelease as ReleaseConfig,
};

export function getReleaseConfig(
  releaseName: ReleaseConfigName = DEFAULT_RELEASE_NAME,
): ReleaseConfig {
  const config = releaseConfigs[releaseName];
  if (!config) {
    throw new Error(`Unknown release config: ${releaseName}`);
  }
  return config;
}

export function listReleaseConfigNames(): ReleaseConfigName[] {
  return Object.keys(releaseConfigs) as ReleaseConfigName[];
}
