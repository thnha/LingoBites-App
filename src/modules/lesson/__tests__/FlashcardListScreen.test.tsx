import React from 'react';
import {Alert} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider} from '../../../release';
import {AppThemeProvider} from '../../../theme';
import {DB_NAME} from '../../../shared/db/constants';
import {resetDatabaseForTests} from '../../../shared/db/database';
import {saveFlashcard} from '../../../shared/db/FlashcardRepository';
import {saveLesson} from '../../../shared/db/LessonRepository';
import {validFullOutput} from '../../../shared/fixtures';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {FlashcardListScreen} from '../FlashcardListScreen';

async function renderScreen(
  ui: React.ReactElement,
  releaseName: 'situation-learning-release' | 'close-beta-1' = 'situation-learning-release',
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
  return tree;
}

describe('FlashcardListScreen', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders disabled error card when reviewSystem feature flag is disabled', async () => {
    // 'close-beta-1' release config has reviewSystem = false
    const tree = await renderScreen(
      <FlashcardListScreen />,
      'close-beta-1',
    );

    const errorCards = tree.root.findAllByProps({
      message: 'Tính năng ôn tập hiện chưa được bật.',
    });
    expect(errorCards.length).toBeGreaterThan(0);
  });

  it('displays all saved flashcards when reviewSystem is enabled', async () => {
    const lessonRes = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });
    expect(lessonRes.ok).toBe(true);

    if (!lessonRes.ok) return;

    const vocab1 = {
      id: 'v1-word',
      word: 'offer',
      meaning_vi: 'cung cấp',
    };
    const vocab2 = {
      id: 'v2-word',
      word: 'discount',
      meaning_vi: 'giảm giá',
    };

    saveFlashcard({lessonId: lessonRes.lessonId, vocabulary: vocab1});
    saveFlashcard({lessonId: lessonRes.lessonId, vocabulary: vocab2});

    const tree = await renderScreen(<FlashcardListScreen />);

    const cardItem1 = tree.root.findAllByProps({
      accessibilityLabel: `Flashcard ${vocab1.word}`,
    });
    const cardItem2 = tree.root.findAllByProps({
      accessibilityLabel: `Flashcard ${vocab2.word}`,
    });

    expect(cardItem1.length).toBeGreaterThan(0);
    expect(cardItem2.length).toBeGreaterThan(0);
  });

  it('filters flashcards by lesson', async () => {
    const lesson1Res = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: {...validFullOutput, title: 'Lesson One'},
    });
    const lesson2Res = saveLesson({
      confirmedText: 'Second lesson text',
      sourceType: 'paste_text',
      lesson: {...validFullOutput, title: 'Lesson Two'},
    });

    if (!lesson1Res.ok || !lesson2Res.ok) return;

    const vocab1 = {
      id: 'v1-word',
      word: 'offer',
      meaning_vi: 'cung cấp',
    };
    const vocab2 = {
      id: 'vocab-lesson2',
      word: 'unique-lesson2-word',
      meaning_vi: 'Nghĩa của bài 2',
    };

    saveFlashcard({lessonId: lesson1Res.lessonId, vocabulary: vocab1});
    saveFlashcard({lessonId: lesson2Res.lessonId, vocabulary: vocab2});

    // Render screen filtered by lesson2Res.lessonId via route params
    const route = {
      key: 'FlashcardList',
      name: 'FlashcardList',
      params: {lessonId: lesson2Res.lessonId},
    } as React.ComponentProps<typeof FlashcardListScreen>['route'];

    const tree = await renderScreen(
      <FlashcardListScreen route={route} />,
    );

    const cardItem1 = tree.root.findAllByProps({
      accessibilityLabel: `Flashcard ${vocab1.word}`,
    });
    const cardItem2 = tree.root.findAllByProps({
      accessibilityLabel: `Flashcard ${vocab2.word}`,
    });

    expect(cardItem1.length).toBe(0);
    expect(cardItem2.length).toBeGreaterThan(0);
  });

  it('handles E2 edge case: displays same word from 2 different lessons as 2 distinct items', async () => {
    const lesson1Res = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: {...validFullOutput, title: 'Lesson Alpha'},
    });
    const lesson2Res = saveLesson({
      confirmedText: 'Another lesson text',
      sourceType: 'paste_text',
      lesson: {...validFullOutput, title: 'Lesson Beta'},
    });

    if (!lesson1Res.ok || !lesson2Res.ok) return;

    // Same word "duplicate-word" saved in 2 different lessons
    const duplicateWordVocab = {
      id: 'vocab-same-1',
      word: 'duplicate-word',
      meaning_vi: 'Từ trùng lặp',
    };

    const card1Res = saveFlashcard({
      lessonId: lesson1Res.lessonId,
      vocabulary: duplicateWordVocab,
    });
    const card2Res = saveFlashcard({
      lessonId: lesson2Res.lessonId,
      vocabulary: duplicateWordVocab,
    });

    expect(card1Res.ok).toBe(true);
    expect(card2Res.ok).toBe(true);

    if (!card1Res.ok || !card2Res.ok) return;

    const tree = await renderScreen(<FlashcardListScreen />);

    // Verify 2 separate card items rendered with unique card IDs
    const cardItem1 = tree.root.findByProps({
      testID: `card-item-${card1Res.flashcardId}`,
    });
    const cardItem2 = tree.root.findByProps({
      testID: `card-item-${card2Res.flashcardId}`,
    });

    expect(cardItem1).toBeTruthy();
    expect(cardItem2).toBeTruthy();

    // Verify each card clearly tags its respective lesson title
    const tag1 = tree.root.findByProps({
      testID: `card-lesson-tag-${card1Res.flashcardId}`,
    });
    const tag2 = tree.root.findByProps({
      testID: `card-lesson-tag-${card2Res.flashcardId}`,
    });

    expect(tag1.props.children).toContain('Lesson Alpha');
    expect(tag2.props.children).toContain('Lesson Beta');
  });

  it('opens FlipCard on item tap and toggles flip state', async () => {
    const lessonRes = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });
    if (!lessonRes.ok) return;

    const vocab = validFullOutput.vocabulary[0];
    const cardRes = saveFlashcard({
      lessonId: lessonRes.lessonId,
      vocabulary: vocab,
    });
    if (!cardRes.ok) return;

    const tree = await renderScreen(<FlashcardListScreen />);

    // Tap card item to select active FlipCard
    const cardItem = tree.root.findByProps({
      testID: `card-item-${cardRes.flashcardId}`,
    });

    await act(async () => {
      cardItem.props.onPress();
    });

    // Verify active FlipCard view is opened
    const activeFlipCardView = tree.root.findByProps({
      testID: 'active-flipcard-view',
    });
    expect(activeFlipCardView).toBeTruthy();

    const activeFlipCard = tree.root.findByProps({
      testID: 'active-flip-card',
    });
    expect(activeFlipCard.props.flipped).toBe(false);

    // Tap FlipCard to flip
    await act(async () => {
      activeFlipCard.props.onFlip();
    });

    expect(activeFlipCard.props.flipped).toBe(true);
  });

  it('triggers Alert.alert on unsave and removes card when confirmed', async () => {
    const lessonRes = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });
    if (!lessonRes.ok) return;

    const vocab = validFullOutput.vocabulary[0];
    const cardRes = saveFlashcard({
      lessonId: lessonRes.lessonId,
      vocabulary: vocab,
    });
    if (!cardRes.ok) return;

    const tree = await renderScreen(<FlashcardListScreen />);

    const unsaveBtn = tree.root.findByProps({
      testID: `unsave-button-${cardRes.flashcardId}`,
    });

    await act(async () => {
      unsaveBtn.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Bỏ lưu flashcard',
      expect.stringContaining(vocab.word),
      expect.any(Array),
    );

    // Simulate pressing 'Bỏ lưu' (destructive option) in Alert
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const buttons = alertCalls[0][2];
    const destructiveBtn = buttons.find(
      (b: {style?: string}) => b.style === 'destructive',
    );

    await act(async () => {
      destructiveBtn.onPress();
      await Promise.resolve();
    });

    // Verify card item is removed from screen
    const removedCardItem = tree.root.findAllByProps({
      testID: `card-item-${cardRes.flashcardId}`,
    });
    expect(removedCardItem.length).toBe(0);
  });
});
