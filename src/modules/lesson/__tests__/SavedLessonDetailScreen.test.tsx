import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {FeatureFlagProvider} from '../../../release';
import {validFullOutput} from '../../../shared/fixtures';
import {AppThemeProvider} from '../../../theme';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {open} from 'react-native-quick-sqlite';
import {DB_NAME} from '../../../shared/db/constants';
import {resetDatabaseForTests} from '../../../shared/db/database';
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
} as unknown as NativeStackNavigationProp<LessonsStackParamList, 'SavedLessonDetail'>;

describe('SavedLessonDetailScreen', () => {
  beforeEach(() => {
    mockAnalyzeText.mockReset();
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
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
});

