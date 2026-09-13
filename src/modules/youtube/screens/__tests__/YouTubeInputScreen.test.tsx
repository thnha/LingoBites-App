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
    const popToTop = jest.fn();
    const goBack = jest.fn();
    const fromHomeNav = {
      goBack,
      navigate: mockNavigate,
      popToTop,
      canGoBack: () => true,
      getParent: () => ({navigate: tabNavigate}),
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

    expect(popToTop).toHaveBeenCalledTimes(1);
    expect(tabNavigate).toHaveBeenCalledWith('Home');
    expect(goBack).not.toHaveBeenCalled();
  });

  it('skips popToTop when opened from Home as the only stack entry (DEFECT-SETE-286-01)', () => {
    const tabNavigate = jest.fn();
    const popToTop = jest.fn();
    const goBack = jest.fn();
    const singleEntryNav = {
      goBack,
      navigate: mockNavigate,
      popToTop,
      canGoBack: () => false,
      getParent: () => ({navigate: tabNavigate}),
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
});
