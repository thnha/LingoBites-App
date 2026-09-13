import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Alert} from 'react-native';
import {AppThemeProvider} from '@theme';
import {FeatureFlagProvider} from '@/release';
import {ScreenHeader} from '@components/ScreenHeader';
import type {YouTubeTranscript} from '@shared/schemas/youtube-transcript-v1';
import {YouTubeHistoryScreen} from '../YouTubeHistoryScreen';

const mockListYouTubeLessons = jest.fn();
const mockDeleteYouTubeLesson = jest.fn();
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@shared/db/YoutubeLessonRepository', () => ({
  listYouTubeLessons: (...args: unknown[]) => mockListYouTubeLessons(...args),
  deleteYouTubeLesson: (...args: unknown[]) =>
    mockDeleteYouTubeLesson(...args),
}));

jest.mock('@react-navigation/native', () => {
  const ReactModule = require('react');
  return {
    // Run the focus callback as an effect (like the real
    // useFocusEffect): invoking it during render would setState in render
    // and loop, because refresh() writes to local state.
    useFocusEffect: (callback: () => void) =>
      ReactModule.useEffect(callback, [callback]),
  };
});

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

function makeLesson(videoId: string, title: string): YouTubeTranscript {
  return {
    schema_version: 'youtube-transcript-v1',
    video: {
      id: videoId,
      title,
      channel_title: 'Lingo Bites',
      duration_seconds: 120,
      language: 'en',
      embeddable: true,
    },
    transcript_source: 'auto_caption',
    segments: [
      {
        id: `${videoId}-0`,
        index: 0,
        start_ms: 0,
        end_ms: 1200,
        en: 'Hello there.',
        vi: 'Xin chào.',
        ipa: '/həˈloʊ ðer/',
      },
    ],
    warnings: [],
  };
}

const navigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
} as unknown as React.ComponentProps<
  typeof YouTubeHistoryScreen
>['navigation'];

const route = {
  key: 'YouTubeHistory',
  name: 'YouTubeHistory',
} as unknown as React.ComponentProps<typeof YouTubeHistoryScreen>['route'];

function renderScreen(
  nav = navigation,
  screenRoute = route,
) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>
          <YouTubeHistoryScreen navigation={nav} route={screenRoute} />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  return tree;
}

function pressHeaderBack(tree: ReactTestRenderer.ReactTestRenderer) {
  const onBack = tree.root.findByType(ScreenHeader).props.onBack;
  if (typeof onBack !== 'function') throw new Error('No back handler');
  act(() => {
    onBack();
  });
}

