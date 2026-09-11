import {
  IMMERSIVE_STACK_ROUTES,
  shouldHideTabBarForRouteName,
} from '../immersiveTabRoutes';

describe('immersiveTabRoutes', () => {
  it('hides the tab bar on immersive lesson and YouTube processing routes', () => {
    for (const name of [
      'ContentLessonRuntime',
      'YouTubeProcessing',
      'YouTubeLesson',
    ]) {
      expect(shouldHideTabBarForRouteName(name)).toBe(true);
    }
  });

  it('keeps the tab bar on primary feed routes', () => {
    expect(shouldHideTabBarForRouteName('HomeMain')).toBe(false);
    expect(shouldHideTabBarForRouteName('LessonsList')).toBe(false);
    expect(shouldHideTabBarForRouteName(undefined)).toBe(false);
  });

  it('documents every immersive route in the set', () => {
    expect(IMMERSIVE_STACK_ROUTES.size).toBeGreaterThanOrEqual(4);
  });
});
