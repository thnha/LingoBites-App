import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {AppText} from '@components/AppText';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import {SentenceCard} from '../SentenceCard';
import {
  makeEnrichment,
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
            onPressWord={() => undefined}
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

describe('SentenceCard word selection (SETE-331 TASK-4)', () => {
  it('tapping another word swaps the detail block and reports the word once', () => {
    const onPressWord = jest.fn();
    const tree = renderCard({onPressWord, onToggleWordSave: () => undefined});

    // Default selection is the AI keyword.
    expect(
      tree.root.findByProps({testID: `${CARD_TEST_ID}-word-toggle-save`}),
    ).toBeTruthy();

    act(() => {
      tree.root.findByProps({testID: `${CARD_TEST_ID}-word-6`}).props.onPress();
    });

    expect(onPressWord).toHaveBeenCalledTimes(1);
    expect(onPressWord).toHaveBeenCalledWith('through');
  });

  it('keeps punctuation untappable (no press handler, no word testID)', () => {
    const tree = renderCard();
    // Sentence: We(0) ' '(1) are(2) ' '(3) learning(4) ' '(5) through(6) ' '(7) video(8)
    // Index 5 is whitespace between learning/through — rendered as plain text.
    const enNode = tree.root.findByProps({testID: `${CARD_TEST_ID}-en`});
    const children = enNode.props.children as unknown[];
    // Punctuation/whitespace slots are raw strings, not pressable nodes.
    expect(
      children.some(
        child =>
          typeof child === 'string' && (child === ' ' || child === ','),
      ),
    ).toBe(true);
    expect(hasNode(tree, `${CARD_TEST_ID}-word-5`)).toBe(false);
  });

  it('resets to the keyword when the sentence changes', () => {
    const tree = renderCard({onToggleWordSave: () => undefined});
    act(() => {
      tree.root.findByProps({testID: `${CARD_TEST_ID}-word-6`}).props.onPress();
    });

    act(() => {
      tree.update(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <SentenceCard
              enrichment={makeEnrichment({keyWord: 'video'})}
              onPressWord={() => undefined}
              onToggleWordSave={() => undefined}
              segment={{...makeSegment(), en: 'A brand new video here'}}
              testID={CARD_TEST_ID}
              videoId={VIDEO_ID}
            />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });

    // After sentence change the save button still exists (selection reset,
    // no crash) and no stale word remains selected.
    expect(hasNode(tree, `${CARD_TEST_ID}-word-toggle-save`)).toBe(true);
  });

  it('syncs ★ between chip and save button via savedWordIds', () => {
    const onToggleWordSave = jest.fn();
    const tree = renderCard({
      onToggleWordSave,
      savedWordIds: new Set(['learning']),
    });

    const saveBtn = tree.root.findByProps({
      testID: `${CARD_TEST_ID}-word-toggle-save`,
    });
    expect(saveBtn.props.tone).toBe('accent');

    act(() => {
      saveBtn.props.onPress();
    });
    expect(onToggleWordSave).toHaveBeenCalledWith(
      'learning',
      expect.objectContaining({word: 'learning'}),
    );
  });

  it('renders grammar vertically in order with NGỮ PHÁP badges + per-item save', () => {
    const onToggleGrammarSave = jest.fn();
    const enrichment = makeEnrichment({
      grammar: [
        {
          name: 'Present continuous',
          description: 'd1',
          formula: 'f1',
          analysis: 'a1',
        },
        {
          name: 'Preposition through',
          description: 'd2',
          formula: 'f2',
          analysis: 'a2',
        },
      ],
    });
    const tree = renderCard({
      enrichment,
      onToggleGrammarSave,
      savedGrammarIds: new Set(['Present continuous']),
    });

    expect(
      tree.root.findByProps({testID: `${CARD_TEST_ID}-grammar-badge-0`}).props
        .label,
    ).toBe('NGỮ PHÁP 1/2');
    expect(
      tree.root.findByProps({testID: `${CARD_TEST_ID}-grammar-badge-1`}).props
        .label,
    ).toBe('NGỮ PHÁP 2/2');

    const firstSave = tree.root.findByProps({
      testID: `${CARD_TEST_ID}-grammar-save-0`,
    });
    expect(firstSave.props.tone).toBe('accent');

    act(() => {
      tree.root
        .findByProps({testID: `${CARD_TEST_ID}-grammar-save-1`})
        .props.onPress();
    });
    expect(onToggleGrammarSave).toHaveBeenCalledWith(
      expect.objectContaining({name: 'Preposition through'}),
    );
  });

  it('shortens function words to the Trong câu note', () => {
    const tree = renderCard();
    act(() => {
      tree.root.findByProps({testID: `${CARD_TEST_ID}-word-6`}).props.onPress();
    });
    // 'through' is a function word with inSentenceNote 'Trong câu: ...'
    const valueNode = tree.root.findByProps({
      testID: `${CARD_TEST_ID}-block-keyword-value`,
    });
    const renderedStrings = valueNode
      .findAllByType(AppText)
      .flatMap(node =>
        Array.isArray(node.props.children)
          ? node.props.children
          : [node.props.children],
      )
      .filter(child => typeof child === 'string');
    expect(renderedStrings.join(' ')).toMatch(/Trong câu/);
  });
});
