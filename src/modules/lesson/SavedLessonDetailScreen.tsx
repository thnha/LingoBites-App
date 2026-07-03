import React, {useCallback, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
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
import {deleteLesson, getLessonById} from '../../shared/db/LessonRepository';
import type {SavedLessonRecord} from '../../shared/db/types';
import {useAppTheme} from '../../theme';
import {trackEvent} from '../analytics';
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
  const drilldownNav = navigation as HomeProps['navigation'];
  const [lesson, setLesson] = useState<SavedLessonRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadLesson = useCallback(() => {
    setLoading(true);
    setErrorMessage(null);
    const record = getLessonById(route.params.lessonId);
    if (!record) {
      setLesson(null);
      setErrorMessage(OPEN_LESSON_ERROR_MESSAGE);
    } else {
      setLesson(record);
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
  }, [route.params.lessonId]);

  useFocusEffect(
    useCallback(() => {
      loadLesson();
    }, [loadLesson]),
  );

  function handleDelete() {
    const removed = deleteLesson(route.params.lessonId);
    if (!removed) {
      setDeleteError(DELETE_LESSON_ERROR_MESSAGE);
      return;
    }

    navigation.goBack();
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
    const sentence = sentences[0];
    if (!sentence) {
      return;
    }
    drilldownNav.navigate('SentenceDetail', {
      sentence,
      index: 0,
      total: sentences.length,
      practice,
    });
  }

  function openFirstWord() {
    const word = vocabulary[0];
    if (!word) {
      return;
    }
    drilldownNav.navigate('WordDetail', {word, practice});
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
          {...drilldown}
        />
      </View>
    </AppScreen>
  );
}
