import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {FeatureFlagProvider} from '../../../release';
import {validFullOutput} from '../../../shared/fixtures';
import type {HomeStackParamList} from '../../../app/navigation/types';
import {AppThemeProvider} from '../../../theme';
import {GrammarDetailScreen} from '../GrammarDetailScreen';
import {SentenceDetailScreen} from '../SentenceDetailScreen';
import {WordDetailScreen} from '../WordDetailScreen';

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
} as unknown as NativeStackNavigationProp<HomeStackParamList, never>;

function render(node: React.ReactElement) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>{node}</AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  return tree;
}

function hasText(tree: ReactTestRenderer.ReactTestRenderer, text: string): boolean {
  return (
    tree.root.findAll(
      node => typeof node.props.children === 'string' && node.props.children === text,
    ).length > 0
  );
}

describe('learning detail screens', () => {
  beforeEach(() => jest.clearAllMocks());

  it('SentenceDetailScreen renders the sentence and its chunks', () => {
    const sentence = validFullOutput.sentences[0];
    const route = {
      key: 'SentenceDetail',
      name: 'SentenceDetail',
      params: {sentence, index: 0, total: 1, practice: validFullOutput.practice},
    } as React.ComponentProps<typeof SentenceDetailScreen>['route'];

    const tree = render(<SentenceDetailScreen navigation={navigation} route={route} />);
    expect(hasText(tree, sentence.original)).toBe(true);
    expect(hasText(tree, 'Tách thành cụm')).toBe(true);
  });

  it('WordDetailScreen renders the headword and meaning', () => {
    const word = validFullOutput.vocabulary[0];
    const route = {
      key: 'WordDetail',
      name: 'WordDetail',
      params: {word, practice: validFullOutput.practice},
    } as React.ComponentProps<typeof WordDetailScreen>['route'];

    const tree = render(<WordDetailScreen navigation={navigation} route={route} />);
    expect(hasText(tree, word.word)).toBe(true);
    expect(hasText(tree, word.meaning_vi)).toBe(true);
  });

  it('GrammarDetailScreen renders the grammar name and explanation', () => {
    const grammar = validFullOutput.grammar_points[0];
    const route = {
      key: 'GrammarDetail',
      name: 'GrammarDetail',
      params: {grammar, related: validFullOutput.grammar_points, practice: validFullOutput.practice},
    } as React.ComponentProps<typeof GrammarDetailScreen>['route'];

    const tree = render(<GrammarDetailScreen navigation={navigation} route={route} />);
    expect(hasText(tree, grammar.name)).toBe(true);
    expect(hasText(tree, grammar.explanation_vi)).toBe(true);
  });
});