describe('YouTubeHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the empty state when nothing is saved', () => {
    mockListYouTubeLessons.mockReturnValue([]);

    const tree = renderScreen();

    expect(
      tree.root.findByProps({testID: 'youtube-history-empty'}),
    ).toBeTruthy();
    expect(() =>
      tree.root.findByProps({testID: 'youtube-history-list'}),
    ).toThrow();
  });

  it('lists saved lessons and opens the selected one by lesson id', () => {
    mockListYouTubeLessons.mockReturnValue([
      makeLesson('dQw4w9WgXcQ', 'First video'),
      makeLesson('abcdefghijk', 'Second video'),
    ]);

    const tree = renderScreen();

    expect(tree.root.findByProps({testID: 'youtube-history-list'})).toBeTruthy();
    expect(
      tree.root.findByProps({testID: 'youtube-history-item-dQw4w9WgXcQ'}),
    ).toBeTruthy();

    act(() => {
      tree.root
        .findByProps({testID: 'youtube-history-item-abcdefghijk'})
        .props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('YouTubeLesson', {
      lessonId: 'abcdefghijk',
    });
  });

  it('deletes a lesson after confirmation and refreshes the list', () => {
    const lesson = makeLesson('dQw4w9WgXcQ', 'First video');
    mockListYouTubeLessons.mockReturnValue([lesson]);
    mockDeleteYouTubeLesson.mockReturnValue(true);

    const tree = renderScreen();

    act(() => {
      tree.root
        .findByProps({testID: 'youtube-history-delete-dQw4w9WgXcQ'})
        .props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    const confirmButton = (Alert.alert as jest.Mock).mock.calls[0][2].find(
      (button: {text: string; style?: string; onPress?: () => void}) =>
      button.style === 'destructive',
    );

    mockListYouTubeLessons.mockReturnValue([]);
    act(() => {
      confirmButton.onPress();
    });

    expect(mockDeleteYouTubeLesson).toHaveBeenCalledWith('dQw4w9WgXcQ');
    expect(
      tree.root.findByProps({testID: 'youtube-history-empty'}),
    ).toBeTruthy();
  });

  it('shows the create-new CTA with items and opens a fresh Input on press (HVB-11)', () => {
    mockListYouTubeLessons.mockReturnValue([
      makeLesson('dQw4w9WgXcQ', 'First video'),
      makeLesson('abcdefghijk', 'Second video'),
    ]);

    const tree = renderScreen();

    const cta = tree.root.findByProps({testID: 'youtube-history-create-new'});
    expect(cta.props.accessibilityLabel).toBeTruthy();

    act(() => {
      cta.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('YouTubeInput');
    // Existing rows are untouched by opening the composer.
    expect(
      tree.root.findByProps({testID: 'youtube-history-item-dQw4w9WgXcQ'}),
    ).toBeTruthy();
    expect(
      tree.root.findByProps({testID: 'youtube-history-item-abcdefghijk'}),
    ).toBeTruthy();
  });

  it('hides the create-new CTA when the store is empty', () => {
    mockListYouTubeLessons.mockReturnValue([]);

    const tree = renderScreen();

    expect(
      tree.root.findByProps({testID: 'youtube-history-empty'}),
    ).toBeTruthy();
    expect(() =>
      tree.root.findByProps({testID: 'youtube-history-create-new'}),
    ).toThrow();
  });

  it('hides the create-new CTA on load error and keeps retry (HVB-01E)', () => {
    mockListYouTubeLessons.mockImplementation(() => {
      throw new Error('db locked');
    });

    const tree = renderScreen();

    expect(
      tree.root.findByProps({testID: 'youtube-history-error'}),
    ).toBeTruthy();
    expect(
      tree.root.findByProps({testID: 'youtube-history-retry'}),
    ).toBeTruthy();
    expect(() =>
      tree.root.findByProps({testID: 'youtube-history-create-new'}),
    ).toThrow();
  });

  it('returns to Home from Back when opened from Home (HVB-04)', () => {
    mockListYouTubeLessons.mockReturnValue([
      makeLesson('dQw4w9WgXcQ', 'First video'),
    ]);
    const tabNavigate = jest.fn();
    const popToTop = jest.fn();
    const fromHomeNav = {
      navigate: mockNavigate,
      goBack: mockGoBack,
      popToTop,
      getParent: () => ({navigate: tabNavigate}),
    } as unknown as React.ComponentProps<
      typeof YouTubeHistoryScreen
    >['navigation'];
    const fromHomeRoute = {
      key: 'YouTubeHistory',
      name: 'YouTubeHistory',
      params: {fromHome: true},
    } as unknown as React.ComponentProps<
      typeof YouTubeHistoryScreen
    >['route'];

    const tree = renderScreen(fromHomeNav, fromHomeRoute);
    pressHeaderBack(tree);

    expect(popToTop).toHaveBeenCalledTimes(1);
    expect(tabNavigate).toHaveBeenCalledWith('Home');
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('uses stack Back when opened from inside Create (HVB-04)', () => {
    mockListYouTubeLessons.mockReturnValue([
      makeLesson('dQw4w9WgXcQ', 'First video'),
    ]);

    const tree = renderScreen();
    pressHeaderBack(tree);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('surfaces an inline error when deletion fails', () => {
    mockListYouTubeLessons.mockReturnValue([
      makeLesson('dQw4w9WgXcQ', 'First video'),
    ]);
    mockDeleteYouTubeLesson.mockReturnValue(false);

    const tree = renderScreen();

    act(() => {
      tree.root
        .findByProps({testID: 'youtube-history-delete-dQw4w9WgXcQ'})
        .props.onPress();
    });

    const confirmButton = (Alert.alert as jest.Mock).mock.calls[0][2].find(
      (button: {text: string; style?: string; onPress?: () => void}) =>
      button.style === 'destructive',
    );
    act(() => {
      confirmButton.onPress();
    });

    expect(
      tree.root.findByProps({testID: 'youtube-history-delete-error'}),
    ).toBeTruthy();
    // The failed delete keeps the row visible.
    expect(
      tree.root.findByProps({testID: 'youtube-history-item-dQw4w9WgXcQ'}),
    ).toBeTruthy();
  });
});
