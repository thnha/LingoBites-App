import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider} from '@/release';
import {DB_NAME} from '@shared/db/constants';
import {resetDatabaseForTests} from '@shared/db/database';
import {saveFlashcard} from '@shared/db/FlashcardRepository';
import {saveLesson} from '@shared/db/LessonRepository';
import {validFullOutput} from '@shared/fixtures';
import {AppThemeProvider} from '@theme';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {HomeScreen} from '../HomeScreen';

function navigation() {
  return {navigate: jest.fn(), getParent: () => ({navigate: jest.fn()})};
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

describe('HomeScreen review chip (SETE-247)', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
  });

  it('shows the current due-card count in the today review chip', async () => {
    const lesson = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });
    if (!lesson.ok) throw new Error('Could not seed lesson');
    saveFlashcard({
      lessonId: lesson.lessonId,
      vocabulary: validFullOutput.vocabulary[0],
      now: '2026-08-17T00:00:00.000Z',
    });
    const nav = navigation();
    const tree = await renderHome(nav);
    const chip = tree.root
      .findAll(item => item.props.testID === 'home-today-review')
      .find(item => typeof item.props.onPress === 'function');
    if (!chip) throw new Error('No today review chip found');
    expect(
      chip.findAll(item => item.props.children === '1').length,
    ).toBeGreaterThan(0);
    await act(async () => chip.props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('DailyReview');
  });
});
