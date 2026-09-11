import type {ParamListBase, RouteProp} from '@react-navigation/native';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';

/**
 * Stack routes that should hide the root floating tab bar (SETE-240 P1).
 * Feed screens keep the tab bar and use `useFloatingTabBarClearance()` instead.
 */
export const IMMERSIVE_STACK_ROUTES = new Set([
  'Analyzing',
  'ContentLessonRuntime',
  'ProgressiveLesson',
  'SpeakingRoom',
  'SpeakingShadowing',
  'YouTubeLesson',
  'YouTubeManualTranscript',
  'YouTubeProcessing',
]);

export function shouldHideTabBarForRouteName(
  routeName: string | undefined,
): boolean {
  if (!routeName) {
    return false;
  }
  return IMMERSIVE_STACK_ROUTES.has(routeName);
}

export function shouldHideTabBarForStackRoute(
  route: Partial<RouteProp<ParamListBase>>,
): boolean {
  return shouldHideTabBarForRouteName(getFocusedRouteNameFromRoute(route));
}

export function tabBarVisibilityOptions({
  route,
}: {
  route: Partial<RouteProp<ParamListBase>>;
}) {
  const hidden = shouldHideTabBarForStackRoute(route);
  return {
    tabBarStyle: hidden
      ? {display: 'none' as const}
      : {display: 'flex' as const},
  };
}
