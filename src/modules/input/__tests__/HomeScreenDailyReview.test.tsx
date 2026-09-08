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

describe('HomeScreen review shortcut', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
  });

  it('shows the current due-card count in the review shortcut', async () => {
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
    const tree = await renderHome();
    expect(
      tree.root.findAllByProps({children: '1 thẻ'}).length,
    ).toBeGreaterThan(0);
  });
});
