import React from 'react';
import {Text, TextInput} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import {themes, defaultThemeId} from '@theme/themeRegistry';
import {TextField} from '../TextField';

async function render(ui: React.ReactElement) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>{ui}</AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  return tree;
}

function flattenStyle(style: unknown) {
  const {StyleSheet} = require('react-native');
  return StyleSheet.flatten(style);
}

describe('TextField', () => {
  it('renders the label as visible text associated with the input', async () => {
    const tree = await render(<TextField label="Nội dung" value="" />);

    const label = tree.root.find(
      node => node.type === Text && node.props.children === 'Nội dung',
    );
    const input = tree.root.findByType(TextInput);

    expect(label).toBeTruthy();
    expect(typeof label.props.nativeID).toBe('string');
    expect(input.props.accessibilityLabelledBy).toBe(label.props.nativeID);
    // Existing a11y wiring is preserved alongside the visible label.
    expect(input.props.accessibilityLabel).toBe('Nội dung');
  });

  it('renders no visible label when the label prop is omitted', async () => {
    const tree = await render(<TextField placeholder="Tìm kiếm..." />);

    expect(
      tree.root.findAll(
        node =>
          node.type === Text &&
          typeof node.props.nativeID === 'string' &&
          node.props.nativeID.startsWith('textfield-label-'),
      ),
    ).toHaveLength(0);
    expect(tree.root.findByType(TextInput).props.accessibilityLabel).toBe(
      'Tìm kiếm...',
    );
  });

  it('renders visible error text near the field when errorMessage is set', async () => {
    const tree = await render(
      <TextField
        errorMessage="Cần nhập nội dung"
        hasError
        label="Nội dung"
        value=""
      />,
    );

    const errors = tree.root.findAll(
      node =>
        node.type === Text && node.props.children === 'Cần nhập nội dung',
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].props.accessibilityRole).toBe('alert');

    const input = tree.root.findByType(TextInput);
    expect(flattenStyle(input.props.style).borderColor).toBe(
      themes[defaultThemeId].colors.danger,
    );
  });

  it('renders no error text when errorMessage is omitted', async () => {
    const tree = await render(<TextField label="Nội dung" value="" />);

    expect(
      tree.root.findAll(
        node => node.type === Text && node.props.accessibilityRole === 'alert',
      ),
    ).toHaveLength(0);
  });

  it('uses a pill radius and a 2px accent-at-35% border by default', async () => {
    const tree = await render(<TextField value="" />);

    const flattened = flattenStyle(tree.root.findByType(TextInput).props.style);
    expect(flattened.borderRadius).toBe(999);
    expect(flattened.borderWidth).toBe(2);
    // pastel-kids accent #2dd4bf at 35% alpha per design/app.css.
    expect(flattened.borderColor).toBe('rgba(45,212,191,0.35)');
  });

  it('uses the field-area radius for multiline inputs', async () => {
    const tree = await render(<TextField multiline value="" />);

    expect(
      flattenStyle(tree.root.findByType(TextInput).props.style).borderRadius,
    ).toBe(20);
  });

  it('switches to the accent border with an accent-soft ring on focus', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const tree = await render(
      <TextField label="Nội dung" onBlur={onBlur} onFocus={onFocus} value="" />,
    );

    await act(async () => {
      tree.root.findByType(TextInput).props.onFocus();
    });

    const theme = themes[defaultThemeId];
    expect(
      flattenStyle(tree.root.findByType(TextInput).props.style).borderColor,
    ).toBe(theme.colors.accent);
    const rings = tree.root.findAll(
      node =>
        node.props.style !== undefined &&
        flattenStyle(node.props.style).borderColor === theme.colors.accentSoft,
    );
    expect(rings.length).toBeGreaterThan(0);
    expect(onFocus).toHaveBeenCalledTimes(1);

    await act(async () => {
      tree.root.findByType(TextInput).props.onBlur();
    });

    expect(
      flattenStyle(tree.root.findByType(TextInput).props.style).borderColor,
    ).toBe('rgba(45,212,191,0.35)');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
