import React from 'react';
import {Image, Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import {AppThemeProvider} from '@theme';
import {extractText} from '../../ocr';
import {pickImageFromGallery} from '../imagePicker';
import {ImageCaptureScreen} from '../ImageCaptureScreen';

jest.mock('../../ocr', () => ({
  extractText: jest.fn(),
}));

jest.mock('../imagePicker', () => ({
  pickImageFromCamera: jest.fn(),
  pickImageFromGallery: jest.fn(),
}));

const pickedImage = {
  uri: 'file:///selected.jpg',
  fileName: 'selected.jpg',
  type: 'image/jpeg',
  width: 1200,
  height: 900,
};

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  replace: jest.fn(),
};

const route = {
  key: 'ImageCapture',
  name: 'ImageCapture',
  params: {
    sourceType: 'gallery' as const,
  },
} as React.ComponentProps<typeof ImageCaptureScreen>['route'];

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

async function renderScreen() {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>
          <ImageCaptureScreen navigation={navigation as never} route={route} />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  return tree;
}

describe('ImageCaptureScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(pickImageFromGallery).mockResolvedValue({
      ok: true,
      image: pickedImage,
    });
  });

  it('marks the selected image preview as exempt from smart invert', async () => {
    const tree = await renderScreen();

    await ReactTestRenderer.act(async () => {
      findPressableByLabel(tree.root, 'Chạm để chọn ảnh')?.props.onPress();
    });

    expect(tree.root.findByType(Image).props).toMatchObject({
      accessibilityIgnoresInvertColors: true,
    });
  });

  it('keeps the selected image exempt from smart invert after OCR fails', async () => {
    jest.mocked(extractText).mockResolvedValue({
      ok: false,
      errorCode: 'OCR_PROVIDER_ERROR',
      message: 'OCR failed',
    });
    const tree = await renderScreen();

    await ReactTestRenderer.act(async () => {
      findPressableByLabel(tree.root, 'Chạm để chọn ảnh')?.props.onPress();
    });
    await ReactTestRenderer.act(async () => {
      findPressableByLabel(tree.root, 'Trích xuất text')?.props.onPress();
    });

    expect(tree.root.findByType(Image).props).toMatchObject({
      accessibilityIgnoresInvertColors: true,
    });
  });
});
