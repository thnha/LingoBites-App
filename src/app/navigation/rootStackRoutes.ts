import type {RootStackParamList} from './types';

/**
 * SETE-289: names of the RootStack routes that sit above the tabs. Pure
 * (no JSX, no navigator imports) so the root registration contract is
 * unit-testable without mounting a navigator (AC-1/AC-11): `Tabs` always
 * mounts; the History / lesson / detail routes mount only while
 * `youtubeLearning` is on. `AppNavigator` drives its JSX from this helper
 * so the two cannot drift apart.
 */
export function getRootStackRouteNames(features: {
  youtubeLearning?: unknown;
}): Array<Extract<keyof RootStackParamList, string>> {
  const names: Array<Extract<keyof RootStackParamList, string>> = ['Tabs'];
  if (features?.youtubeLearning) {
    names.push(
      'YouTubeHistory',
      'YouTubeLesson',
      'SentenceDetail',
      'WordDetail',
      'GrammarDetail',
      'Practice',
    );
  }
  return names;
}
