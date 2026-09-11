import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {StyleSheet} from 'react-native';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider} from '@/release';
import {DB_NAME} from '@shared/db/constants';
import {resetDatabaseForTests} from '@shared/db/database';
import {saveLesson} from '@shared/db/LessonRepository';
import {startContentLesson} from '@shared/db/ContentLessonStateRepository';
import {listActivePackageLessons} from '@shared/db/ContentRuntimeRepository';
import {validFullOutput} from '@shared/fixtures';
import {AppThemeProvider} from '@theme';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {bootstrapContentPackage} from '../../content/bootstrap/contentBootstrap';
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

describe('HomeScreen learning-only layout (SETE-247)', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
  });

  it('shows the first-open empty state with paths to Create and offline lessons', async () => {
    const tabNavigate = jest.fn();
    const tree = await renderHome(navigation(tabNavigate));
    expect(
      tree.root.findAll(node => node.props.testID === 'home-empty-section')
        .length,
    ).toBeGreaterThan(0);
    // Learning blocks stay hidden until there is data — the home is never
    // an empty dead end, but it also shows no fake content.
    expect(
      tree.root.findAll(node => node.props.testID === 'home-today-section')
        .length,
    ).toBe(0);
    expect(
      tree.root.findAll(node => node.props.testID === 'home-recent-section')
        .length,
    ).toBe(0);
    await act(async () => pressByTestID(tree, 'home-empty-create'));
    expect(tabNavigate).toHaveBeenCalledWith('Create');
    await act(async () => pressByTestID(tree, 'home-empty-try'));
    expect(tabNavigate).toHaveBeenCalledWith('Lessons', {
      screen: 'ContentLessonList',
    });
  });

  it('keeps lesson creation off Home (moved to the Create tab)', async () => {
    const tree = await renderHome();
    for (const testID of [
      'home-input-camera',
      'home-input-gallery',
      'home-input-paste',
      'home-input-youtube',
    ]) {
      expect(
        tree.root.findAll(node => node.props.testID === testID).length,
      ).toBe(0);
    }
  });

  it('shows today + recent (no empty card) once data exists', async () => {
    const lesson = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });
    if (!lesson.ok) throw new Error('Could not seed lesson');
    const tree = await renderHome();
    expect(
      tree.root.findAll(node => node.props.testID === 'home-empty-section')
        .length,
    ).toBe(0);
    expect(
      tree.root.findAll(node => node.props.testID === 'home-today-section')
        .length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(node => node.props.testID === 'home-recent-section')
        .length,
    ).toBeGreaterThan(0);
    // No started lesson → continue block hidden, today block leads.
    expect(
      tree.root.findAll(node => node.props.testID === 'home-continue-section')
        .length,
    ).toBe(0);
  });

  it('opens the Today screen from the swap entry point', async () => {
    const lesson = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });
    if (!lesson.ok) throw new Error('Could not seed lesson');
    const nav = navigation();
    const tree = await renderHome(nav);
    await act(async () => pressByTestID(tree, 'home-today-swap'));
    expect(nav.navigate).toHaveBeenCalledWith('Today');
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
      tree.root.findAll(
        node => node.props.testID === `home-recent-item-${lesson.lessonId}`,
      ).length,
    ).toBeGreaterThan(0);
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

  it('gives "view all" a 44pt touch target', async () => {
    const lesson = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });
    if (!lesson.ok) throw new Error('Could not seed lesson');
    const tree = await renderHome();
    const viewAll = tree.root
      .findAll(item => item.props.testID === 'home-recent-view-all')
      .find(item => typeof item.props.onPress === 'function');
    if (!viewAll) throw new Error('No view-all pressable found');
    const style = StyleSheet.flatten(viewAll.props.style);
    const minHeight = (style.minHeight as number) ?? 0;
    const verticalPadding =
      ((style.paddingVertical as number) ?? 0) +
      ((style.hitSlop as {top?: number; bottom?: number} | undefined)?.top ??
        0) +
      ((style.hitSlop as {top?: number; bottom?: number} | undefined)
        ?.bottom ?? 0);
    expect(Math.max(minHeight, 18 + verticalPadding)).toBeGreaterThanOrEqual(
      44,
    );
  });

  it('shows the continue block for a started lesson with no fake progress', async () => {
    const installed = await bootstrapContentPackage();
    expect(installed.ok).toBe(true);
    const packaged = listActivePackageLessons()[0];
    expect(packaged).toBeDefined();
    const started = startContentLesson({lessonId: packaged.id});
    expect(started.ok).toBe(true);
    const nav = navigation();
    const tree = await renderHome(nav);
    expect(
      tree.root.findAll(node => node.props.testID === 'home-continue-section')
        .length,
    ).toBeGreaterThan(0);
    // No progress source exists: no bar and no hard-coded 0% label.
    expect(
      tree.root.findAllByProps({children: '0%'}).length,
    ).toBe(0);
    await act(async () => pressByTestID(tree, 'home-continue-action'));
    expect(nav.navigate).toHaveBeenCalledWith('ContentLessonRuntime', {
      lessonId: packaged.id,
    });
  });
});
