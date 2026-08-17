import React from 'react';
import {Alert} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FeatureFlagProvider} from '../../../release';
import {validFullOutput} from '../../../shared/fixtures';
import type {LessonsStackParamList} from '../../../app/navigation/types';
import {AppThemeProvider} from '../../../theme';
import {DB_NAME} from '../../../shared/db/constants';
import {resetDatabaseForTests} from '../../../shared/db/database';
import {listFlashcards} from '../../../shared/db/FlashcardRepository';
import {saveLesson} from '../../../shared/db/LessonRepository';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {open} from 'react-native-quick-sqlite';
import {GrammarDetailScreen} from '../GrammarDetailScreen';
import {SentenceDetailScreen} from '../SentenceDetailScreen';
import {WordDetailScreen} from '../WordDetailScreen';

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

function testNavigation<RouteName extends keyof LessonsStackParamList>() {
  return navigation as unknown as NativeStackScreenProps<
    LessonsStackParamList,
    RouteName
  >['navigation'];
}

function render(
  node: React.ReactElement,
  releaseName: 'close-beta-1' | 'situation-learning-release' = 'close-beta-1',
) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider releaseName={releaseName}>
        <AppThemeProvider>{node}</AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  return tree;
}

function hasText(tree: ReactTestRenderer.ReactTestRenderer, text: string): boolean {
  return (
    tree.root.findAll(
      node => typeof node.props.children === 'string' && node.props.children === text,
    ).length > 0
  );
}

