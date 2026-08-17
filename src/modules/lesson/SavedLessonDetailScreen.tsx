import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Alert, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList, LessonsStackParamList} from '../../app/navigation/types';
import {AppButton} from '../../components/AppButton';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import {IconButton} from '../../components/IconButton';
import {ScreenHeader} from '../../components/ScreenHeader';
import {
  DELETE_LESSON_ERROR_MESSAGE,
  OPEN_LESSON_ERROR_MESSAGE,
} from '../../shared/copy/userMessages';
import {useFeatureEnabled} from '../../release';
import {
  listFlashcards,
  saveFlashcard,
  unsaveFlashcard,
} from '../../shared/db/FlashcardRepository';
import {deleteLesson, getLessonById} from '../../shared/db/LessonRepository';
import type {SavedLessonRecord} from '../../shared/db/types';
import type {VocabularyItem} from '../../shared/schemas/ai-output-v1';
import {useAppTheme} from '../../theme';
import {trackEvent} from '../analytics';
import {confirmFirstFlashcardSave} from './flashcardDisclosure';
import {LessonHubView} from './LessonHubView';

type HomeProps = NativeStackScreenProps<HomeStackParamList, 'SavedLessonDetail'>;
type LessonsProps = NativeStackScreenProps<
  LessonsStackParamList,
  'SavedLessonDetail'
>;
type Props = HomeProps | LessonsProps;

export function SavedLessonDetailScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const practiceEnabled = useFeatureEnabled('shortPractice');
  const reviewSystemEnabled = useFeatureEnabled('reviewSystem');
  const drilldownNav = navigation as HomeProps['navigation'];
  const [lesson, setLesson] = useState<SavedLessonRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [savedVocabularyIds, setSavedVocabularyIds] = useState<Set<string>>(
    () => new Set(),
  );

  const refreshSavedVocabulary = useCallback((lessonId: string) => {
    setSavedVocabularyIds(
      new Set(listFlashcards({lessonId}).map(card => card.vocabularyId)),
    );
  }, []);

  const loadLesson = useCallback(() => {
    setLoading(true);
    setErrorMessage(null);
    const record = getLessonById(route.params.lessonId);
    if (!record) {
      setLesson(null);
      setErrorMessage(OPEN_LESSON_ERROR_MESSAGE);
    } else {
      setLesson(record);
      refreshSavedVocabulary(record.id);
      const createdAt = new Date(record.createdAt).getTime();
      const daysSinceCreated = Math.max(
        0,
        Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24)),
      );
      trackEvent('lesson_reopened', {
        lesson_id: record.id,
        days_since_created: daysSinceCreated,
      });
    }
    setLoading(false);
  }, [refreshSavedVocabulary, route.params.lessonId]);

  useFocusEffect(
    useCallback(() => {
      loadLesson();
    }, [loadLesson]),
  );

  function handleDelete() {
    const activeFlashcards = listFlashcards({lessonId: route.params.lessonId});
    if (activeFlashcards.length > 0) {
      Alert.alert(
        'Không thể xóa bài học',
        'Bài học này đang có flashcard đang hoạt động. Hãy xem danh sách flashcard của bài học trước khi xóa.',
        [
          {text: 'Đóng', style: 'cancel'},
          {
            text: 'Xem flashcard',
            onPress: () =>
              drilldownNav.navigate('FlashcardList', {
                lessonId: route.params.lessonId,
              }),
          },
        ],
        {cancelable: false},
      );
      return;
    }

    const removed = deleteLesson(route.params.lessonId);
    if (!removed) {
      setDeleteError(DELETE_LESSON_ERROR_MESSAGE);
      return;
    }

    navigation.goBack();
  }

  async function handleToggleWordSave(word: VocabularyItem) {
    if (savedVocabularyIds.has(word.id)) {
      const existing = listFlashcards({
        lessonId: route.params.lessonId,
        includeUnsaved: true,
      }).find(card => card.vocabularyId === word.id);
      if (existing) {
        unsaveFlashcard(existing.id);
        refreshSavedVocabulary(route.params.lessonId);
      }
      return;
    }

    await confirmFirstFlashcardSave(() => {
      const result = saveFlashcard({
        lessonId: route.params.lessonId,
        vocabulary: word,
      });
      if (result.ok) {
        refreshSavedVocabulary(route.params.lessonId);
      }
    });
  }

  if (loading) {
    return (
      <AppScreen>
        <View style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </AppScreen>
    );
  }

  if (!lesson) {
    return (
      <AppScreen>
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            gap: theme.spacing.lg,
            justifyContent: 'center',
            padding: theme.spacing.xl,
          }}>
          <AppText color="danger">{errorMessage ?? OPEN_LESSON_ERROR_MESSAGE}</AppText>
          <AppButton title="Quay lại" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
      </AppScreen>
    );
  }

  const aiLesson = lesson.aiOutput;
  const practice = aiLesson.practice ?? [];
  const grammarPoints = aiLesson.grammar_points ?? [];
  const sentences = aiLesson.sentences ?? [];
  const vocabulary = aiLesson.vocabulary ?? [];

  function openFirstSentence() {
    if (sentences.length === 0) {
      return;
    }
    drilldownNav.navigate('SentenceDetail', {
      sentences,
      index: 0,
      practice,
    });
  }

  function openFirstWord() {
    const word = vocabulary[0];
    if (!word) {
      return;
    }
    drilldownNav.navigate('WordDetail', {
      word,
      practice,
      lessonId: route.params.lessonId,
    });
  }

  function openFirstGrammar() {
    const grammar = grammarPoints[0];
    if (!grammar) {
      return;
    }
    drilldownNav.navigate('GrammarDetail', {
      grammar,
      related: grammarPoints,
      practice,
    });
  }

  function openPractice() {
    if (practice.length === 0) {
      return;
    }
    drilldownNav.navigate('Practice', {questions: practice, title: aiLesson.title});
  }

  function handleStartLearning() {
    if (practice.length > 0) {
      openPractice();
      return;
    }
    openFirstSentence();
  }

  const drilldown = practiceEnabled
    ? {
        onOpenSentence: openFirstSentence,
        onOpenVocabulary: openFirstWord,
        onOpenGrammar: openFirstGrammar,
        onOpenPronunciation: openFirstSentence,
        onStartPractice: openPractice,
        onStartLearning: handleStartLearning,
      }
    : {
        onStartLearning: undefined,
      };

  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        title="Chi tiết bài học"
        rightAction={
          <IconButton
            accessibilityLabel="Xóa bài học"
            icon="delete"
            onPress={handleDelete}
            style={{backgroundColor: theme.colors.secondarySoft}}
            tone="danger"
          />
        }
      />
      {deleteError ? (
        <AppText color="danger" style={{padding: theme.spacing.lg, textAlign: 'center'}}>
          {deleteError}
        </AppText>
      ) : null}
      <View style={{flex: 1}}>
        <LessonHubView
          lesson={aiLesson}
          showSaveButton={false}
          savedVocabularyIds={savedVocabularyIds}
          onToggleWordSave={
            reviewSystemEnabled ? word => void handleToggleWordSave(word) : undefined
          }
          {...drilldown}
        />
      </View>
    </AppScreen>
  );
}
