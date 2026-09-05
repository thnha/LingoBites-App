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
import {hasAccessibilityLabel, hasAccessibilityRole} from '../../../../test-utils/a11yTestUtils';

const renderedTrees: ReactTestRenderer.ReactTestRenderer[] = [];

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
  renderedTrees.push(tree);
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

describe('DailyReviewScreen - Accessibility', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
  });

  afterEach(() => {
    renderedTrees.splice(0).forEach(tree => {
      act(() => {
        tree.unmount();
      });
    });
    jest.restoreAllMocks();
  });

  describe('Review Session Screen', () => {
    it('has accessible close button', async () => {
      seedCards(1);
      const tree = await renderScreen(
        <DailyReviewScreen navigation={navigation() as never} />,
      );

      const closeButton = tree.root.findByProps({testID: 'review-close'});
      expect(hasAccessibilityLabel(closeButton)).toBe(true);
      expect(hasAccessibilityRole(closeButton)).toBe(true);
      expect(closeButton.props.accessibilityLabel).toBe('Đóng phiên ôn tập');
      expect(closeButton.props.accessibilityRole).toBe('button');
    });

    it('has accessible FlipCard', async () => {
      seedCards(1);
      const tree = await renderScreen(
        <DailyReviewScreen navigation={navigation() as never} />,
      );

      // FlipCard's testID is on the inner Pressable which has the accessibility props
      const flipCardPressables = tree.root.findAll(
        node =>
          node.props.testID === 'daily-review-flip-card' &&
          node.props.accessibilityLabel !== undefined,
      );
      expect(flipCardPressables.length).toBeGreaterThan(0);

      const flipCard = flipCardPressables[0];
      expect(hasAccessibilityLabel(flipCard)).toBe(true);
      expect(hasAccessibilityRole(flipCard)).toBe(true);
      expect(flipCard.props.accessibilityHint).toBe('Chạm để lật thẻ');
    });

    it('has accessible RatingControl buttons', async () => {
      seedCards(1);
      const tree = await renderScreen(
        <DailyReviewScreen navigation={navigation() as never} />,
      );

      const ratingButtons = ['rating-forgot', 'rating-hard', 'rating-good', 'rating-easy'];
      const skipButton = tree.root.findByProps({testID: 'rating-skip'});

      expect(hasAccessibilityLabel(skipButton)).toBe(true);
      expect(hasAccessibilityRole(skipButton)).toBe(true);

      for (const testID of ratingButtons) {
        const button = tree.root.findByProps({testID});
        expect(hasAccessibilityLabel(button)).toBe(true);
        expect(hasAccessibilityRole(button)).toBe(true);
      }
    });

    it('has accessible progress indicator', async () => {
      seedCards(3);
      const tree = await renderScreen(
        <DailyReviewScreen navigation={navigation() as never} />,
      );

      const progress = tree.root.findByProps({testID: 'review-progress'});
      expect(progress).toBeTruthy();
      expect(progress.props.children).toBe('1 / 3');
    });
  });

  describe('Summary Screen', () => {
    it('has accessible summary content with testIDs', async () => {
      seedCards(2);
      const tree = await renderScreen(
        <DailyReviewScreen navigation={navigation() as never} />,
      );

      await act(async () => {
        tree.root.findByProps({testID: 'rating-good'}).props.onPress();
      });
      await act(async () => {
        tree.root.findByProps({testID: 'rating-forgot'}).props.onPress();
      });

      const summary = tree.root.findByProps({testID: 'review-summary'});
      expect(summary).toBeTruthy();

      const reviewedCount = tree.root.findByProps({testID: 'summary-reviewed-count'});
      const goodCount = tree.root.findByProps({testID: 'summary-good-count'});
      const forgotCount = tree.root.findByProps({testID: 'summary-forgot-count'});
      const hardCount = tree.root.findByProps({testID: 'summary-hard-count'});
      const easyCount = tree.root.findByProps({testID: 'summary-easy-count'});

      expect(reviewedCount).toBeTruthy();
      expect(goodCount).toBeTruthy();
      expect(forgotCount).toBeTruthy();
      expect(hardCount).toBeTruthy();
      expect(easyCount).toBeTruthy();

      expect(reviewedCount.props.children).toBe(2);
      expect(goodCount.props.children).toBe(1);
      expect(forgotCount.props.children).toBe(1);
      expect(hardCount.props.children).toBe(0);
      expect(easyCount.props.children).toBe(0);
    });

    it('has accessible return button on summary', async () => {
      seedCards(1);
      const tree = await renderScreen(
        <DailyReviewScreen navigation={navigation() as never} />,
      );

      await act(async () => {
        tree.root.findByProps({testID: 'rating-skip'}).props.onPress();
      });

      // Find the "Quay về Home" button
      const buttons = tree.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Quay về Home' &&
          typeof node.props.onPress === 'function',
      );

      expect(buttons.length).toBeGreaterThan(0);
      const returnButton = buttons[0];
      expect(hasAccessibilityLabel(returnButton)).toBe(true);
    });
  });

  describe('Empty States', () => {
    it('has meaningful content for empty state 06a (never saved)', async () => {
      const tree = await renderScreen(
        <DailyReviewScreen navigation={navigation() as never} />,
      );

      const emptyMessages = tree.root.findAll(
        node => node.props.children === 'Lưu flashcard đầu tiên để bắt đầu ôn mỗi ngày.',
      );

      expect(emptyMessages.length).toBeGreaterThan(0);
    });

    it('has meaningful content for empty state 06b (all done today)', async () => {
      seedCards(1);
      const tree = await renderScreen(
        <DailyReviewScreen navigation={navigation() as never} />,
      );

      await act(async () => {
        tree.root.findByProps({testID: 'rating-good'}).props.onPress();
      });

      const secondTree = await renderScreen(
        <DailyReviewScreen navigation={navigation() as never} />,
      );

      const doneMessages = secondTree.root.findAll(
        node => node.props.children === 'Bạn đã ôn xong tất cả thẻ đến hạn hôm nay.',
      );

      expect(doneMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Banner Accessibility', () => {
    it('has testID for banner when carry-over exists', async () => {
      seedCards(7);
      const tree = await renderScreen(
        <DailyReviewScreen navigation={navigation() as never} softCap={5} />,
      );

      const banner = tree.root.findByProps({testID: 'review-banner'});
      expect(banner).toBeTruthy();
    });
  });
});
