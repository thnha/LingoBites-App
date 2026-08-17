import React from 'react';
import {Alert} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {FeatureFlagProvider} from '../../../release';
import {validFullOutput} from '../../../shared/fixtures';
import {AppThemeProvider} from '../../../theme';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {open} from 'react-native-quick-sqlite';
import {DB_NAME} from '../../../shared/db/constants';
import {resetDatabaseForTests} from '../../../shared/db/database';
import {
  listFlashcards,
  saveFlashcard,
} from '../../../shared/db/FlashcardRepository';
import {saveLesson} from '../../../shared/db/LessonRepository';
import {SavedLessonDetailScreen} from '../SavedLessonDetailScreen';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {LessonsStackParamList} from '../../../app/navigation/types';

const mockAnalyzeText = jest.fn();

jest.mock('../../ai-analysis/AIAnalysisService', () => ({
  analyzeText: (...args: unknown[]) => mockAnalyzeText(...args),
}));

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
} as unknown as NativeStackNavigationProp<LessonsStackParamList, 'SavedLessonDetail'>;

describe('SavedLessonDetailScreen', () => {
  beforeEach(() => {
    mockAnalyzeText.mockReset();
    jest.clearAllMocks();
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('opens saved lesson from DB without calling AI', async () => {
    const saved = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });

    expect(saved.ok).toBe(true);
    if (!saved.ok) {
      return;
    }

    const route = {
      key: 'SavedLessonDetail',
      name: 'SavedLessonDetail',
      params: {lessonId: saved.lessonId},
    } as React.ComponentProps<typeof SavedLessonDetailScreen>['route'];

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <SavedLessonDetailScreen navigation={navigation} route={route} />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
      await Promise.resolve();
    });

    expect(mockAnalyzeText).not.toHaveBeenCalled();
  });

  it('blocks deletion when the lesson has active flashcards and links to the filtered flashcard list', async () => {
    const saved = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });
    expect(saved.ok).toBe(true);
    if (!saved.ok) {
      return;
    }
    saveFlashcard({
      lessonId: saved.lessonId,
      vocabulary: validFullOutput.vocabulary[0],
    });

    const route = {
      key: 'SavedLessonDetail',
      name: 'SavedLessonDetail',
      params: {lessonId: saved.lessonId},
    } as React.ComponentProps<typeof SavedLessonDetailScreen>['route'];

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <FeatureFlagProvider releaseName="situation-learning-release">
          <AppThemeProvider>
            <SavedLessonDetailScreen navigation={navigation} route={route} />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
      await Promise.resolve();
    });

    await ReactTestRenderer.act(async () => {
      tree.root.findByProps({accessibilityLabel: 'Xóa bài học'}).props.onPress();
      await Promise.resolve();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Không thể xóa bài học',
      expect.stringContaining('flashcard'),
      expect.any(Array),
      {cancelable: false},
    );
    expect(navigation.goBack).not.toHaveBeenCalled();
    expect(listFlashcards({lessonId: saved.lessonId})).toHaveLength(1);

    const cta = (Alert.alert as jest.Mock).mock.calls[0][2].find(
      (button: {text: string}) => button.text === 'Xem flashcard',
    );
    ReactTestRenderer.act(() => {
      cta.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith('FlashcardList', {
      lessonId: saved.lessonId,
    });
  });

  it('allows deletion when the lesson has no active flashcards', async () => {
    const saved = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });
    expect(saved.ok).toBe(true);
    if (!saved.ok) {
      return;
    }

    const route = {
      key: 'SavedLessonDetail',
      name: 'SavedLessonDetail',
      params: {lessonId: saved.lessonId},
    } as React.ComponentProps<typeof SavedLessonDetailScreen>['route'];

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <FeatureFlagProvider releaseName="situation-learning-release">
          <AppThemeProvider>
            <SavedLessonDetailScreen navigation={navigation} route={route} />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
      await Promise.resolve();
    });

    await ReactTestRenderer.act(async () => {
      tree.root.findByProps({accessibilityLabel: 'Xóa bài học'}).props.onPress();
      await Promise.resolve();
    });

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
