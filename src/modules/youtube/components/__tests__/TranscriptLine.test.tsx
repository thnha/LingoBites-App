import React from 'react';
import renderer, {act, type ReactTestInstance} from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import type {YouTubeSegment} from '@shared/schemas/youtube-transcript-v1';
import {TranscriptLine} from '../TranscriptLine';

const LINE_TEST_ID = 'transcript-line-seg-0';

/**
 * `TranscriptLine`'s own props include `testID`, so `findByProps` (shallow)
 * matches the wrapper itself, not the inner `Pressable` that owns the real
 * `onPress`/`accessibilityState`. Pull the second (deep) match instead.
 */
function findPressable(tree: renderer.ReactTestRenderer): ReactTestInstance {
  const matches = tree.root.findAll(
    node => node.props?.testID === LINE_TEST_ID,
  );
  return matches[1];
}

function makeSegment(overrides: Partial<YouTubeSegment> = {}): YouTubeSegment {
  return {
    id: 'seg-0',
    index: 0,
    start_ms: 1_000,
    end_ms: 3_000,
    en: 'Hello there',
    vi: 'Xin chào',
    ipa: 'həˈloʊ ðɛr',
    ...overrides,
  };
}

function renderLine(props: Partial<React.ComponentProps<typeof TranscriptLine>> = {}) {
  const onPress = jest.fn();
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>
          <TranscriptLine
            isActive={false}
            onPress={onPress}
            segment={makeSegment()}
            showTranslation
            testID="transcript-line-seg-0"
            {...props}
          />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  return {tree, onPress};
}

describe('TranscriptLine', () => {
  it('renders English, Vietnamese, and IPA lines when translation is shown', () => {
    const {tree} = renderLine();

    expect(
      tree.root.findByProps({testID: 'transcript-line-seg-0-en'}).props
        .children,
    ).toBe('Hello there');
    expect(
      tree.root.findByProps({testID: 'transcript-line-seg-0-vi'}).props
        .children,
    ).toBe('Xin chào');
    expect(
      tree.root.findByProps({testID: 'transcript-line-seg-0-ipa'}).props
        .children,
    ).toBe('/həˈloʊ ðɛr/');
  });

  it('hides the Vietnamese and IPA lines when translation is toggled off', () => {
    const {tree} = renderLine({showTranslation: false});

    expect(() =>
      tree.root.findByProps({testID: 'transcript-line-seg-0-vi'}),
    ).toThrow();
    expect(() =>
      tree.root.findByProps({testID: 'transcript-line-seg-0-ipa'}),
    ).toThrow();
  });

  it('calls onPress with the segment when tapped', () => {
    const {tree, onPress} = renderLine();

    act(() => {
      findPressable(tree).props.onPress();
    });

    expect(onPress).toHaveBeenCalledWith(makeSegment());
  });

  it('marks the active line as selected', () => {
    const {tree} = renderLine({isActive: true});

    expect(findPressable(tree).props.accessibilityState).toEqual({
      selected: true,
    });
  });

  it('uses onPrimaryContainer for active IPA text contrast', () => {
    const {tree} = renderLine({isActive: true});
    const ipaNode = tree.root.findByProps({testID: 'transcript-line-seg-0-ipa'});
    const flatStyle = Array.isArray(ipaNode.props.style)
      ? Object.assign({}, ...ipaNode.props.style.filter(Boolean))
      : ipaNode.props.style;

    expect(flatStyle.color).toBeDefined();
    expect(ipaNode.props.color).toBeUndefined();
  });
});
