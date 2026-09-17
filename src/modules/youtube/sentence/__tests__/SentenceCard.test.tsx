import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {AppText} from '@components/AppText';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import {SentenceCard} from '../SentenceCard';
import type {RetryBlockFn} from '../useSentenceEnrichment';
import {
  makeEnrichment,
  makeFailedSegment,
  makePartialSegment,
  makeSegment,
  VIDEO_ID,
} from './fixtures/sentenceFixtures';

const CARD_TEST_ID = 'sentence-card-0';

function renderCard(
  props: Partial<React.ComponentProps<typeof SentenceCard>> = {},
) {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>
          <SentenceCard
            enrichment={makeSegment().enrichment}
            segment={makeSegment()}
            testID={CARD_TEST_ID}
            videoId={VIDEO_ID}
            {...props}
          />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  return tree;
}

function hasNode(tree: renderer.ReactTestRenderer, testID: string): boolean {
  try {
    tree.root.findByProps({testID});
    return true;
  } catch {
    return false;
  }
}

describe('SentenceCard', () => {
  it('renders the sentence from segment.en only, with its translation', () => {
    const tree = renderCard();

    expect(
      tree.root.findByProps({testID: `${CARD_TEST_ID}-en`}).props.children,
    ).toBe('We are learning through video');
    expect(
      tree.root.findByProps({testID: `${CARD_TEST_ID}-vi`}).props.children,
    ).toBe('Chúng ta đang học qua video');
  });

  it('shows a 3-block skeleton while enrichment is absent', () => {
    const tree = renderCard({enrichment: null});

    for (const block of ['keyword', 'vocab', 'grammar'] as const) {
      expect(hasNode(tree, `${CARD_TEST_ID}-block-${block}-skeleton`)).toBe(
        true,
      );
    }
    expect(hasNode(tree, `${CARD_TEST_ID}-block-vocab-value`)).toBe(false);
  });

  it('fills all three blocks when enrichment is ready', () => {
    const tree = renderCard();

    const keywordNode = tree.root.findByProps({
      testID: `${CARD_TEST_ID}-block-keyword-value`,
    });
    const keywordTexts = keywordNode
      .findAllByType(AppText)
      .map(node => node.props.children);
    expect(keywordTexts).toContain('learning');
    expect(hasNode(tree, `${CARD_TEST_ID}-block-vocab-value`)).toBe(true);
    expect(hasNode(tree, `${CARD_TEST_ID}-block-grammar-value`)).toBe(true);
    expect(hasNode(tree, `${CARD_TEST_ID}-block-vocab-skeleton`)).toBe(false);
  });

  it('falls back to the longest content word when the AI keyword is null', () => {
    const tree = renderCard({
      enrichment: makeEnrichment({keyWord: null, status: 'partial'}),
    });

    const keywordNode = tree.root.findByProps({
      testID: `${CARD_TEST_ID}-block-keyword-value`,
    });
    const keywordTexts = keywordNode
      .findAllByType(AppText)
      .map(node => node.props.children);
    expect(keywordTexts).toContain('learning');
  });

  it('renders a short card for partial enrichment: no placeholder, no error', () => {
    const segment = makePartialSegment();
    const tree = renderCard({enrichment: segment.enrichment, segment});

    // Keyword still renders via fallback.
    const keywordNode = tree.root.findByProps({
      testID: `${CARD_TEST_ID}-block-keyword-value`,
    });
    const keywordTexts = keywordNode
      .findAllByType(AppText)
      .map(node => node.props.children);
    expect(keywordTexts).toContain('learning');
    // Missing vocab/grammar leave no node behind at all.
    for (const block of ['vocab', 'grammar'] as const) {
      expect(hasNode(tree, `${CARD_TEST_ID}-block-${block}-value`)).toBe(false);
      expect(hasNode(tree, `${CARD_TEST_ID}-block-${block}-skeleton`)).toBe(
        false,
      );
      expect(hasNode(tree, `${CARD_TEST_ID}-block-${block}-error`)).toBe(false);
    }
  });

  it('shows a per-block error with retry when the sentence failed', () => {
    const segment = makeFailedSegment();
    const tree = renderCard({
      enrichment: segment.enrichment,
      segment,
      retryBlock: jest.fn(),
    });

    expect(hasNode(tree, `${CARD_TEST_ID}-block-vocab-error`)).toBe(true);
    expect(hasNode(tree, `${CARD_TEST_ID}-block-grammar-error`)).toBe(true);
    // The keyword block still renders via fallback; the card is not an error.
    expect(
      tree.root.findByProps({testID: `${CARD_TEST_ID}-en`}).props.children,
    ).toBe('We are learning through video');
  });

  it('retries one block and fills only that block on success', async () => {
    const segment = makeFailedSegment();
    const retryBlock: RetryBlockFn = jest.fn().mockResolvedValue({
      ok: true,
      enrichment: makeEnrichment({status: 'partial'}),
    });
    const tree = renderCard({
      enrichment: segment.enrichment,
      segment,
      retryBlock,
    });

    await act(async () => {
      tree.root
        .findByProps({testID: `${CARD_TEST_ID}-block-vocab-error-retry`})
        .props.onPress();
    });

    expect(retryBlock).toHaveBeenCalledWith({
      videoId: VIDEO_ID,
      segmentIndex: 0,
      block: 'vocab',
    });
    expect(hasNode(tree, `${CARD_TEST_ID}-block-vocab-value`)).toBe(true);
    expect(hasNode(tree, `${CARD_TEST_ID}-block-vocab-error`)).toBe(false);
  });

  it('keeps the block error when its retry fails', async () => {
    const segment = makeFailedSegment();
    const retryBlock: RetryBlockFn = jest.fn().mockResolvedValue({
      ok: false,
      message: 'ENRICHMENT_AI_QUOTA_EXCEEDED',
    });
    const tree = renderCard({
      enrichment: segment.enrichment,
      segment,
      retryBlock,
    });

    await act(async () => {
      tree.root
        .findByProps({testID: `${CARD_TEST_ID}-block-grammar-error-retry`})
        .props.onPress();
    });

    expect(hasNode(tree, `${CARD_TEST_ID}-block-grammar-error`)).toBe(true);
    expect(hasNode(tree, `${CARD_TEST_ID}-block-grammar-value`)).toBe(false);
  });
});
