import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {ErrorCard} from '@components/ErrorCard';
import {ScreenHeader} from '@components/ScreenHeader';
import {useAppTheme} from '@theme';
import {createLessonRuntimeSession} from './ContentLessonRuntime';
import {playContentAudio} from './contentAudioPlayer';
import {ActiveRecallCard} from './activities/ActiveRecallCard';
import {ContextCard} from './activities/ContextCard';
import {ExitCheckCard} from './activities/ExitCheckCard';
import {FeedbackCard} from './activities/FeedbackCard';
import {GuidedPracticeCard} from './activities/GuidedPracticeCard';
import {RolePlayCard} from './activities/RolePlayCard';
import {ShadowingCard} from './activities/ShadowingCard';
import type {FeedbackStepData} from './types';

type Props = {
  navigation: {goBack: () => void};
  route: {params: {lessonId: string}};
};

export function ContentLessonRuntimeScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const {lessonId} = route.params;
  const [session] = useState(() => createLessonRuntimeSession(lessonId));
  // Re-render on step advance / attempt recording — the session mutates in
  // place, so a simple render-tick counter is enough to reflect its state.
  const [, forceRerender] = useState(0);
  const [finished, setFinished] = useState<FeedbackStepData | null>(null);
  const [audioError, setAudioError] = useState<{
    assetId: string | null;
    message: string;
  } | null>(null);

  const step = session?.getCurrentStep() ?? null;

  function handlePlayAudio(assetId: string | null) {
    if (!session) {
      return;
    }
    const result = playContentAudio(assetId, session.data.audioAssets);
    setAudioError(result.ok ? null : {assetId, message: result.message});
  }

  function advance(state: 'completed' | 'skipped') {
    if (!session) {
      return;
    }
    session.recordAttempt(state);
    if (session.isFinished()) {
      const result = session.finish();
      setFinished({
        kind: 'feedback',
        newChunkCount: session.data.chunks.length,
        completedCount: result.completedStepCount,
        skippedCount: result.skippedStepCount,
        nextReviewHint:
          result.createdReviewItemCount > 0
            ? `${result.createdReviewItemCount} thẻ ôn tập mới sẽ xuất hiện vào ngày mai.`
            : 'Chưa có thẻ ôn tập mới cho lượt học này.',
      });
      return;
    }
    forceRerender(tick => tick + 1);
  }

  if (!session) {
    return (
      <AppScreen>
        <ScreenHeader onBack={() => navigation.goBack()} title="Bài học" />
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            padding: theme.spacing.xl,
          }}
        >
          <AppText color="danger">Không tìm thấy bài học.</AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        title={session.data.lesson.titleVi}
      />
      <ScrollView
        contentContainerStyle={{gap: theme.spacing.lg, padding: theme.gutter}}
      >
        {audioError ? (
          <ErrorCard
            message={audioError.message}
            onRetry={() => handlePlayAudio(audioError.assetId)}
            retryLabel="Thử lại"
          />
        ) : null}
        {finished ? (
          <FeedbackCard data={finished} onFinish={() => navigation.goBack()} />
        ) : step?.kind === 'context' ? (
          <ContextCard
            data={step.data}
            onComplete={() => advance('completed')}
            onPlayAudio={handlePlayAudio}
            onSkip={() => advance('skipped')}
          />
        ) : step?.kind === 'guided_practice' ? (
          <GuidedPracticeCard
            data={step.data}
            onComplete={() => advance('completed')}
            onSkip={() => advance('skipped')}
          />
        ) : step?.kind === 'shadowing' ? (
          <ShadowingCard
            data={step.data}
            onComplete={() => advance('completed')}
            onPlayAudio={handlePlayAudio}
            onSkip={() => advance('skipped')}
          />
        ) : step?.kind === 'active_recall' ? (
          <ActiveRecallCard
            data={step.data}
            onComplete={() => advance('completed')}
            onSkip={() => advance('skipped')}
          />
        ) : step?.kind === 'role_play' ? (
          <RolePlayCard
            data={step.data}
            onComplete={() => advance('completed')}
            onPlayAudio={handlePlayAudio}
            onSkip={() => advance('skipped')}
          />
        ) : step?.kind === 'exit_check' ? (
          <ExitCheckCard
            data={step.data}
            onComplete={() => advance('completed')}
            onSkip={() => advance('skipped')}
          />
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}
