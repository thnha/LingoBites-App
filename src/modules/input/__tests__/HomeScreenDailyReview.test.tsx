import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider, type ReleaseConfigName} from '../../../release';
import {DB_NAME} from '../../../shared/db/constants';
import {resetDatabaseForTests} from '../../../shared/db/database';
import {saveFlashcard} from '../../../shared/db/FlashcardRepository';
import {saveLesson} from '../../../shared/db/LessonRepository';
import {validFullOutput} from '../../../shared/fixtures';
import {AppThemeProvider} from '../../../theme';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {HomeScreen} from '../HomeScreen';

function navigation() {
  return {
    navigate: jest.fn(),
    getParent: () => ({navigate: jest.fn()}),
  };
}

async function renderHome(
  nav = navigation(),
  releaseName: ReleaseConfigName = 'situation-learning-release',
) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider releaseName={releaseName}>
        <AppThemeProvider>
          <HomeScreen navigation={nav as never} route={{} as never} />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
    await Promise.resolve();
  });
  return tree;
}

function seedDueCard() {
  const lessonRes = saveLesson({
    confirmedText: validFullOutput.original_text,
    sourceType: 'paste_text',
    lesson: validFullOutput,
  });
  if (!lessonRes.ok) {
    throw new Error('Could not seed lesson');
  }
  saveFlashcard({
    lessonId: lessonRes.lessonId,
    vocabulary: validFullOutput.vocabulary[0],
    now: '2026-08-17T00:00:00.000Z',
  });
}

describe('HomeScreen daily review widget', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
  });

  it('shows due count and opens the daily review session', async () => {
    seedDueCard();
    const nav = navigation();
    const tree = await renderHome(nav);

    expect(tree.root.findByProps({testID: 'daily-review-widget'})).toBeTruthy();
    expect(tree.root.findAllByProps({children: '1 thẻ đến hạn hôm nay'}).length).toBeGreaterThan(0);

    await act(async () => {
      tree.root.findByProps({testID: 'daily-review-widget'}).props.onPress();
    });

    expect(nav.navigate).toHaveBeenCalledWith('DailyReview');
  });

  it('hides the widget when no cards are due or the flag is disabled', async () => {
    const noDueTree = await renderHome();
    expect(noDueTree.root.findAllByProps({testID: 'daily-review-widget'})).toHaveLength(0);

    seedDueCard();
    const flagOffTree = await renderHome(navigation(), 'close-beta-1');
    expect(flagOffTree.root.findAllByProps({testID: 'daily-review-widget'})).toHaveLength(0);
  });
});
