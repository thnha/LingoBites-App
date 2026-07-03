import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {FeatureFlagProvider} from '../../../release';
import {validFullOutput} from '../../../shared/fixtures';
import type {HomeStackParamList} from '../../../app/navigation/types';
import {AppThemeProvider} from '../../../theme';
import {PracticeScreen} from '../PracticeScreen';

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
} as unknown as NativeStackNavigationProp<HomeStackParamList, 'Practice'>;

function renderWith(params: HomeStackParamList['Practice']) {
  const route = {
    key: 'Practice',
    name: 'Practice',
    params,
  } as React.ComponentProps<typeof PracticeScreen>['route'];

  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>
          <PracticeScreen navigation={navigation} route={route} />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  return tree;
}

function findText(tree: ReactTestRenderer.ReactTestRenderer, text: string): boolean {
  return (
    tree.root.findAll(
      node => typeof node.props.children === 'string' && node.props.children === text,
    ).length > 0
  );
}

describe('PracticeScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows an empty message when there are no questions', () => {
    const tree = renderWith({questions: []});
    expect(findText(tree, 'Chưa có nội dung cho phần này.')).toBe(true);
  });

  it('renders the first question and grades a correct answer', () => {
    const question = validFullOutput.practice[0];
    expect(question.type).toBe('multiple_choice');
    const tree = renderWith({questions: validFullOutput.practice});

    expect(findText(tree, question.question)).toBe(true);

    const correctButton = tree.root.find(
      node =>
        node.props.accessibilityLabel === question.answer &&
        typeof node.props.onPress === 'function' &&
        node.props.accessibilityState !== undefined,
    );

    ReactTestRenderer.act(() => {
      correctButton.props.onPress();
    });

    expect(findText(tree, 'Chính xác!')).toBe(true);
  });
});
