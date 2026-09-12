import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider} from '@/release';
import {makeTestReleaseConfig, CORE_WITH_REVIEW} from '@/test-support';
import {DB_NAME} from '@shared/db/constants';
import {resetDatabaseForTests} from '@shared/db/database';
import {saveLesson} from '@shared/db/LessonRepository';
import {
  saveContentLesson,
  startContentLesson,
} from '@shared/db/ContentLessonStateRepository';
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
      <FeatureFlagProvider releaseConfig={makeTestReleaseConfig(CORE_WITH_REVIEW)}>
        <AppThemeProvider>
          <HomeScreen navigation={nav as never} route={{} as never} />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
    await Promise.resolve();
  });
  return tree;
}

function pressByTestID(
  tree: ReactTestRenderer.ReactTestRenderer,
  testID: string,
) {
  const target = tree.root
    .findAll(item => item.props.testID === testID)
    .find(item => typeof item.props.onPress === 'function');
  if (!target) throw new Error(`No pressable found for testID ${testID}`);
  return target.props.onPress();
}

function seedPersonalLesson() {
  const lesson = saveLesson({
    confirmedText: validFullOutput.original_text,
    sourceType: 'paste_text',
    lesson: validFullOutput,
  });
  if (!lesson.ok) throw new Error('Could not seed lesson');
  return lesson.lessonId;
}

describe('HomeScreen hero card (SETE-279)', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
  });

  it('shows a single create CTA on first open — never a dead end', async () => {
    const tabNavigate = jest.fn();
    const tree = await renderHome(navigation(tabNavigate));
    // No started lesson → the starter hero shows the bare variant because
    // the library is empty and there is no past lesson.
    expect(
      tree.root.findAll(node => node.props.testID === 'home-starter-section')
        .length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(node => node.props.testID === 'home-continue-section')
        .length,
    ).toBe(0);
    // Single CTA: only the first-create button, no pick row.
    expect(
      tree.root.findAll(node => node.props.testID === 'home-starter-pick')
        .length,
    ).toBe(0);
    await act(async () => pressByTestID(tree, 'home-starter-first'));
    expect(tabNavigate).toHaveBeenCalledWith('Create');
  });

  it('shows a single pick CTA when the packaged library exists', async () => {
    const installed = await bootstrapContentPackage();
    expect(installed.ok).toBe(true);
    seedPersonalLesson();
    const tabNavigate = jest.fn();
    const nav = navigation(tabNavigate);
    const tree = await renderHome(nav);

    expect(
      tree.root.findAll(node => node.props.testID === 'home-starter-pick')
        .length,
    ).toBeGreaterThan(0);
    // One CTA only: create stays hidden while pick leads.
    expect(
      tree.root.findAll(node => node.props.testID === 'home-starter-create')
        .length,
    ).toBe(0);
    expect(
      tree.root.findAll(node => node.props.testID === 'home-starter-first')
        .length,
    ).toBe(0);

    await act(async () => pressByTestID(tree, 'home-starter-pick'));
    expect(tabNavigate).toHaveBeenCalledWith('Lessons', {
      screen: 'ContentLessonList',
    });
  });

  it('falls back to a single create CTA when the library is empty', async () => {
    // A past personal lesson exists but the packaged library was never
    // installed, so the hero offers create — the past lesson stays
    // reachable through the rail below.
    const lessonId = seedPersonalLesson();
    const tabNavigate = jest.fn();
    const tree = await renderHome(navigation(tabNavigate));
    expect(
      tree.root.findAll(node => node.props.testID === 'home-starter-pick')
        .length,
    ).toBe(0);
    expect(
      tree.root.findAll(node => node.props.testID === 'home-starter-create')
        .length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(
        node => node.props.testID === `home-recent-item-${lessonId}`,
      ).length,
    ).toBeGreaterThan(0);
    await act(async () => pressByTestID(tree, 'home-starter-create'));
    expect(tabNavigate).toHaveBeenCalledWith('Create');
  });

  it('interpolates the real library count into the pick subtitle', async () => {
    const installed = await bootstrapContentPackage();
    expect(installed.ok).toBe(true);
    const expected = listActivePackageLessons().length;
    expect(expected).toBeGreaterThan(0);
    const tree = await renderHome();
    // i18next {{n}} must render the number — never the literal placeholder.
    expect(
      tree.root.findAllByProps({
        children: `Thư viện có ${expected} bài, học ngay không cần mạng`,
      }).length,
    ).toBeGreaterThan(0);
  });

  it('shows the continue hero for a started lesson with no fake numbers', async () => {
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
    // The starter hero never shows alongside Continue.
    expect(
      tree.root.findAll(node => node.props.testID === 'home-starter-section')
        .length,
    ).toBe(0);
    // No streak tag, no weekly-goal card, no progress bar or hard-coded 0%.
    expect(tree.root.findAllByProps({children: '0%'}).length).toBe(0);
    await act(async () => pressByTestID(tree, 'home-continue-action'));
    expect(nav.navigate).toHaveBeenCalledWith('ContentLessonRuntime', {
      lessonId: packaged.id,
    });
  });

  it('lists the started lesson once, first, in the rail', async () => {
    const installed = await bootstrapContentPackage();
    expect(installed.ok).toBe(true);
    const packaged = listActivePackageLessons();
    expect(packaged.length).toBeGreaterThan(1);
    expect(startContentLesson({lessonId: packaged[0].id}).ok).toBe(true);
    const tree = await renderHome();
    // Continue hero shows instead of the starter hero.
    expect(
      tree.root.findAll(node => node.props.testID === 'home-continue-section')
        .length,
    ).toBeGreaterThan(0);
    // The started lesson leads the rail exactly once — never duplicated.
    // (Only nodes with onPress count: the RN mock spreads testID onto
    // inner views.)
    const pressablesFor = (id: string) =>
      tree.root.findAll(
        node =>
          node.props.testID === `home-recent-item-${id}` &&
          typeof node.props.onPress === 'function',
      );
    expect(pressablesFor(packaged[0].id).length).toBe(1);
    expect(pressablesFor(packaged[1].id).length).toBeGreaterThan(0);
  });

  it('routes a saved packaged lesson from the rail to its runtime', async () => {
    const installed = await bootstrapContentPackage();
    expect(installed.ok).toBe(true);
    const packaged = listActivePackageLessons()[0];
    expect(packaged).toBeDefined();
    expect(saveContentLesson({lessonId: packaged.id}).ok).toBe(true);
    const nav = navigation();
    const tree = await renderHome(nav);
    expect(
      tree.root.findAll(
        node => node.props.testID === `home-recent-item-${packaged.id}`,
      ).length,
    ).toBeGreaterThan(0);
    await act(async () =>
      pressByTestID(tree, `home-recent-item-${packaged.id}`),
    );
    expect(nav.navigate).toHaveBeenCalledWith('ContentLessonRuntime', {
      lessonId: packaged.id,
    });
  });

  it('routes a personal lesson from the rail to its detail', async () => {
    const lessonId = seedPersonalLesson();
    const nav = navigation();
    const tree = await renderHome(nav);
    await act(async () =>
      pressByTestID(tree, `home-recent-item-${lessonId}`),
    );
    expect(nav.navigate).toHaveBeenCalledWith('SavedLessonDetail', {
      lessonId,
    });
  });
});
