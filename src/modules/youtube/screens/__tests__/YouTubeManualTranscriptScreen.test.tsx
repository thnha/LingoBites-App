import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {ScrollView} from 'react-native';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import {YouTubeManualTranscriptScreen} from '../YouTubeManualTranscriptScreen';
import {YouTubeInputScreen} from '../YouTubeInputScreen';

function renderWithProviders(element: React.ReactElement) {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>{element}</AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  return tree!;
}

describe('YouTubeManualTranscriptScreen', () => {
  const mockNavigate = jest.fn();
  const mockReplace = jest.fn();
  const mockGoBack = jest.fn();

  const createProps = (url = 'https://www.youtube.com/watch?v=OlulrDOixEg') =>
    ({
      navigation: {
        navigate: mockNavigate,
        replace: mockReplace,
        goBack: mockGoBack,
      },
      route: {
        key: 'YouTubeManualTranscript',
        name: 'YouTubeManualTranscript',
        params: {
          url,
          errorCode: 'TRANSCRIPT_UNAVAILABLE',
        },
      },
    } as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with header and submit button inside ScrollView', () => {
    const props = createProps();
    const tree = renderWithProviders(
      <YouTubeManualTranscriptScreen {...props} />,
    );

    const submitBtn = tree.root.findByProps({testID: 'youtube-manual-submit'});
    expect(submitBtn).toBeDefined();

    // Verify ScrollView wraps the input and action
    const scrollViews = tree.root.findAllByType(ScrollView);
    expect(scrollViews.length).toBeGreaterThanOrEqual(1);
  });

  it('shows error when submitted with empty text or invalid transcript format', () => {
    const props = createProps();
    const tree = renderWithProviders(
      <YouTubeManualTranscriptScreen {...props} />,
    );

    const submitBtn = tree.root.findByProps({testID: 'youtube-manual-submit'});

    // Submit with empty text
    act(() => {
      submitBtn.props.onPress();
    });

    expect(mockReplace).not.toHaveBeenCalled();

    // Text field receives invalid text
    const textInput = tree.root.findByProps({
      placeholder: '0:00 Hello there\n0:04 How are you?',
    });
    act(() => {
      textInput.props.onChangeText('plain text without timestamp');
    });

    act(() => {
      submitBtn.props.onPress();
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('parses valid transcript and navigates back to YouTubeProcessing', () => {
    const props = createProps('https://www.youtube.com/watch?v=OlulrDOixEg');
    const tree = renderWithProviders(
      <YouTubeManualTranscriptScreen {...props} />,
    );

    const textInput = tree.root.findByProps({
      placeholder: '0:00 Hello there\n0:04 How are you?',
    });
    const submitBtn = tree.root.findByProps({testID: 'youtube-manual-submit'});

    act(() => {
      textInput.props.onChangeText(
        '0:09 Exercise 1: Health problems\n0:15 Listen to the conversation.',
      );
    });

    act(() => {
      submitBtn.props.onPress();
    });

    expect(mockReplace).toHaveBeenCalledWith('YouTubeProcessing', {
      url: 'https://www.youtube.com/watch?v=OlulrDOixEg',
      manualCues: [
        {
          startMs: 9000,
          endMs: null,
          text: 'Exercise 1: Health problems',
        },
        {
          startMs: 15000,
          endMs: null,
          text: 'Listen to the conversation.',
        },
      ],
    });
  });
});

describe('YouTubeInputScreen', () => {
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();

  const createProps = () =>
    ({
      navigation: {
        navigate: mockNavigate,
        goBack: mockGoBack,
      },
      route: {
        key: 'YouTubeInput',
        name: 'YouTubeInput',
        params: undefined,
      },
    } as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates invalid URL and shows error', () => {
    const props = createProps();
    const tree = renderWithProviders(<YouTubeInputScreen {...props} />);

    const submitBtn = tree.root.findByProps({testID: 'youtube-submit'});

    // Empty
    act(() => {
      submitBtn.props.onPress();
    });
    expect(mockNavigate).not.toHaveBeenCalled();

    // Invalid url
    const textInput = tree.root.findByProps({
      placeholder: 'https://www.youtube.com/watch?v=…',
    });
    act(() => {
      textInput.props.onChangeText('https://not-youtube.com/test');
    });
    act(() => {
      submitBtn.props.onPress();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to YouTubeProcessing on valid YouTube URL', () => {
    const props = createProps();
    const tree = renderWithProviders(<YouTubeInputScreen {...props} />);

    const textInput = tree.root.findByProps({
      placeholder: 'https://www.youtube.com/watch?v=…',
    });
    const submitBtn = tree.root.findByProps({testID: 'youtube-submit'});

    act(() => {
      textInput.props.onChangeText(
        'https://www.youtube.com/watch?v=OlulrDOixEg&list=PLnGTZv-nqOPqy42APYZywQIch__nFugFx',
      );
    });
    act(() => {
      submitBtn.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('YouTubeProcessing', {
      url: 'https://www.youtube.com/watch?v=OlulrDOixEg&list=PLnGTZv-nqOPqy42APYZywQIch__nFugFx',
    });
  });
});
