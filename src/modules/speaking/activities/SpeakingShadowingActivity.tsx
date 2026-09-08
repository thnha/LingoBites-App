import React, {useMemo, useState} from 'react';
import {Alert, Pressable, ScrollView, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {LessonsStackParamList} from '@/app/navigation/types';
import {AppCard} from '@components/AppCard';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {IconButton} from '@components/IconButton';
import {ScreenHeader} from '@components/ScreenHeader';
import {useAppTheme} from '@theme';
import {useContentLibrary} from '@modules/content';
import {playContentAudio} from '@modules/content/runtime/contentAudioPlayer';
import {captureSpeakingErrorIfNeeded} from '../errorNotebookService';
import {
  playRecording,
  startRecording,
  stopRecording,
} from '../recordingService';
import {getShadowingContent} from '../speakingModes';
import {useSpeakingRepository} from '../useSpeakingRepository';

type Props = NativeStackScreenProps<LessonsStackParamList, 'SpeakingShadowing'>;

type RecordingPhase = 'idle' | 'recording' | 'recorded';

/**
 * Speaking Room shadowing mode: play reference audio, record, play back the
 * recording, self-check (REQ-21/22, VC-7). No numeric accent/pronunciation
 * score anywhere in this screen's copy — feedback is limited to the
 * checklist below, matching the acceptance criteria.
 */
export function SpeakingShadowingActivity({navigation}: Props) {
  const {theme} = useAppTheme();
  const {getLessonAudioAssets} = useContentLibrary();
  const {insertSpeakingRecording} = useSpeakingRepository();
  const content = useMemo(() => getShadowingContent(), []);
  const lesson = content[0] ?? null;
  const line = lesson?.lines[0] ?? null;
  const audioAssets = useMemo(
    () => (lesson ? getLessonAudioAssets(lesson.lessonId) : new Map()),
    [getLessonAudioAssets, lesson],
  );

  const [phase, setPhase] = useState<RecordingPhase>('idle');
  const [filePath, setFilePath] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [startedAtMs, setStartedAtMs] = useState(0);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [keyPhraseUsed, setKeyPhraseUsed] = useState(false);
  const [respondedQuickly, setRespondedQuickly] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handlePlayReference() {
    const result = playContentAudio(line?.audioAssetId ?? null, audioAssets);
    if (!result.ok) {
      Alert.alert('Âm thanh mẫu', result.message);
    }
  }

  async function handleToggleRecording() {
    if (phase === 'idle') {
      const start = await startRecording('shadowing', `shadow-${Date.now()}`);
      if (!start.ok) {
        Alert.alert('Ghi âm', start.message);
        return;
      }
      setFilePath(start.filePath);
      setStartedAtMs(Date.now());
      setPhase('recording');
      return;
    }
    if (phase === 'recording' && filePath) {
      const stop = await stopRecording(filePath, startedAtMs);
      if (!stop.ok) {
        Alert.alert('Ghi âm', stop.message);
        return;
      }
      setFilePath(stop.filePath);
      setDurationMs(stop.durationMs);
      setPhase('recorded');
    }
  }

  async function handlePlayMyRecording() {
    if (!filePath) {
      return;
    }
    const result = await playRecording(filePath);
    if (!result.ok) {
      Alert.alert('Nghe lại', result.message);
    }
  }

  function handleFinishSelfCheck() {
    if (!filePath || !lesson) {
      return;
    }
    const recordingId = `shadow-rec-${Date.now()}`;
    insertSpeakingRecording({
      id: recordingId,
      lessonId: lesson.lessonId,
      mode: 'shadowing',
      filePath,
      durationMs,
    });
    captureSpeakingErrorIfNeeded({
      id: `${recordingId}-check`,
      source: 'speaking_room',
      lessonId: lesson.lessonId,
      outcome: {
        taskCompleted,
        keyPhraseUsed,
        responseTimeMs: respondedQuickly ? 0 : durationMs,
      },
    });
    setSubmitted(true);
  }

  if (!lesson || !line) {
    return (
      <AppScreen>
        <ScreenHeader
          title="Lặp lại theo mẫu"
          onBack={() => navigation.goBack()}
        />
        <View style={{padding: theme.gutter}}>
          <AppText color="secondary">
            Chưa có nội dung lặp lại theo mẫu nào được cài đặt.
          </AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader
        title="Lặp lại theo mẫu"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.lg,
          paddingBottom: 28,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        showsVerticalScrollIndicator={false}
      >
        <AppCard style={{gap: theme.spacing.sm}}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: theme.spacing.sm,
            }}
          >
            <AppText variant="h3">{line.textEn}</AppText>
            <IconButton
              accessibilityLabel="Nghe câu mẫu"
              icon="volume_up"
              onPress={handlePlayReference}
              tone="ghost"
            />
          </View>
          <AppText color="secondary">{line.textVi}</AppText>
        </AppCard>

        <AppCard style={{alignItems: 'center', gap: theme.spacing.sm}}>
          <IconButton
            accessibilityLabel={
              phase === 'recording' ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'
            }
            icon={phase === 'recording' ? 'circle' : 'mic'}
            onPress={handleToggleRecording}
            size={64}
            tone={phase === 'recording' ? 'danger' : 'accent'}
          />
          <AppText color="secondary" testID="recording-phase-label">
            {phase === 'idle' && 'Bấm để bắt đầu ghi âm'}
            {phase === 'recording' && 'Đang ghi âm — bấm để dừng'}
            {phase === 'recorded' && 'Đã ghi âm xong'}
          </AppText>
          {phase === 'recorded' ? (
            <IconButton
              accessibilityLabel="Nghe lại bản ghi âm của tôi"
              icon="play_circle"
              onPress={handlePlayMyRecording}
              tone="surface"
            />
          ) : null}
        </AppCard>

        {phase === 'recorded' && !submitted ? (
          <AppCard style={{gap: theme.spacing.sm}}>
            <AppText variant="h3">Tự kiểm tra</AppText>
            <ChecklistRow
              checked={taskCompleted}
              label="Tôi đã hoàn thành nhiệm vụ nói"
              onToggle={() => setTaskCompleted(v => !v)}
            />
            <ChecklistRow
              checked={keyPhraseUsed}
              label="Tôi đã dùng đúng cụm từ khóa"
              onToggle={() => setKeyPhraseUsed(v => !v)}
            />
            <ChecklistRow
              checked={respondedQuickly}
              label="Tôi trả lời nhanh, không ngập ngừng"
              onToggle={() => setRespondedQuickly(v => !v)}
            />
            <Pressable
              accessibilityLabel="Hoàn thành tự kiểm tra"
              accessibilityRole="button"
              onPress={handleFinishSelfCheck}
              style={({pressed}) => ({
                alignItems: 'center',
                backgroundColor: theme.colors.accent,
                borderRadius: theme.radius.lg,
                marginTop: theme.spacing.sm,
                minHeight: 48,
                justifyContent: 'center',
                opacity: pressed ? theme.states.pressedOpacity : 1,
              })}
            >
              <AppText
                style={{color: theme.colors.accentInk, fontWeight: '700'}}
              >
                Hoàn thành
              </AppText>
            </Pressable>
          </AppCard>
        ) : null}

        {submitted ? (
          <AppText color="secondary" testID="shadowing-submitted">
            Đã lưu bản ghi âm và kết quả tự kiểm tra.
          </AppText>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

function ChecklistRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const {theme} = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{checked}}
      onPress={onToggle}
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: theme.spacing.sm,
      }}
    >
      <IconButton
        accessibilityLabel={label}
        icon="check_circle"
        onPress={onToggle}
        tone={checked ? 'accent' : 'ghost'}
      />
      <AppText>{label}</AppText>
    </Pressable>
  );
}
