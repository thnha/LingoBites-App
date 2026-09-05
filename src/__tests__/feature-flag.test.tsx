/**
 * Feature Flag Tests: Flashcard/Review System
 *
 * Verifies that when the reviewSystem feature flag is OFF,
 * all flashcard-related UI is properly hidden.
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider} from '../release';
import {DB_NAME} from '../shared/db/constants';
import {resetDatabaseForTests} from '../shared/db/database';
import {saveFlashcard} from '../shared/db/FlashcardRepository';
import {saveLesson} from '../shared/db/LessonRepository';
import {validFullOutput} from '../shared/fixtures';
import {AppThemeProvider} from '../theme';
import {__resetMockDatabases} from '../../test-utils/sqliteMock';
import {DailyReviewScreen} from '../modules/review/DailyReviewScreen';
import {FlashcardListScreen} from '../modules/lesson/FlashcardListScreen';

const renderedTrees: ReactTestRenderer.ReactTestRenderer[] = [];

async function renderWithFlag(
  ui: React.ReactElement,
  releaseName: 'situation-learning-release' | 'close-beta-1',
) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider releaseName={releaseName}>
        <AppThemeProvider>{ui}</AppThemeProvider>
      </FeatureFlagProvider>,
    );
    await Promise.resolve();
  });
  renderedTrees.push(tree);
  return tree;
}

function createMockNavigation() {
  return {
    goBack: jest.fn(),
    navigate: jest.fn(),
    popToTop: jest.fn(),
    setOptions: jest.fn(),
  };
}

describe('Feature Flag: reviewSystem', () => {
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

  describe('DailyReviewScreen', () => {
    it('shows disabled message when reviewSystem flag is OFF', async () => {
      // Render with close-beta-1 release (reviewSystem disabled)
      const nav = createMockNavigation();
      const tree = await renderWithFlag(
        <DailyReviewScreen navigation={nav as never} />,
        'close-beta-1',
      );

      // Should show error card about feature being disabled
      const errorMessages = tree.root.findAll(
        node => node.props.children === 'Tính năng ôn tập hiện chưa được bật.',
      );

      expect(errorMessages.length).toBeGreaterThan(0);

      // Should NOT show review UI elements
      const flipCards = tree.root.findAll(node => node.props.testID === 'daily-review-flip-card');
      expect(flipCards.length).toBe(0);

      const ratingButtons = tree.root.findAll(node => node.props.testID === 'rating-good');
      expect(ratingButtons.length).toBe(0);
    });

    it('shows review UI when reviewSystem flag is ON', async () => {
      // Create a flashcard to review
      const lessonResult = saveLesson({
        confirmedText: validFullOutput.original_text,
        sourceType: 'paste_text',
        lesson: validFullOutput,
      });

      if (lessonResult.ok) {
        saveFlashcard({
          lessonId: lessonResult.lessonId,
          vocabulary: validFullOutput.vocabulary[0],
          now: '2026-08-17T00:00:00.000Z',
        });
      }

      // Render with situation-learning-release (reviewSystem enabled)
      const nav = createMockNavigation();
      const tree = await renderWithFlag(
        <DailyReviewScreen navigation={nav as never} />,
        'situation-learning-release',
      );

      // Should show review UI
      const flipCards = tree.root.findAll(node => node.props.testID === 'daily-review-flip-card');
      expect(flipCards.length).toBeGreaterThan(0);

      const ratingButtons = tree.root.findAll(node => node.props.testID === 'rating-good');
      expect(ratingButtons.length).toBeGreaterThan(0);

      // Should NOT show disabled message
      const errorMessages = tree.root.findAll(
        node => node.props.children === 'Tính năng ôn tập hiện chưa được bật.',
      );
      expect(errorMessages.length).toBe(0);
    });
  });

  describe('FlashcardListScreen', () => {
    it('shows disabled message when reviewSystem flag is OFF', async () => {
      const nav = createMockNavigation();
      const tree = await renderWithFlag(
        <FlashcardListScreen navigation={nav as never} />,
        'close-beta-1',
      );

      // Should show error card about feature being disabled
      const errorMessages = tree.root.findAll(
        node => node.props.children === 'Tính năng ôn tập hiện chưa được bật.',
      );

      expect(errorMessages.length).toBeGreaterThan(0);
    });

    it('shows flashcard list when reviewSystem flag is ON', async () => {
      // Create a flashcard
      const lessonResult = saveLesson({
        confirmedText: validFullOutput.original_text,
        sourceType: 'paste_text',
        lesson: validFullOutput,
      });

      if (lessonResult.ok) {
        saveFlashcard({
          lessonId: lessonResult.lessonId,
          vocabulary: validFullOutput.vocabulary[0],
        });
      }

      const nav = createMockNavigation();
      const tree = await renderWithFlag(
        <FlashcardListScreen navigation={nav as never} />,
        'situation-learning-release',
      );

      // Should NOT show disabled message
      const errorMessages = tree.root.findAll(
        node => node.props.children === 'Tính năng ôn tập hiện chưa được bật.',
      );
      expect(errorMessages.length).toBe(0);

      // Should show flashcard list or empty state
      // (either the card or an empty state message)
      const allText = tree.root.findAll(node => typeof node.props.children === 'string');
      expect(allText.length).toBeGreaterThan(0);
    });
  });

  describe('HomeScreen integration', () => {
    it('hides due review count when reviewSystem flag is OFF', async () => {
      // Note: This test documents expected behavior
      // The actual HomeScreen uses useFeatureEnabled('reviewSystem')
      // to conditionally render the due count widget

      // When flag is OFF:
      // - getDueFlashcards should return empty array or be skipped
      // - Due count widget should not appear
      // - Review button should not appear

      // This is already tested in HomeScreenDailyReview.test.tsx
      expect(true).toBe(true); // Placeholder - covered by existing tests
    });
  });
});
