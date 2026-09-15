import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import {ScreenHeader} from '@components/ScreenHeader';
import {YouTubeInputScreen} from '../YouTubeInputScreen';

const mockGetString = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-native-clipboard/clipboard', () => ({
  __esModule: true,
  default: {
    getString: () => mockGetString(),
  },
}));

const navigation = {
  goBack: jest.fn(),
  navigate: mockNavigate,
} as unknown as React.ComponentProps<typeof YouTubeInputScreen>['navigation'];

const route = {
  key: 'YouTubeInput',
  name: 'YouTubeInput',
  params: undefined,
} as React.ComponentProps<typeof YouTubeInputScreen>['route'];

describe('YouTubeInputScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('pastes a clipboard URL into the field', async () => {
    mockGetString.mockResolvedValue(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );

    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <YouTubeInputScreen navigation={navigation} route={route} />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });

    await act(async () => {
      tree.root.findByProps({testID: 'youtube-paste-url'}).props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({testID: 'youtube-url-input'}).props.value,
    ).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('opens History on the root stack (SETE-289, AC-3)', () => {
    const rootNavigate = jest.fn();
    const historyNav = {
      goBack: jest.fn(),
      navigate: mockNavigate,
      getParent: () => ({
        navigate: jest.fn(),
        getParent: () => ({navigate: rootNavigate}),
      }),
    } as unknown as React.ComponentProps<
      typeof YouTubeInputScreen
    >['navigation'];

    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <YouTubeInputScreen navigation={historyNav} route={route} />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });

    act(() => {
      tree.root.findByProps({testID: 'youtube-open-history'}).props.onPress();
    });

    expect(rootNavigate).toHaveBeenCalledWith('YouTubeHistory');
  });

  it('shows server limits before submit', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <YouTubeInputScreen navigation={navigation} route={route} />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });

    expect(
      tree.root.findByProps({testID: 'youtube-input-limits'}).props.children,
    ).toContain('15');
    expect(
      tree.root.findByProps({testID: 'youtube-input-limits'}).props.children,
    ).toContain('400');
  });

  it('returns to Home from Back when opened from Home (HVB-04)', () => {
    const tabNavigate = jest.fn();
    const reset = jest.fn();
    const goBack = jest.fn();
    const fromHomeNav = {
      goBack,
      navigate: mockNavigate,
      reset,
      canGoBack: () => true,
      getParent: () => ({navigate: tabNavigate}),
      // SETE-289: fromHome subscribes a beforeRemove interceptor.
      addListener: () => () => {},
    } as unknown as React.ComponentProps<
      typeof YouTubeInputScreen
    >['navigation'];
    const fromHomeRoute = {
      key: 'YouTubeInput',
      name: 'YouTubeInput',
      params: {fromHome: true},
    } as unknown as React.ComponentProps<typeof YouTubeInputScreen>['route'];

    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <YouTubeInputScreen
              navigation={fromHomeNav}
              route={fromHomeRoute}
            />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });

    act(() => {
      tree.root.findByType(ScreenHeader).props.onBack();
    });

    // SETE-287: exiting fromHome must reset the Create stack so the next
    // visit to the Create tab mounts CreateMain.
    expect(reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{name: 'CreateMain'}],
    });
    expect(tabNavigate).toHaveBeenCalledWith('Home');
    expect(goBack).not.toHaveBeenCalled();
  });

  it('resets to CreateMain when opened from Home as the only stack entry (SETE-287)', () => {
    const tabNavigate = jest.fn();
    const reset = jest.fn();
    const popToTop = jest.fn();
    const goBack = jest.fn();
    const singleEntryNav = {
      goBack,
      navigate: mockNavigate,
      reset,
      popToTop,
      canGoBack: () => false,
      getParent: () => ({navigate: tabNavigate}),
      // SETE-289: fromHome subscribes a beforeRemove interceptor.
      addListener: () => () => {},
    } as unknown as React.ComponentProps<
      typeof YouTubeInputScreen
    >['navigation'];
    const fromHomeRoute = {
      key: 'YouTubeInput',
      name: 'YouTubeInput',
      params: {fromHome: true},
    } as unknown as React.ComponentProps<typeof YouTubeInputScreen>['route'];

    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <YouTubeInputScreen
              navigation={singleEntryNav}
              route={fromHomeRoute}
            />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });

    act(() => {
      tree.root.findByType(ScreenHeader).props.onBack();
    });

    expect(reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{name: 'CreateMain'}],
    });
    expect(popToTop).not.toHaveBeenCalled();
    expect(tabNavigate).toHaveBeenCalledWith('Home');
    expect(goBack).not.toHaveBeenCalled();
  });

  it('uses stack Back when opened from inside Create (HVB-04)', () => {
    const goBack = jest.fn();
    const stackedNav = {
      goBack,
      navigate: mockNavigate,
    } as unknown as React.ComponentProps<
      typeof YouTubeInputScreen
    >['navigation'];

    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <YouTubeInputScreen navigation={stackedNav} route={route} />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });

    act(() => {
      tree.root.findByType(ScreenHeader).props.onBack();
    });

    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('falls back to CreateMain when Back has nowhere to pop (SETE-310)', () => {
    const goBack = jest.fn();
    const navigate = jest.fn();
    const singleEntryNav = {
      goBack,
      navigate,
      canGoBack: () => false,
      // No fromHome: plain in-tab entry restored as the only stack route.
      addListener: () => () => {},
    } as unknown as React.ComponentProps<
      typeof YouTubeInputScreen
    >['navigation'];

    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <YouTubeInputScreen navigation={singleEntryNav} route={route} />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });

    act(() => {
      tree.root.findByType(ScreenHeader).props.onBack();
    });

    // A dead goBack() would strand the user with no path to the composer.
    expect(goBack).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('CreateMain');
  });

  // SETE-289: the header Back button is bypassed by the iOS swipe
  // gesture and the Android system Back (native POP). From Home, those
  // paths must honor fromHome instead of landing on CreateMain.
  function renderFromHomeInput(addListener: jest.Mock) {
    const tabNavigate = jest.fn();
    const reset = jest.fn();
    const nav = {
      goBack: jest.fn(),
      navigate: mockNavigate,
      reset,
      canGoBack: () => true,
      getParent: () => ({navigate: tabNavigate}),
      addListener,
    } as unknown as React.ComponentProps<
      typeof YouTubeInputScreen
    >['navigation'];
    const fromHomeRoute = {
      key: 'YouTubeInput',
      name: 'YouTubeInput',
      params: {fromHome: true},
    } as unknown as React.ComponentProps<typeof YouTubeInputScreen>['route'];

    act(() => {
      ReactTestRenderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <YouTubeInputScreen navigation={nav} route={fromHomeRoute} />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });
    return {reset, tabNavigate};
  }

  function beforeRemoveListener(addListener: jest.Mock) {
    const call = addListener.mock.calls.find(
      ([event]) => event === 'beforeRemove',
    );
    if (!call) throw new Error('No beforeRemove subscription');
    return call[1] as (e: {
      preventDefault: jest.Mock;
      data: {action: {type: string}};
    }) => void;
  }

  it('intercepts a native POP from Home and exits to Home (not CreateMain)', () => {
    const addListener = jest.fn(() => () => {});
    const {reset, tabNavigate} = renderFromHomeInput(addListener);

    const preventDefault = jest.fn();
    act(() => {
      beforeRemoveListener(addListener)({
        preventDefault,
        data: {action: {type: 'POP'}},
      });
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{name: 'CreateMain'}],
    });
    expect(tabNavigate).toHaveBeenCalledWith('Home');
  });

  it('lets non-POP removals through (e.g. our own reset)', () => {
    const addListener = jest.fn(() => () => {});
    const {reset, tabNavigate} = renderFromHomeInput(addListener);

    const preventDefault = jest.fn();
    act(() => {
      beforeRemoveListener(addListener)({
        preventDefault,
        data: {action: {type: 'RESET'}},
      });
    });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();
    expect(tabNavigate).not.toHaveBeenCalled();
  });

  it('subscribes no interceptor without fromHome', () => {
    const addListener = jest.fn(() => () => {});
    const nav = {
      goBack: jest.fn(),
      navigate: mockNavigate,
      addListener,
    } as unknown as React.ComponentProps<
      typeof YouTubeInputScreen
    >['navigation'];

    act(() => {
      ReactTestRenderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <YouTubeInputScreen navigation={nav} route={route} />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });

    expect(addListener).not.toHaveBeenCalled();
  });
});
