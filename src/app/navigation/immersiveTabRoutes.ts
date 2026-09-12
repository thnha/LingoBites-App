import type {ParamListBase, RouteProp} from '@react-navigation/native';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';

/**
 * Stack routes that should hide the root floating tab bar (SETE-240 P1).
 * Feed screens keep the tab bar and use `useFloatingTabBarClearance()` instead.
 */
export const IMMERSIVE_STACK_ROUTES = new Set([
  'Analyzing',
  'ContentLessonRuntime',
  'DailyReview',
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

/**
 * The root navigator renders a custom floating `TabBar`, which — unlike the
 * default tab bar — does not apply `tabBarStyle` itself (BottomTabView only
 * forwards it to `getTabBarHeight`). So the custom bar must check the
 * focused tab descriptor's style and render nothing when the active stack
 * sits on an immersive route (SETE-255).
 */
export function isTabBarHiddenForDescriptors(
  state: {index: number; routes: Array<{key: string}>},
  descriptors: Record<string, {options?: {tabBarStyle?: unknown}}>,
): boolean {
  const focusedKey = state.routes[state.index]?.key;
  if (!focusedKey) {
    return false;
  }
  const style = descriptors[focusedKey]?.options?.tabBarStyle as
    | {display?: unknown}
    | undefined;
  return style?.display === 'none';
}
