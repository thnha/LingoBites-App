import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider} from '@/release';
import {DB_NAME} from '@shared/db/constants';
import {resetDatabaseForTests} from '@shared/db/database';
import {saveLesson} from '@shared/db/LessonRepository';
import {
  saveContentLesson,
  startContentLesson,
} from '@shared/db/ContentLessonStateRepository';
import {saveFlashcard} from '@shared/db/FlashcardRepository';
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

describe('HomeScreen starter card (SETE-250 Option B)', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
  });

  it('shows all three starter rows when the library and history exist', async () => {
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
    expect(
      tree.root.findAll(node => node.props.testID === 'home-starter-create')
        .length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(node => node.props.testID === 'home-starter-relearn')
        .length,
    ).toBeGreaterThan(0);

    await act(async () => pressByTestID(tree, 'home-starter-pick'));
    expect(tabNavigate).toHaveBeenCalledWith('Lessons', {
      screen: 'ContentLessonList',
    });
    await act(async () => pressByTestID(tree, 'home-starter-create'));
    expect(tabNavigate).toHaveBeenCalledWith('Create');
  });

  it('routes the relearn row straight to the newest personal lesson', async () => {
    const installed = await bootstrapContentPackage();
    expect(installed.ok).toBe(true);
    const lessonId = seedPersonalLesson();
    const nav = navigation();
    const tree = await renderHome(nav);
    await act(async () => pressByTestID(tree, 'home-starter-relearn'));
    expect(nav.navigate).toHaveBeenCalledWith('SavedLessonDetail', {
      lessonId,
    });
  });

  it('routes the relearn row to a saved packaged lesson runtime', async () => {
    const installed = await bootstrapContentPackage();
    expect(installed.ok).toBe(true);
    const packaged = listActivePackageLessons()[0];
    expect(packaged).toBeDefined();
    expect(saveContentLesson({lessonId: packaged.id}).ok).toBe(true);
    const nav = navigation();
    const tree = await renderHome(nav);
    expect(
      tree.root.findAll(node => node.props.testID === 'home-starter-relearn')
        .length,
    ).toBeGreaterThan(0);
    await act(async () => pressByTestID(tree, 'home-starter-relearn'));
    expect(nav.navigate).toHaveBeenCalledWith('ContentLessonRuntime', {
      lessonId: packaged.id,
    });
  });

  it('excludes the started lesson from the offline suggestions', async () => {
    const installed = await bootstrapContentPackage();
    expect(installed.ok).toBe(true);
    const packaged = listActivePackageLessons();
    expect(packaged.length).toBeGreaterThan(1);
    expect(startContentLesson({lessonId: packaged[0].id}).ok).toBe(true);
    const tree = await renderHome();
    // Continue shows instead of the starter; suggestions skip the started id.
    expect(
      tree.root.findAll(node => node.props.testID === 'home-continue-section')
        .length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(
        node =>
          node.props.testID === `home-offline-suggestion-${packaged[0].id}`,
      ).length,
    ).toBe(0);
    expect(
      tree.root.findAll(
        node =>
          node.props.testID === `home-offline-suggestion-${packaged[1].id}`,
      ).length,
    ).toBeGreaterThan(0);
  });

  it('shows the done state instead of 0 on the review chip', async () => {
    seedPersonalLesson();
    const tree = await renderHome();
    const chip = tree.root
      .findAll(item => item.props.testID === 'home-today-review')
      .find(item => typeof item.props.onPress === 'function');
    if (!chip) throw new Error('No today review chip found');
    expect(
      chip.findAll(item => item.props.children === 'Xong ✓').length,
    ).toBeGreaterThan(0);
    expect(chip.findAll(item => item.props.children === '0').length).toBe(0);
  });

  it('shows the live due count when cards are due', async () => {
    const lessonId = seedPersonalLesson();
    saveFlashcard({
      lessonId,
      vocabulary: validFullOutput.vocabulary[0],
      now: '2026-08-17T00:00:00.000Z',
    });
    const tree = await renderHome();
    const chip = tree.root
      .findAll(item => item.props.testID === 'home-today-review')
      .find(item => typeof item.props.onPress === 'function');
    if (!chip) throw new Error('No today review chip found');
    expect(
      chip.findAll(item => item.props.children === '1').length,
    ).toBeGreaterThan(0);
  });

  it('uses the proposal-2 copy set exactly once per screen', async () => {
    seedPersonalLesson();
    const tree = await renderHome();
    expect(
      tree.root.findAllByProps({children: 'Chào bạn 👋'}).length,
    ).toBeGreaterThan(0);
    // The old question header is gone from Home…
    expect(
      tree.root.findAllByProps({children: 'Hôm nay bạn học gì?'}).length,
    ).toBe(0);
    expect(tree.root.findAllByProps({children: 'Hôm nay học gì'}).length).toBe(
      0,
    );
    // …replaced by the practice + your-lessons titles.
    expect(
      tree.root.findAllByProps({children: 'Luyện tập hôm nay'}).length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAllByProps({children: 'Bài học của bạn'}).length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAllByProps({children: 'Bắt đầu từ đâu?'}).length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAllByProps({children: 'Xem kế hoạch'}).length,
    ).toBeGreaterThan(0);
  });

  it('gives every starter row a full-sentence accessibility label', async () => {
    const installed = await bootstrapContentPackage();
    expect(installed.ok).toBe(true);
    seedPersonalLesson();
    const tree = await renderHome();
    for (const testID of [
      'home-starter-pick',
      'home-starter-create',
      'home-starter-relearn',
    ]) {
      const row = tree.root
        .findAll(item => item.props.testID === testID)
        .find(item => typeof item.props.onPress === 'function');
      if (!row) throw new Error(`No starter row found for ${testID}`);
      const label = row.props.accessibilityLabel as string;
      // Title + subtitle context, not just the title.
      expect(label.split('.').length).toBeGreaterThan(1);
    }
  });
});
