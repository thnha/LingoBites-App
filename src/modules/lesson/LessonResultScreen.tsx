import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../app/navigation/types';
import {AppScreen} from '../../components/AppScreen';
import {IconButton} from '../../components/IconButton';
import {ScreenHeader} from '../../components/ScreenHeader';
import {useFeatureEnabled} from '../../release';
import {SAVE_LESSON_ERROR_MESSAGE} from '../../shared/copy/userMessages';
import {findLessonByInputHash, saveLesson} from '../../shared/db/LessonRepository';
import {computeLessonInputHash} from '../../shared/db/lessonInputHash';
import {useAppTheme} from '../../theme';
import {trackEvent} from '../analytics';
import {LessonHubView} from './LessonHubView';
import type {LessonSaveState} from './LessonResultView';

type Props = NativeStackScreenProps<HomeStackParamList, 'LessonResult'>;

export function LessonResultScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const {lesson, confirmedText, sourceType} = route.params;
  const practiceEnabled = useFeatureEnabled('shortPractice');
  const practice = lesson.practice ?? [];
  const grammarPoints = lesson.grammar_points ?? [];
  const sentences = lesson.sentences ?? [];
  const vocabulary = lesson.vocabulary ?? [];
  const [saveState, setSaveState] = useState<LessonSaveState>('unsaved');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | undefined>();
  const viewedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    trackEvent('result_viewed', {
      source_type: sourceType,
      sentence_count: sentences.length,
      vocabulary_count: vocabulary.length,
      grammar_count: grammarPoints.length,
    });
  }, [grammarPoints.length, lesson, sentences.length, sourceType, vocabulary.length]);

  useEffect(() => {
    const hash = computeLessonInputHash({
      confirmedText,
      level: lesson.level,
    });
    const existing = findLessonByInputHash(hash);
    if (existing) {
      setSaveState('saved');
    }
  }, [confirmedText, lesson.level]);

  async function handleSave() {
    if (saveState === 'saving' || saveState === 'saved') {
      return;
    }

    setSaveState('saving');
    setSaveErrorMessage(undefined);

    const result = await saveLesson({
      confirmedText,
      sourceType,
      ocrRawText: route.params.ocrRawText,
      lesson,
    });

    if (!result.ok) {
      setSaveState('error');
      setSaveErrorMessage(result.message ?? SAVE_LESSON_ERROR_MESSAGE);
      return;
    }

    setSaveState('saved');
    trackEvent('lesson_saved', {
      lesson_id: result.lessonId,
      source_type: sourceType,
      time_from_result_view_ms: Date.now() - viewedAtRef.current,
    });
  }

  function openFirstSentence() {
    const sentence = sentences[0];
    if (!sentence) {
      return;
    }
    navigation.navigate('SentenceDetail', {
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
    navigation.navigate('WordDetail', {word, practice});
  }

  function openFirstGrammar() {
    const grammar = grammarPoints[0];
    if (!grammar) {
      return;
    }
    navigation.navigate('GrammarDetail', {
      grammar,
      related: grammarPoints,
      practice,
    });
  }

  function openPractice() {
    if (practice.length === 0) {
      return;
    }
    navigation.navigate('Practice', {questions: practice, title: lesson.title});
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
        onBack={() => navigation.popToTop()}
        title="Chi tiết bài học"
        rightAction={
          <IconButton
            accessibilityLabel="Đóng"
            icon="close"
            onPress={() => navigation.popToTop()}
            tone="surface"
          />
        }
      />
      <View style={{flex: 1}}>
        <LessonHubView
          lesson={lesson}
          onSave={() => void handleSave()}
          saveErrorMessage={saveErrorMessage}
          saveState={saveState}
          {...drilldown}
        />
      </View>
    </AppScreen>
  );
}
