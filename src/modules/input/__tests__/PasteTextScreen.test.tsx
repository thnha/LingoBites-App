import React from 'react';
import {Text, TextInput} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {FeatureFlagProvider} from '../../../release';
import {EMPTY_INPUT_MESSAGE} from '../../../shared/copy/userMessages';
import {AppThemeProvider} from '../../../theme';
import {PasteTextScreen} from '../PasteTextScreen';

const mockNavigate = jest.fn();

jest.mock('../../analytics', () => ({
  trackEvent: jest.fn(),
  getTextLengthBucket: () => '1-100',
}));

function findPressableByLabel(
  root: ReactTestRenderer.ReactTestInstance,
  label: string,
) {
  const textNode = root
    .findAllByType(Text)
    .find(node => node.props.children === label);

  let current = textNode?.parent;
  while (current && typeof current.props.onPress !== 'function') {
    current = current.parent;
  }

  return current;
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

const navigation = {
  navigate: mockNavigate,
  setParams: jest.fn(),
} as unknown as React.ComponentProps<typeof PasteTextScreen>['navigation'];

const route = {
  key: 'PasteText',
  name: 'PasteText',
  params: undefined,
} as React.ComponentProps<typeof PasteTextScreen>['route'];

function renderPasteTextScreen() {
  return ReactTestRenderer.create(
    <FeatureFlagProvider>
      <AppThemeProvider>
        <PasteTextScreen navigation={navigation} route={route} />
      </AppThemeProvider>
    </FeatureFlagProvider>,
  );
}

describe('PasteTextScreen', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('navigates to Analyzing with the confirmed text and paste source', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = renderPasteTextScreen();
    });

    const analyzeButton = findPressableByLabel(tree!.root, 'Trích xuất từ vựng');

    await ReactTestRenderer.act(async () => {
      analyzeButton?.props.onPress();
      await flushPromises();
    });

    expect(mockNavigate).toHaveBeenCalledWith('Analyzing', {
      confirmedText: 'We are offering a special discount for new customers.',
      sourceType: 'paste_text',
      origin: 'PasteText',
    });
  });

  it('blocks empty submission and does not navigate (TC-008)', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = renderPasteTextScreen();
    });

    const input = tree!.root.findByType(TextInput);
    await ReactTestRenderer.act(async () => {
      input.props.onChangeText('   ');
    });

    const analyzeButton = findPressableByLabel(tree!.root, 'Trích xuất từ vựng');
    await ReactTestRenderer.act(async () => {
      analyzeButton?.props.onPress();
      await flushPromises();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(JSON.stringify(tree!.toJSON())).toContain(EMPTY_INPUT_MESSAGE);
  });
});
