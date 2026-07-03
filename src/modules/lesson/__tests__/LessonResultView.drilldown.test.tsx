import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {FeatureFlagProvider} from '../../../release';
import {validFullOutput} from '../../../shared/fixtures';
import {AppThemeProvider} from '../../../theme';
import {LessonResultView} from '../LessonResultView';

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

describe('LessonResultView drill-down entry points', () => {
  it('fires onOpenWord when a vocabulary item is tapped', () => {
    const onOpenWord = jest.fn();
    const word = validFullOutput.vocabulary[0];
    const tree = render(
      <LessonResultView lesson={validFullOutput} showSaveButton={false} onOpenWord={onOpenWord} />,
    );

    const wordButton = tree.root.find(
      node => node.props.accessibilityRole === 'button' && node.props.accessibilityLabel === word.word,
    );
    ReactTestRenderer.act(() => wordButton.props.onPress());

    expect(onOpenWord).toHaveBeenCalledWith(word);
  });

  it('renders a practice CTA only when onStartPractice is provided', () => {
    const onStartPractice = jest.fn();
    const tree = render(
      <LessonResultView
        lesson={validFullOutput}
        showSaveButton={false}
        onStartPractice={onStartPractice}
      />,
    );

    const cta = tree.root.find(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function' &&
        node.props.onPress === onStartPractice,
    );
    expect(cta).toBeTruthy();
  });

  it('does not make items tappable when no callbacks are passed', () => {
    const word = validFullOutput.vocabulary[0];
    const tree = render(<LessonResultView lesson={validFullOutput} showSaveButton={false} />);

    const wordButtons = tree.root.findAll(
      node => node.props.accessibilityRole === 'button' && node.props.accessibilityLabel === word.word,
    );
    expect(wordButtons).toHaveLength(0);
  });
});
