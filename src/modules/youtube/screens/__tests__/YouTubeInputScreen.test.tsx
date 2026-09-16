import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {LayoutAnimation} from 'react-native';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import {AppText} from '@components/AppText';
import {Banner} from '@components/Banner';
import {ScreenHeader} from '@components/ScreenHeader';
import {YouTubeInputScreen} from '../YouTubeInputScreen';

const mockGetString = jest.fn();
const mockNavigate = jest.fn();
const mockEnsureDisclosure = jest.fn();

jest.mock('../../utils/youtubeDisclosure', () => ({
  ensureYouTubeDisclosureAcknowledged: (...args: unknown[]) =>
    mockEnsureDisclosure(...args),
}));

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
      tree.root.findByProps({testID: 'youtube-input-meta'}).props.children,
    ).toContain('15');
    expect(
      tree.root.findByProps({testID: 'youtube-input-meta'}).props.children,
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

// SETE-316 (Option A2): Step 2 coverage migrated from the removed
// YouTubeManualTranscriptScreen suite — the manual-transcript parsing,
// disclosure gate, and submit-with-manualCues behavior now live here.
describe('YouTubeInputScreen Step 2', () => {
  const VALID_URL_A = 'https://www.youtube.com/watch?v=OlulrDOixEg';
  // Same link plus a 12th ID character: the ID no longer matches the
  // 11-char pattern, so the URL is transiently invalid while typing.
  const TWELFTH_CHAR_URL = 'https://www.youtube.com/watch?v=OlulrDOixEgx';
  const VALID_URL_B = 'https://youtu.be/dQw4w9WgXcQ';
  const VALID_TRANSCRIPT =
    '0:09 Exercise 1: Health problems\n0:15 Listen to the conversation.';

  type Nav = React.ComponentProps<typeof YouTubeInputScreen>['navigation'];
  type Route = React.ComponentProps<typeof YouTubeInputScreen>['route'];

  function createNav() {
    return {
      goBack: jest.fn(),
      navigate: jest.fn(),
      setParams: jest.fn(),
      canGoBack: () => true,
      addListener: () => () => {},
      getParent: () => undefined,
    } as unknown as Nav;
  }

  function createRoute(params?: NonNullable<Route['params']>): Route {
    return {
      key: 'YouTubeInput',
      name: 'YouTubeInput',
      params,
    } as unknown as Route;
  }

  function stepTwoConfirms(tree: ReactTestRenderer.ReactTestRenderer) {
    // testID lands on both the AppText composite and its inner host
    // Text — count the composite only.
    return tree.root.findAll(
      node =>
        node.type === AppText && node.props.testID === 'youtube-step2-confirm',
    );
  }

  async function renderStepTwo(
    nav: Nav,
    routeParams?: NonNullable<Route['params']>,
  ) {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <YouTubeInputScreen
              navigation={nav}
              route={createRoute(routeParams)}
            />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
      // Flush the async reduce-motion lookup so no setState lands
      // outside act after the render completes.
      await Promise.resolve();
      await Promise.resolve();
    });
    return tree;
  }

  function typeUrl(tree: ReactTestRenderer.ReactTestRenderer, text: string) {
    act(() => {
      tree.root
        .findByProps({testID: 'youtube-url-input'})
        .props.onChangeText(text);
    });
  }

  function typeTranscript(
    tree: ReactTestRenderer.ReactTestRenderer,
    text: string,
  ) {
    act(() => {
      tree.root
        .findByProps({testID: 'youtube-transcript-input'})
        .props.onChangeText(text);
    });
  }

  function hasStepTwo(tree: ReactTestRenderer.ReactTestRenderer) {
    return tree.root.findAllByProps({testID: 'youtube-step2'}).length > 0;
  }

  async function flushSubmit() {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  }

  async function submit(tree: ReactTestRenderer.ReactTestRenderer) {
    await act(async () => {
      tree.root.findByProps({testID: 'youtube-submit'}).props.onPress();
      await flushSubmit();
    });
  }

  function openStepTwoByTyping(tree: ReactTestRenderer.ReactTestRenderer) {
    typeUrl(tree, VALID_URL_A);
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(hasStepTwo(tree)).toBe(true);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockEnsureDisclosure.mockResolvedValue(true);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens Step 2 after a typing pause once the URL becomes valid', async () => {
    const nav = createNav();
    const tree = await renderStepTwo(nav);

    expect(hasStepTwo(tree)).toBe(false);
    typeUrl(tree, VALID_URL_A);
    // Still hidden before the debounce elapses.
    expect(hasStepTwo(tree)).toBe(false);
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(hasStepTwo(tree)).toBe(true);
    expect(
      tree.root.findByProps({testID: 'youtube-transcript-input'}),
    ).toBeDefined();
  });

  it('keeps focus on the URL field when Step 2 auto-opens', async () => {
    const nav = createNav();
    const tree = await renderStepTwo(nav);
    openStepTwoByTyping(tree);

    // Only the transcript-error recovery entry may focus the transcript
    // field; the auto-open trigger must leave focus where the user is
    // typing.
    expect(
      tree.root.findByProps({testID: 'youtube-transcript-input'}).props
        .autoFocus,
    ).toBeFalsy();
  });

  it('does not flicker open when the 12th character invalidates the ID', async () => {
    const nav = createNav();
    const tree = await renderStepTwo(nav);

    typeUrl(tree, VALID_URL_A);
    act(() => {
      jest.advanceTimersByTime(100);
    });
    typeUrl(tree, TWELFTH_CHAR_URL);
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(hasStepTwo(tree)).toBe(false);
  });

  it('never auto-collapses once open, even if the URL turns invalid', async () => {
    const nav = createNav();
    const tree = await renderStepTwo(nav);
    openStepTwoByTyping(tree);

    typeUrl(tree, 'https://not-youtube.com/test');
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(hasStepTwo(tree)).toBe(true);
  });

  it('re-fires exactly once when switching to a different video', async () => {
    const configureSpy = jest.spyOn(LayoutAnimation, 'configureNext');
    try {
      const nav = createNav();
      const tree = await renderStepTwo(nav);
      openStepTwoByTyping(tree);
      const callsAfterFirstOpen = configureSpy.mock.calls.length;
      expect(callsAfterFirstOpen).toBeGreaterThanOrEqual(1);

      // Same link again: no redundant re-trigger.
      typeUrl(tree, VALID_URL_A);
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(configureSpy.mock.calls.length).toBe(callsAfterFirstOpen);

      // Different video: exactly one more open.
      typeUrl(tree, VALID_URL_B);
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(configureSpy.mock.calls.length).toBe(callsAfterFirstOpen + 1);
    } finally {
      configureSpy.mockRestore();
    }
  });

  it('opens Step 2 immediately on clipboard paste (no debounce)', async () => {
    mockGetString.mockResolvedValue(VALID_URL_A);
    const nav = createNav();
    const tree = await renderStepTwo(nav);

    await act(async () => {
      tree.root.findByProps({testID: 'youtube-paste-url'}).props.onPress();
      await flushSubmit();
    });

    expect(
      tree.root.findByProps({testID: 'youtube-url-input'}).props.value,
    ).toBe(VALID_URL_A);
    expect(hasStepTwo(tree)).toBe(true);
  });

  it('shows the transcript-will-be-used caption once text is entered', async () => {
    const nav = createNav();
    const tree = await renderStepTwo(nav);
    openStepTwoByTyping(tree);

    expect(stepTwoConfirms(tree)).toHaveLength(0);
    typeTranscript(tree, VALID_TRANSCRIPT);
    expect(stepTwoConfirms(tree)).toHaveLength(1);
  });

  it('submits an empty transcript to Processing with manualCues undefined', async () => {
    const nav = createNav();
    const tree = await renderStepTwo(nav);
    openStepTwoByTyping(tree);

    await submit(tree);

    expect(mockEnsureDisclosure).toHaveBeenCalledTimes(1);
    expect(nav.navigate).toHaveBeenCalledWith('YouTubeProcessing', {
      url: VALID_URL_A,
    });
  });

  it('parses a valid transcript and submits it as manualCues', async () => {
    const nav = createNav();
    const tree = await renderStepTwo(nav);
    openStepTwoByTyping(tree);
    typeTranscript(tree, VALID_TRANSCRIPT);

    await submit(tree);

    expect(mockEnsureDisclosure).toHaveBeenCalledTimes(1);
    expect(nav.navigate).toHaveBeenCalledWith('YouTubeProcessing', {
      url: VALID_URL_A,
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

  it('shows an inline transcript error and stays on screen for malformed text', async () => {
    const nav = createNav();
    const tree = await renderStepTwo(nav);
    openStepTwoByTyping(tree);
    typeTranscript(tree, 'plain text without timestamp');

    await submit(tree);

    expect(
      tree.root.findByProps({testID: 'youtube-transcript-input'}).props
        .errorMessage,
    ).toBe(
      'Không đọc được transcript này. Hãy thử định dạng:\n0:00 Hello there\n0:04 How are you?',
    );
    expect(mockEnsureDisclosure).not.toHaveBeenCalled();
    expect(nav.navigate).not.toHaveBeenCalled();
  });

  it('blocks the submit until the disclosure is confirmed (single call site)', async () => {
    mockEnsureDisclosure.mockResolvedValue(false);
    const nav = createNav();
    const tree = await renderStepTwo(nav);
    openStepTwoByTyping(tree);
    typeTranscript(tree, VALID_TRANSCRIPT);

    await submit(tree);

    expect(mockEnsureDisclosure).toHaveBeenCalledTimes(1);
    expect(nav.navigate).not.toHaveBeenCalled();
  });

  it('shows an inline URL error and does not disable the CTA on invalid submit', async () => {
    const nav = createNav();
    const tree = await renderStepTwo(nav);

    await submit(tree);

    expect(
      tree.root.findByProps({testID: 'youtube-url-input'}).props.errorMessage,
    ).toBe(
      'Vui lòng nhập link YouTube hợp lệ (watch, youtu.be, Shorts hoặc embed).',
    );
    expect(nav.navigate).not.toHaveBeenCalled();
    expect(
      tree.root.findByProps({testID: 'youtube-submit'}).props.disabled,
    ).toBeFalsy();
  });

  describe('transcript-error recovery entry', () => {
    it('pre-opens Step 2 with banner, pre-filled URL, and transcript focus', async () => {
      const configureSpy = jest.spyOn(LayoutAnimation, 'configureNext');
      try {
        const nav = createNav();
        const tree = await renderStepTwo(nav, {
          url: VALID_URL_A,
          transcriptRequired: 'TRANSCRIPT_UNAVAILABLE',
        });

        // Pre-expanded immediately — no debounce wait, no open animation.
        expect(hasStepTwo(tree)).toBe(true);
        expect(configureSpy).not.toHaveBeenCalled();
        expect(
          tree.root.findByProps({testID: 'youtube-url-input'}).props.value,
        ).toBe(VALID_URL_A);
        expect(tree.root.findByType(Banner).props.message).toContain(
          'Không lấy được transcript',
        );
        // Pasting a transcript is the only remaining action, so the
        // transcript field takes focus here — and only here.
        expect(
          tree.root.findByProps({testID: 'youtube-transcript-input'}).props
            .autoFocus,
        ).toBe(true);
      } finally {
        configureSpy.mockRestore();
      }
    });

    it('does not fire the URL-change trigger for the recovered link', async () => {
      const configureSpy = jest.spyOn(LayoutAnimation, 'configureNext');
      try {
        const nav = createNav();
        const tree = await renderStepTwo(nav, {
          url: VALID_URL_A,
          transcriptRequired: 'TRANSCRIPT_SOURCE_BLOCKED',
        });

        act(() => {
          jest.advanceTimersByTime(1000);
        });
        expect(configureSpy).not.toHaveBeenCalled();
        expect(hasStepTwo(tree)).toBe(true);
      } finally {
        configureSpy.mockRestore();
      }
    });
  });
});
