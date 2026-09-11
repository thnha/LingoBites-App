import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
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
});
