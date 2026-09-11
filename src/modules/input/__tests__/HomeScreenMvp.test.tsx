import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider} from '@/release';
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

function seedLesson() {
  const lesson = saveLesson({
    confirmedText: validFullOutput.original_text,
    sourceType: 'paste_text',
    lesson: validFullOutput,
  });
  if (!lesson.ok) throw new Error('Could not seed lesson');
}

async function pressChip(
  tree: ReactTestRenderer.ReactTestRenderer,
  testID: string,
) {
  const target = tree.root
    .findAll(node => node.props.testID === testID)
    .find(node => typeof node.props.onPress === 'function');
  if (!target) throw new Error(`No pressable found for testID ${testID}`);
  await act(async () => target.props.onPress());
}

describe('HomeScreen today chips (SETE-247)', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
  });

  it('routes the review chip to DailyReview', async () => {
    seedLesson();
    const nav = navigation();
    const tree = await renderHome(nav);
    await pressChip(tree, 'home-today-review');
    expect(nav.navigate).toHaveBeenCalledWith('DailyReview');
  });

  it('routes the speaking chip to the library SpeakingRoom', async () => {
    seedLesson();
    const tabNavigate = jest.fn();
    const tree = await renderHome(navigation(tabNavigate));
    await pressChip(tree, 'home-today-speaking');
    expect(tabNavigate).toHaveBeenCalledWith('Lessons', {
      screen: 'SpeakingRoom',
    });
  });

  it('routes the quick-practice chip with real questions (never empty)', async () => {
    seedLesson();
    const nav = navigation();
    const tree = await renderHome(nav);
    await pressChip(tree, 'home-today-quick');
    expect(nav.navigate).toHaveBeenCalledWith(
      'Practice',
      expect.objectContaining({
        questions: expect.arrayContaining([expect.anything()]),
      }),
    );
    const [, params] = (nav.navigate as jest.Mock).mock.calls.find(
      ([screen]: [string]) => screen === 'Practice',
    ) as [string, {questions: unknown[]}];
    expect(params.questions.length).toBeGreaterThan(0);
  });

  it('hides the quick-practice chip when no lesson has questions', async () => {
    const lesson = saveLesson({
      confirmedText: validMinimalOutput.original_text,
      sourceType: 'paste_text',
      lesson: validMinimalOutput,
    });
    if (!lesson.ok) throw new Error('Could not seed minimal lesson');
    const tree = await renderHome();
    expect(
      tree.root.findAll(node => node.props.testID === 'home-today-quick')
        .length,
    ).toBe(0);
    // Review + speaking stay available — the row never goes fully missing.
    expect(
      tree.root.findAll(node => node.props.testID === 'home-today-review')
        .length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(node => node.props.testID === 'home-today-speaking')
        .length,
    ).toBeGreaterThan(0);
  });
});
