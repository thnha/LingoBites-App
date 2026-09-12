import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider} from '@/release';
import {makeTestReleaseConfig, CORE_WITH_REVIEW} from '@/test-support';
import {DB_NAME} from '@shared/db/constants';
import {resetDatabaseForTests} from '@shared/db/database';
import {saveLesson} from '@shared/db/LessonRepository';
import {validFullOutput, validMinimalOutput} from '@shared/fixtures';
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

function seedLesson() {
  const lesson = saveLesson({
    confirmedText: validFullOutput.original_text,
    sourceType: 'paste_text',
    lesson: validFullOutput,
  });
  if (!lesson.ok) throw new Error('Could not seed lesson');
}

function seedMinimalLesson() {
  const lesson = saveLesson({
    confirmedText: validMinimalOutput.original_text,
    sourceType: 'paste_text',
    lesson: validMinimalOutput,
  });
  if (!lesson.ok) throw new Error('Could not seed minimal lesson');
}

async function pressCell(
  tree: ReactTestRenderer.ReactTestRenderer,
  testID: string,
) {
  const target = tree.root
    .findAll(node => node.props.testID === testID)
    .find(node => typeof node.props.onPress === 'function');
  if (!target) throw new Error(`No pressable found for testID ${testID}`);
  await act(async () => target.props.onPress());
}

const CELLS = [
  'home-explore-video',
  'home-explore-news',
  'home-explore-offline',
  'home-explore-practice',
];

describe('HomeScreen explore grid (SETE-279)', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
  });

  it('renders the section title and all four cells', async () => {
    seedLesson();
    const tree = await renderHome();
    expect(
      tree.root.findAll(node => node.props.testID === 'home-explore-section')
        .length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAllByProps({children: 'Bạn muốn học gì?'}).length,
    ).toBeGreaterThan(0);
    for (const testID of CELLS) {
      expect(
        tree.root.findAll(node => node.props.testID === testID).length,
      ).toBeGreaterThan(0);
    }
  });

  it('routes every cell to the Lessons tab (temporary destination)', async () => {
    seedLesson();
    for (const testID of CELLS) {
      const tabNavigate = jest.fn();
      const tree = await renderHome(navigation(tabNavigate));
      await pressCell(tree, testID);
      expect(tabNavigate).toHaveBeenCalledWith('Lessons');
    }
  });

  it('routes "view all" to the Lessons tab', async () => {
    seedLesson();
    const tabNavigate = jest.fn();
    const tree = await renderHome(navigation(tabNavigate));
    await pressCell(tree, 'home-explore-view-all');
    expect(tabNavigate).toHaveBeenCalledWith('Lessons');
  });

  it('shows the grid even with no lessons (never a dead end)', async () => {
    seedMinimalLesson();
    const tree = await renderHome();
    for (const testID of CELLS) {
      expect(
        tree.root.findAll(node => node.props.testID === testID).length,
      ).toBeGreaterThan(0);
    }
  });
});
