import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import type {ReleaseConfig} from '@/release/types';
import {
  ALL_IMPLEMENTED_FEATURES,
  CORE_WITH_REVIEW,
  makeTestReleaseConfig,
  OFFLINE_REVIEW_MVP,
} from '@/test-support';
import {AppThemeProvider} from '@theme';
import {CreateScreen} from '../CreateScreen';

function navigation() {
  return {navigate: jest.fn(), getParent: () => ({navigate: jest.fn()})};
}

async function renderCreate(
  nav = navigation(),
  releaseConfig: ReleaseConfig = makeTestReleaseConfig(CORE_WITH_REVIEW),
) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider releaseConfig={releaseConfig}>
        <AppThemeProvider>
          <CreateScreen navigation={nav as never} route={{} as never} />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
    await Promise.resolve();
  });
  return tree;
}

async function pressByTestID(
  tree: ReactTestRenderer.ReactTestRenderer,
  testID: string,
) {
  const target = tree.root
    .findAll(item => item.props.testID === testID)
    .find(item => typeof item.props.onPress === 'function');
  if (!target) throw new Error(`No pressable found for testID ${testID}`);
  await act(async () => target.props.onPress());
}

describe('CreateScreen (SETE-247)', () => {
  it('hero camera routes to ImageCapture with camera source', async () => {
    const nav = navigation();
    const tree = await renderCreate(nav);
    await pressByTestID(tree, 'create-hero-camera');
    expect(nav.navigate).toHaveBeenCalledWith('ImageCapture', {
      sourceType: 'camera',
    });
  });

  it('uniform tiles route to gallery upload and paste text', async () => {
    const nav = navigation();
    const tree = await renderCreate(nav);
    await pressByTestID(tree, 'create-tile-gallery');
    expect(nav.navigate).toHaveBeenCalledWith('ImageCapture', {
      sourceType: 'gallery',
    });
    await pressByTestID(tree, 'create-tile-paste');
    expect(nav.navigate).toHaveBeenCalledWith('PasteText');
  });

  it('shows the OCR tip while image input is enabled', async () => {
    const tree = await renderCreate();
    expect(
      tree.root.findAll(node => node.props.testID === 'create-tip-card')
        .length,
    ).toBeGreaterThan(0);
  });

  it('shows YouTube entry points only when the flag is on', async () => {
    const flaggedOff = await renderCreate();
    expect(
      flaggedOff.root.findAll(
        node => node.props.testID === 'create-tile-youtube',
      ).length,
    ).toBe(0);

    const nav = navigation();
    const flaggedOn = await renderCreate(
      nav,
      makeTestReleaseConfig(ALL_IMPLEMENTED_FEATURES),
    );
    await pressByTestID(flaggedOn, 'create-tile-youtube');
    expect(nav.navigate).toHaveBeenCalledWith('YouTubeInput');
    await pressByTestID(flaggedOn, 'create-history-link');
    expect(nav.navigate).toHaveBeenCalledWith('YouTubeHistory');
  });

  it('renders an empty state instead of a blank screen when all sources are off', async () => {
    const tree = await renderCreate(
      navigation(),
      makeTestReleaseConfig(OFFLINE_REVIEW_MVP),
    );
    expect(
      tree.root.findAll(node => node.props.testID === 'create-empty-state')
        .length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(node => node.props.testID === 'create-hero-camera')
        .length,
    ).toBe(0);
  });
});
