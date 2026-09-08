import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {AppThemeProvider} from '@theme';
import {FeatureFlagProvider} from '@/release';
import {SegmentedTabBar} from '../SegmentedTabBar';

function render(ui: React.ReactElement) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>{ui}</AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  return tree;
}

describe('SegmentedTabBar', () => {
  it('renders three tabs with correct labels', () => {
    const tree = render(
      <SegmentedTabBar activeTab="lessons" onTabChange={jest.fn()} />,
    );

    const lessonsTab = tree.root.findByProps({testID: 'tab-lessons'});
    const vocabTab = tree.root.findByProps({testID: 'tab-vocabulary'});
    const grammarTab = tree.root.findByProps({testID: 'tab-grammar'});

    expect(lessonsTab).toBeDefined();
    expect(vocabTab).toBeDefined();
    expect(grammarTab).toBeDefined();

    // Check labels are rendered
    const textInstances = tree.root.findAllByType(Text);
    const labels = textInstances.map(node => node.props.children);
    expect(labels).toContain('Bài học');
    expect(labels).toContain('Từ vựng');
    expect(labels).toContain('Ngữ pháp');
  });

  it('highlights the active tab visually', () => {
    const tree = render(
      <SegmentedTabBar activeTab="lessons" onTabChange={jest.fn()} />,
    );

    const lessonsTab = tree.root.findByProps({testID: 'tab-lessons'});
    const vocabTab = tree.root.findByProps({testID: 'tab-vocabulary'});

    // Check that tabs have accessible styles
    expect(lessonsTab.props.style).toBeDefined();
    expect(vocabTab.props.style).toBeDefined();

    // Active tab should be marked with selected state
    expect(lessonsTab.props.accessibilityState.selected).toBe(true);
    expect(vocabTab.props.accessibilityState.selected).toBe(false);
  });

  it('calls onTabChange when a tab is pressed', () => {
    const onTabChange = jest.fn();
    const tree = render(
      <SegmentedTabBar activeTab="lessons" onTabChange={onTabChange} />,
    );

    const vocabTab = tree.root.findByProps({testID: 'tab-vocabulary'});
    act(() => {
      vocabTab.props.onPress();
    });

    expect(onTabChange).toHaveBeenCalledWith('vocabulary');
  });

  it('switches active tab when different tab is pressed', () => {
    const onTabChange = jest.fn();
    const tree = render(
      <SegmentedTabBar activeTab="lessons" onTabChange={onTabChange} />,
    );

    const grammarTab = tree.root.findByProps({testID: 'tab-grammar'});
    act(() => {
      grammarTab.props.onPress();
    });

    expect(onTabChange).toHaveBeenCalledWith('grammar');
  });

  it('displays all three tabs regardless of which is active', () => {
    const onTabChange = jest.fn();
    const tree = render(
      <SegmentedTabBar activeTab="lessons" onTabChange={onTabChange} />,
    );

    // All tabs should exist even when lessons is active
    const lessonsTab = tree.root.findByProps({testID: 'tab-lessons'});
    const vocabTab = tree.root.findByProps({testID: 'tab-vocabulary'});
    const grammarTab = tree.root.findByProps({testID: 'tab-grammar'});

    expect(lessonsTab).toBeDefined();
    expect(vocabTab).toBeDefined();
    expect(grammarTab).toBeDefined();
  });

  it('has accessibility role set to button on each tab', () => {
    const tree = render(
      <SegmentedTabBar activeTab="lessons" onTabChange={jest.fn()} />,
    );

    const lessonsTab = tree.root.findByProps({testID: 'tab-lessons'});
    const vocabTab = tree.root.findByProps({testID: 'tab-vocabulary'});
    const grammarTab = tree.root.findByProps({testID: 'tab-grammar'});

    expect(lessonsTab.props.accessibilityRole).toBe('tab');
    expect(vocabTab.props.accessibilityRole).toBe('tab');
    expect(grammarTab.props.accessibilityRole).toBe('tab');
  });
});