describe('learning detail screens', () => {
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

  it('SentenceDetailScreen renders the sentence and its chunks', () => {
    const sentence = validFullOutput.sentences[0];
    const route = {
      key: 'SentenceDetail',
      name: 'SentenceDetail',
      params: {sentences: validFullOutput.sentences, index: 0, practice: validFullOutput.practice},
    } as React.ComponentProps<typeof SentenceDetailScreen>['route'];

    const tree = render(
      <SentenceDetailScreen
        navigation={testNavigation<'SentenceDetail'>()}
        route={route}
      />,
    );
    expect(hasText(tree, sentence.original)).toBe(true);
    expect(hasText(tree, 'Tách thành cụm')).toBe(true);
  });

  it('WordDetailScreen renders the headword and meaning', () => {
    const word = validFullOutput.vocabulary[0];
    const route = {
      key: 'WordDetail',
      name: 'WordDetail',
      params: {word, practice: validFullOutput.practice},
    } as React.ComponentProps<typeof WordDetailScreen>['route'];

    const tree = render(
      <WordDetailScreen
        navigation={testNavigation<'WordDetail'>()}
        route={route}
      />,
    );
    expect(hasText(tree, word.word)).toBe(true);
    expect(hasText(tree, word.meaning_vi)).toBe(true);
  });

  it('WordDetailScreen saves after first disclosure and then unsaves the same word', async () => {
    const word = validFullOutput.vocabulary[0];
    const savedLesson = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });
    expect(savedLesson.ok).toBe(true);
    if (!savedLesson.ok) {
      return;
    }

    const route = {
      key: 'WordDetail',
      name: 'WordDetail',
      params: {word, practice: validFullOutput.practice, lessonId: savedLesson.lessonId},
    } as React.ComponentProps<typeof WordDetailScreen>['route'];

    const tree = render(
      <WordDetailScreen
        navigation={testNavigation<'WordDetail'>()}
        route={route}
      />,
      'situation-learning-release',
    );

    const saveButton = tree.root.findByProps({accessibilityLabel: 'Lưu từ'});
    await ReactTestRenderer.act(async () => {
      saveButton.props.onPress();
      await Promise.resolve();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Lưu flashcard đầu tiên',
      expect.any(String),
      expect.any(Array),
      {cancelable: false},
    );

    const confirmButton = (Alert.alert as jest.Mock).mock.calls[0][2].find(
      (button: {text: string}) => button.text === 'Đã hiểu, lưu từ',
    );

    await ReactTestRenderer.act(async () => {
      confirmButton.onPress();
      await Promise.resolve();
    });

    expect(listFlashcards({lessonId: savedLesson.lessonId})).toHaveLength(1);

    const unsaveButton = tree.root.findByProps({accessibilityLabel: 'Bỏ lưu từ'});
    await ReactTestRenderer.act(async () => {
      unsaveButton.props.onPress();
      await Promise.resolve();
    });

    expect(listFlashcards({lessonId: savedLesson.lessonId})).toHaveLength(0);
  });

  it('WordDetailScreen does not show disclosure again after acknowledgement', async () => {
    const word = validFullOutput.vocabulary[0];
    const savedLesson = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });
    expect(savedLesson.ok).toBe(true);
    if (!savedLesson.ok) {
      return;
    }

    const route = {
      key: 'WordDetail',
      name: 'WordDetail',
      params: {word, practice: validFullOutput.practice, lessonId: savedLesson.lessonId},
    } as React.ComponentProps<typeof WordDetailScreen>['route'];

    const firstTree = render(
      <WordDetailScreen
        navigation={testNavigation<'WordDetail'>()}
        route={route}
      />,
      'situation-learning-release',
    );

    await ReactTestRenderer.act(async () => {
      firstTree.root.findByProps({accessibilityLabel: 'Lưu từ'}).props.onPress();
      await Promise.resolve();
    });

    const confirmButton = (Alert.alert as jest.Mock).mock.calls[0][2].find(
      (button: {text: string}) => button.text === 'Đã hiểu, lưu từ',
    );
    await ReactTestRenderer.act(async () => {
      confirmButton.onPress();
      await Promise.resolve();
    });

    (Alert.alert as jest.Mock).mockClear();
    const secondWord = {
      ...validFullOutput.vocabulary[0],
      id: 'second-word',
      word: 'second',
      meaning_vi: 'từ thứ hai',
    };
    const secondRoute = {
      ...route,
      params: {
        word: secondWord,
        practice: validFullOutput.practice,
        lessonId: savedLesson.lessonId,
      },
    } as React.ComponentProps<typeof WordDetailScreen>['route'];
    const secondTree = render(
      <WordDetailScreen
        navigation={testNavigation<'WordDetail'>()}
        route={secondRoute}
      />,
      'situation-learning-release',
    );

    await ReactTestRenderer.act(async () => {
      secondTree.root.findByProps({accessibilityLabel: 'Lưu từ'}).props.onPress();
      await Promise.resolve();
    });

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(listFlashcards({lessonId: savedLesson.lessonId})).toHaveLength(2);
  });

  it('WordDetailScreen hides save UI when reviewSystem is disabled', () => {
    const word = validFullOutput.vocabulary[0];
    const route = {
      key: 'WordDetail',
      name: 'WordDetail',
      params: {word, practice: validFullOutput.practice, lessonId: 'lesson-1'},
    } as React.ComponentProps<typeof WordDetailScreen>['route'];

    const tree = render(
      <WordDetailScreen
        navigation={testNavigation<'WordDetail'>()}
        route={route}
      />,
    );

    expect(tree.root.findAllByProps({accessibilityLabel: 'Lưu từ'})).toHaveLength(0);
  });

  it('GrammarDetailScreen renders the grammar name and explanation', () => {
    const grammar = validFullOutput.grammar_points[0];
    const route = {
      key: 'GrammarDetail',
      name: 'GrammarDetail',
      params: {grammar, related: validFullOutput.grammar_points, practice: validFullOutput.practice},
    } as React.ComponentProps<typeof GrammarDetailScreen>['route'];

    const tree = render(
      <GrammarDetailScreen
        navigation={testNavigation<'GrammarDetail'>()}
        route={route}
      />,
    );
    expect(hasText(tree, grammar.name)).toBe(true);
    expect(hasText(tree, grammar.explanation_vi)).toBe(true);
  });
});
