import React from 'react';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactTestRenderer from 'react-test-renderer';
import {open} from 'react-native-quick-sqlite';
import {FeatureFlagProvider} from '@/release';
import {makeTestReleaseConfig, CORE_WITH_REVIEW} from '@/test-support';
import type {CreateStackParamList} from '@/app/navigation/types';
import {AppThemeProvider} from '@theme';
import {DB_NAME} from '@shared/db/constants';
import {resetDatabaseForTests} from '@shared/db/database';
import {listFlashcards} from '@shared/db/FlashcardRepository';
import {listLessons} from '@shared/db/LessonRepository';
import {validFullOutput} from '@shared/fixtures';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {LessonResultScreen} from '../LessonResultScreen';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

const navigation = {
  navigate: jest.fn(),
  popToTop: jest.fn(),
} as unknown as NativeStackScreenProps<
  CreateStackParamList,
  'LessonResult'
>['navigation'];

describe('LessonResultScreen flashcard save UI', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
    await AsyncStorage.clear();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('saves the lesson and vocabulary when a WordCard save button is confirmed', async () => {
    const word = validFullOutput.vocabulary[0];
    const route = {
      key: 'LessonResult',
      name: 'LessonResult',
      params: {
        lesson: validFullOutput,
        confirmedText: validFullOutput.original_text,
        sourceType: 'paste_text',
      },
    } as React.ComponentProps<typeof LessonResultScreen>['route'];

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <FeatureFlagProvider releaseConfig={makeTestReleaseConfig(CORE_WITH_REVIEW)}>
          <AppThemeProvider>
            <LessonResultScreen navigation={navigation} route={route} />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
      await Promise.resolve();
    });

    await ReactTestRenderer.act(async () => {
      tree.root
        .findByProps({testID: `word-card-save-${word.id}`})
        .props.onPress();
      await Promise.resolve();
    });

    const confirmButton = (Alert.alert as jest.Mock).mock.calls[0][2].find(
      (button: {text: string}) => button.text === 'Đã hiểu, lưu từ',
    );
    await ReactTestRenderer.act(async () => {
      confirmButton.onPress();
      await Promise.resolve();
    });

    const lessons = listLessons();
    expect(lessons).toHaveLength(1);
    expect(listFlashcards({lessonId: lessons[0].id})[0]).toMatchObject({
      word: word.word,
      vocabularyId: word.id,
      isSaved: true,
    });
  });
});
