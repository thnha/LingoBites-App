import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider} from '@/release';
import {DB_NAME} from '@shared/db/constants';
import {resetDatabaseForTests} from '@shared/db/database';
import {saveLesson} from '@shared/db/LessonRepository';
import {validFullOutput} from '@shared/fixtures';
import {AppThemeProvider} from '@theme';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {HomeScreen} from '../HomeScreen';

function navigation(tabNavigate = jest.fn()) {
  return {navigate: jest.fn(), getParent: () => ({navigate: tabNavigate})};
}

async function renderHome(nav = navigation()) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider releaseName="situation-learning-release">
        <AppThemeProvider>
          <HomeScreen navigation={nav as never} route={{} as never} />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
    await Promise.resolve();
  });
  return tree;
}

function pressByTestID(tree: ReactTestRenderer.ReactTestRenderer, testID: string) {
  const target = tree.root
    .findAll(item => item.props.testID === testID)
    .find(item => typeof item.props.onPress === 'function');
  if (!target) throw new Error(`No pressable found for testID ${testID}`);
  return target.props.onPress();
}

describe('HomeScreen Option A (LingoScan layout)', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
  });

  it('hero camera routes to ImageCapture with camera source', async () => {
    const nav = navigation();
    const tree = await renderHome(nav);
    await act(async () => pressByTestID(tree, 'home-input-camera'));
    expect(nav.navigate).toHaveBeenCalledWith('ImageCapture', {
      sourceType: 'camera',
    });
  });

  it('secondary gallery and paste cards route to their destinations', async () => {
    const nav = navigation();
    const tree = await renderHome(nav);
    await act(async () => pressByTestID(tree, 'home-input-gallery'));
    expect(nav.navigate).toHaveBeenCalledWith('ImageCapture', {
      sourceType: 'gallery',
    });
    await act(async () => pressByTestID(tree, 'home-input-paste'));
    expect(nav.navigate).toHaveBeenCalledWith('PasteText');
  });

  it('hides the recent section when the library is empty', async () => {
    const tree = await renderHome();
    expect(
      tree.root.findAll(node => node.props.testID === 'home-recent-section')
        .length,
    ).toBe(0);
  });

  it('shows saved lessons in the recent section and routes taps', async () => {
    const tabNavigate = jest.fn();
    const nav = navigation(tabNavigate);
    const lesson = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });
    if (!lesson.ok) throw new Error('Could not seed lesson');
    const tree = await renderHome(nav);
    expect(
      tree.root.findAll(node => node.props.testID === 'home-recent-section')
        .length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(
        node => node.props.testID === `home-recent-item-${lesson.lessonId}`,
      ).length,
    ).toBeGreaterThan(0);
    // RecentLessonRow renders its own inner Pressable (no testID) labelled
    // "<title>, <meta>" — press it to verify personal-lesson routing.
    const rowButtons = tree.root.findAll(
      item =>
        typeof item.props.onPress === 'function' &&
        typeof item.props.accessibilityLabel === 'string' &&
        item.props.accessibilityLabel.startsWith(`${validFullOutput.title},`),
    );
    if (rowButtons.length === 0)
      throw new Error('No recent lesson row button found');
    await act(async () => rowButtons[0].props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('SavedLessonDetail', {
      lessonId: lesson.lessonId,
    });
    await act(async () => pressByTestID(tree, 'home-recent-view-all'));
    expect(tabNavigate).toHaveBeenCalledWith('Lessons');
  });
});
