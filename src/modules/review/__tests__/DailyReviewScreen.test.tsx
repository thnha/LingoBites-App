import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider} from '../../../release';
import {DB_NAME} from '../../../shared/db/constants';
import {resetDatabaseForTests} from '../../../shared/db/database';
import {saveFlashcard} from '../../../shared/db/FlashcardRepository';
import {saveLesson} from '../../../shared/db/LessonRepository';
import {validFullOutput} from '../../../shared/fixtures';
import {AppThemeProvider} from '../../../theme';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {DailyReviewScreen} from '../DailyReviewScreen';

function navigation() {
  return {
    goBack: jest.fn(),
    navigate: jest.fn(),
    popToTop: jest.fn(),
  };
}

async function renderScreen(ui: React.ReactElement) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider releaseName="situation-learning-release">
        <AppThemeProvider>{ui}</AppThemeProvider>
      </FeatureFlagProvider>,
    );
    await Promise.resolve();
  });
  return tree;
}

function seedCards(count: number) {
  const lessonRes = saveLesson({
    confirmedText: `${validFullOutput.original_text} ${count}`,
    sourceType: 'paste_text',
    lesson: {...validFullOutput, title: `Review lesson ${count}`},
  });
  if (!lessonRes.ok) {
    throw new Error('Could not seed lesson');
  }

  return Array.from({length: count}, (_, index) => {
    const vocab = {
      ...validFullOutput.vocabulary[0],
      id: `review-word-${count}-${index}`,
      word: `word-${index + 1}`,
      meaning_vi: `meaning-${index + 1}`,
    };
    const result = saveFlashcard({
      lessonId: lessonRes.lessonId,
      vocabulary: vocab,
      now: '2026-08-17T00:00:00.000Z',
    });
    if (!result.ok) {
      throw new Error('Could not seed flashcard');
    }
    return result.flashcardId;
  });
}

describe('DailyReviewScreen', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the session snapshot size for progress and shows carry-over at the soft cap', async () => {
    seedCards(7);
    const nav = navigation();

    const tree = await renderScreen(
      <DailyReviewScreen navigation={nav as never} softCap={5} />,
    );

    expect(tree.root.findByProps({testID: 'review-progress'}).props.children).toBe('1 / 5');
    expect(
      tree.root.findAllByProps({children: 'còn 2 thẻ để dành lần ôn sau'}).length,
    ).toBeGreaterThan(0);
  });

  it('skips through the session and renders the completion summary', async () => {
    seedCards(2);
    const nav = navigation();
    const tree = await renderScreen(
      <DailyReviewScreen navigation={nav as never} softCap={5} />,
    );

    await act(async () => {
      tree.root.findByProps({testID: 'rating-remembered'}).props.onPress();
    });
    await act(async () => {
      tree.root.findByProps({testID: 'rating-skip'}).props.onPress();
    });

    expect(tree.root.findByProps({testID: 'review-summary'})).toBeTruthy();
    expect(tree.root.findByProps({testID: 'summary-reviewed-count'}).props.children).toBe(2);
    expect(tree.root.findByProps({testID: 'summary-remembered-count'}).props.children).toBe(1);
    expect(tree.root.findByProps({testID: 'summary-forgot-count'}).props.children).toBe(0);
  });

  it('shows distinct empty copy when no flashcards have ever been saved', async () => {
    const tree = await renderScreen(
      <DailyReviewScreen navigation={navigation() as never} />,
    );

    expect(
      tree.root.findAllByProps({children: 'Lưu flashcard đầu tiên để bắt đầu ôn mỗi ngày.'}).length,
    ).toBeGreaterThan(0);
  });

  it('shows distinct empty copy when all cards are done for today', async () => {
    seedCards(1);
    const tree = await renderScreen(
      <DailyReviewScreen navigation={navigation() as never} />,
    );

    await act(async () => {
      tree.root.findByProps({testID: 'rating-remembered'}).props.onPress();
    });

    expect(tree.root.findByProps({testID: 'review-summary'})).toBeTruthy();

    const secondTree = await renderScreen(
      <DailyReviewScreen navigation={navigation() as never} />,
    );

    expect(
      secondTree.root.findAllByProps({children: 'Bạn đã ôn xong tất cả thẻ đến hạn hôm nay.'}).length,
    ).toBeGreaterThan(0);
  });

  it('exits without confirmation', async () => {
    seedCards(1);
    const nav = navigation();
    const tree = await renderScreen(
      <DailyReviewScreen navigation={nav as never} />,
    );

    await act(async () => {
      tree.root.findByProps({testID: 'review-close'}).props.onPress();
    });

    expect(nav.goBack).toHaveBeenCalledTimes(1);
  });
});
