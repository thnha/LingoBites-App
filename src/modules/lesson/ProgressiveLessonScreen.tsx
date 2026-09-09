import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {
  HomeStackParamList,
  LessonsStackParamList,
} from '@/app/navigation/types';
import {AppButton} from '@components/AppButton';
import {AppCard} from '@components/AppCard';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {Banner} from '@components/Banner';
import {IconButton} from '@components/IconButton';
import {ScreenHeader} from '@components/ScreenHeader';
import {isEnUsVoiceAvailable, speak, stop} from '@modules/audio';
import {
  resumeLessonV2,
  retryLessonV2Chunk,
  retryLessonV2Unit,
} from '@shared/api/lessonV2Client';
import {
  getLessonV2ById,
  upsertLessonV2,
  isLessonV2Saved,
  setLessonV2Saved,
} from '@shared/db/LessonV2Repository';
import type {
  ChunkV2,
  LessonV2,
  SentenceV2,
  UnitState,
  VocabularyV2,
} from '@shared/schemas/lesson-v2';
import {useAppTheme, type AppTheme} from '@theme';

type HomeProps = NativeStackScreenProps<
  HomeStackParamList,
  'ProgressiveLesson'
>;
type LessonsProps = NativeStackScreenProps<
  LessonsStackParamList,
  'ProgressiveLesson'
>;
export type ProgressiveLessonScreenProps = HomeProps | LessonsProps;

type UnitKey = keyof LessonV2['units'];

const UNIT_KEYS: UnitKey[] = ['vocabulary', 'grammar', 'ipa_resolve', 'practice'];

const UNIT_LABELS: Record<UnitKey, string> = {
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  ipa_resolve: 'Phiên âm IPA',
  practice: 'Luyện tập',
};

const SENTENCE_STATUS_LABEL: Record<SentenceV2['status'], string> = {
  pending: 'Chờ',
  processing: 'Đang tạo',
  ready: 'Xong',
  failed: 'Lỗi',
};

const LESSON_STATUS_LABEL: Record<LessonV2['status'], string> = {
  skeleton_ready: 'Đang tạo',
  partially_ready: 'Đang tạo',
  ready: 'Xong',
  ready_with_warnings: 'Xong',
  failed: 'Lỗi',
};

const UNIT_STATUS_LABEL: Record<UnitState['status'], string> = {
  pending: 'Chờ',
  processing: 'Đang tạo',
  ready: 'Xong',
  failed: 'Lỗi',
  skipped: 'Bỏ qua',
};

function isTerminalLesson(lesson: LessonV2): boolean {
  return (
    lesson.status === 'ready' ||
    lesson.status === 'ready_with_warnings' ||
    lesson.status === 'failed'
  );
}

function failedRetryableChunks(lesson: LessonV2): ChunkV2[] {
  return lesson.chunks.filter(
    chunk => chunk.status === 'failed' && chunk.retryable,
  );
}

function failedRetryableUnits(lesson: LessonV2): UnitKey[] {
  return UNIT_KEYS.filter(key => {
    const unit = lesson.units[key];
    return unit.status === 'failed' && unit.retryable;
  });
}

/** Runs an async side effect without returning its promise to the caller. */
function fireAndForget(task: Promise<unknown>): void {
  task.catch(() => undefined);
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    content: {
      gap: theme.spacing.lg,
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    section: {
      gap: theme.spacing.md,
    },
    sectionTitle: {
      marginBottom: theme.spacing.xs,
    },
    sentenceCard: {
      gap: theme.spacing.sm,
    },
    sentenceRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    sentenceBody: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
    },
    skeletonBox: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: theme.radius.md,
      height: 16,
    },
    vocabRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    vocabBody: {
      flex: 1,
      gap: 2,
    },
    ipa: {
      fontStyle: 'italic',
    },
    retryRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    centered: {
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.lg,
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    warningBox: {
      gap: theme.spacing.xs,
    },
    skeletonColumn: {
      gap: theme.spacing.sm,
      width: '100%',
    },
    skeletonNarrow: {
      width: '60%',
    },
    skeletonGap: {
      gap: 6,
    },
    flexBody: {
      flex: 1,
    },
  });
}

export function ProgressiveLessonScreen({
  navigation,
  route,
}: ProgressiveLessonScreenProps) {
  const {theme} = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {lessonId, initialLesson} = route.params;

  const [lesson, setLesson] = useState<LessonV2 | null>(initialLesson ?? null);
  const [loading, setLoading] = useState(initialLesson ? false : true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [ttsMessage, setTtsMessage] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [voiceChecked, setVoiceChecked] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [retryingChunkId, setRetryingChunkId] = useState<string | null>(null);
  const [retryingUnit, setRetryingUnit] = useState<UnitKey | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      fireAndForget(stop());
    };
  }, []);

  useEffect(() => {
    setIsSaved(isLessonV2Saved(lessonId));
  }, [lessonId]);

  useEffect(() => {
    let cancelled = false;
    fireAndForget(
      isEnUsVoiceAvailable().then(result => {
        if (cancelled || !mountedRef.current) {
          return;
        }
        setVoiceChecked(true);
        setVoiceAvailable(result.ok && result.available);
      }),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const startResume = useCallback(
    async (baseLesson: LessonV2 | null) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      if (mountedRef.current) {
        setIsPolling(true);
        setIsOffline(false);
      }
      try {
        const result = await resumeLessonV2(lessonId, {
          initialLesson: baseLesson ?? undefined,
          onLesson: next => {
            if (mountedRef.current && !controller.signal.aborted) {
              setLesson(next);
            }
          },
          signal: controller.signal,
        });
        if (!mountedRef.current || controller.signal.aborted) {
          return;
        }
        if (result.ok) {
          setLesson(result.lesson);
          setIsOffline(false);
        } else if (
          result.errorCode === 'POLLING_STOPPED' ||
          result.errorCode === 'NETWORK_ERROR'
        ) {
          if (result.lesson) {
            setLesson(result.lesson);
          }
          setIsOffline(true);
        } else {
          setActionMessage(result.message);
        }
      } catch {
        if (mountedRef.current && !controller.signal.aborted) {
          setIsOffline(true);
        }
      } finally {
        if (mountedRef.current && abortRef.current === controller) {
          setIsPolling(false);
        }
      }
    },
    [lessonId],
  );

  useEffect(() => {
    if (initialLesson) {
      upsertLessonV2(initialLesson);
      setLesson(initialLesson);
      setLoading(false);
      if (!isTerminalLesson(initialLesson)) {
        fireAndForget(startResume(initialLesson));
      }
      return;
    }
    const local = getLessonV2ById(lessonId);
    if (local) {
      setLesson(local);
      setLoading(false);
      if (!isTerminalLesson(local)) {
        fireAndForget(startResume(local));
      }
      return;
    }
    setLoading(false);
    setLoadError('Không mở được bài học. Vui lòng thử lại.');
    fireAndForget(startResume(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const ttsDisabled = !voiceChecked || !voiceAvailable;

  async function handleSpeak(id: string, text: string, locale: string) {
    setTtsMessage(null);
    setSpeakingId(id);
    const result = await speak(text, locale);
    if (mountedRef.current) {
      setSpeakingId(null);
      if (!result.ok) {
        setTtsMessage(result.message);
      }
    }
  }

  function handleSpeakSentence(sentence: SentenceV2) {
    fireAndForget(
      handleSpeak(
        `sentence-${sentence.id}`,
        sentence.tts.text,
        sentence.tts.locale,
      ),
    );
  }

  function handleSpeakVocabulary(vocabulary: VocabularyV2) {
    fireAndForget(
      handleSpeak(
        `vocab-${vocabulary.id}`,
        vocabulary.tts.text,
        vocabulary.tts.locale,
      ),
    );
  }

  async function handleRetryChunk(chunkId: string) {
    setActionMessage(null);
    setRetryingChunkId(chunkId);
    const result = await retryLessonV2Chunk(lessonId, chunkId);
    if (!mountedRef.current) {
      return;
    }
    setRetryingChunkId(null);
    if (result.ok) {
      setLesson(result.lesson);
      setIsOffline(false);
      fireAndForget(startResume(result.lesson));
    } else {
      setActionMessage(result.message);
    }
  }

  async function handleRetryUnit(unitKey: UnitKey) {
    setActionMessage(null);
    setRetryingUnit(unitKey);
    const result = await retryLessonV2Unit(lessonId, unitKey);
    if (!mountedRef.current) {
      return;
    }
    setRetryingUnit(null);
    if (result.ok) {
      setLesson(result.lesson);
      setIsOffline(false);
      fireAndForget(startResume(result.lesson));
    } else {
      setActionMessage(result.message);
    }
  }

  function handleRefresh() {
    setActionMessage(null);
    const local = getLessonV2ById(lessonId);
    if (local) {
      setLesson(local);
      fireAndForget(startResume(local));
      return;
    }
    fireAndForget(startResume(lesson));
  }

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <View style={styles.skeletonColumn} testID="lesson-skeleton">
            <View style={styles.skeletonBox} />
            <View style={styles.skeletonBox} />
            <View style={[styles.skeletonBox, styles.skeletonNarrow]} />
          </View>
          <AppText color="secondary">Đang mở bài học…</AppText>
        </View>
      </AppScreen>
    );
  }

  if (!lesson) {
    return (
      <AppScreen>
        <ScreenHeader onBack={() => navigation.goBack()} title="Bài học" />
        <View style={styles.centered}>
          <AppText color="danger">
            {loadError ?? 'Không mở được bài học.'}
          </AppText>
          {isOffline ? (
            <View testID="offline-banner" accessibilityRole="alert">
              <Banner message="Bạn đang ngoại tuyến. Kết nối lại để tiếp tục tải bài học." />
            </View>
          ) : null}
          <AppButton
            title="Thử lại"
            variant="secondary"
            onPress={handleRefresh}
            testID="lesson-refresh"
          />
        </View>
      </AppScreen>
    );
  }

  const failedChunks = failedRetryableChunks(lesson);
  const failedUnits = failedRetryableUnits(lesson);
  const readyCount = lesson.sentences.filter(s => s.status === 'ready').length;

  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        title={lesson.title ?? (isTerminalLesson(lesson) ? 'Bài học' : 'Bài học đang tạo…')}
        rightAction={
          isPolling ? (
            <ActivityIndicator
              color={theme.colors.primary}
              testID="lesson-polling-indicator"
            />
          ) : undefined
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText color="secondary" variant="caption" style={{textAlign: 'center'}} testID="lesson-progress-header">
          Câu ({LESSON_STATUS_LABEL[lesson.status]}) · Từ vựng ({UNIT_STATUS_LABEL[lesson.units.vocabulary.status]}) · Ngữ pháp ({UNIT_STATUS_LABEL[lesson.units.grammar.status]}) · Bài tập ({UNIT_STATUS_LABEL[lesson.units.practice.status]})
        </AppText>
        {isOffline ? (
          <View testID="offline-banner" accessibilityRole="alert">
            <Banner message="Bạn đang ngoại tuyến. Bài học đã lưu vẫn đọc được; kết nối lại để tiếp tục cập nhật." />
          </View>
        ) : null}
        {lesson.status === 'skeleton_ready' ? (
          <Banner
            message={`Đã tách ${lesson.sentences.length} câu. Nghĩa từng câu đang được tạo dần…`}
          />
        ) : null}
        {lesson.status === 'partially_ready' ? (
          <Banner
            message={`Đã xong ${readyCount}/${lesson.sentences.length} câu. Bài học tiếp tục cập nhật mà không cần mở lại.`}
          />
        ) : null}
        {lesson.status === 'ready_with_warnings' ? (
          <AppCard>
            <View style={styles.warningBox} testID="lesson-warnings">
              <AppText variant="h3">Bài học xong kèm lưu ý</AppText>
              {lesson.warnings.length === 0 ? (
                <AppText color="secondary">
                  Một vài phần chưa hoàn chỉnh nhưng nội dung đã có vẫn đọc được đầy đủ.
                </AppText>
              ) : (
                lesson.warnings.map((warning, index) => (
                  <AppText
                    key={`${warning.code}-${index}`}
                    color="secondary"
                    testID={`lesson-warning-${index}`}>
                    {warning.message_vi}
                  </AppText>
                ))
              )}
            </View>
          </AppCard>
        ) : null}
        {lesson.status === 'failed' ? (
          <AppCard>
            <View style={styles.warningBox}>
              <AppText color="danger">
                {lesson.error?.message ?? 'Tạo bài học thất bại.'}
              </AppText>
              <AppText color="secondary">
                Các câu đã tách vẫn hiển thị. Hãy thử lại từng phần lỗi bên dưới.
              </AppText>
            </View>
          </AppCard>
        ) : null}
        {actionMessage ? (
          <AppText color="danger" testID="lesson-action-error">
            {actionMessage}
          </AppText>
        ) : null}

        {voiceChecked && !voiceAvailable ? (
          <AppText color="secondary" testID="tts-unavailable-hint" style={{marginBottom: theme.spacing.sm}}>
            Thiết bị chưa cài giọng en-US nên các nút phát âm đang tắt. Phần còn lại của bài học vẫn dùng bình thường.
          </AppText>
        ) : null}

        <View style={styles.section}>
          <AppText variant="h2" style={styles.sectionTitle}>
            Câu ({readyCount}/{lesson.sentences.length})
          </AppText>
          {lesson.sentences.length === 0 ? (
            <View style={{gap: theme.spacing.sm}} testID="lesson-skeleton">
              <View style={styles.skeletonBox} />
              <View style={styles.skeletonBox} />
            </View>
          ) : null}
          {lesson.sentences.map(sentence => {
            const isSpeaking = speakingId === `sentence-${sentence.id}`;
            return (
              <AppCard key={sentence.id}>
                <View
                  style={styles.sentenceCard}
                  testID={`sentence-card-${sentence.id}`}>
                  <View style={styles.sentenceRow}>
                    <View style={styles.sentenceBody}>
                      <AppText variant="h3">{sentence.text}</AppText>
                      <View style={styles.statusBadge}>
                        <AppText
                          variant="caption"
                          color={
                            sentence.status === 'failed'
                              ? 'danger'
                              : 'secondary'
                          }
                          testID={`sentence-status-${sentence.id}`}>
                          {SENTENCE_STATUS_LABEL[sentence.status]}
                        </AppText>
                      </View>
                      {sentence.status === 'ready' ? (
                        <>
                          {sentence.translation ? (
                            <AppText>{sentence.translation}</AppText>
                          ) : null}
                          {sentence.simple_meaning && sentence.simple_meaning.trim() !== sentence.translation?.trim() ? (
                            <AppText color="secondary">
                              {sentence.simple_meaning}
                            </AppText>
                          ) : null}
                          {sentence.phrases.map(phrase => (
                            <AppText
                              key={`${sentence.id}-${phrase.text}`}
                              color="secondary"
                              variant="caption">
                              {phrase.text} — {phrase.meaning_vi}
                            </AppText>
                          ))}
                        </>
                      ) : (
                        <View
                          style={styles.skeletonGap}
                          testID={`sentence-skeleton-${sentence.id}`}>
                          <View style={styles.skeletonBox} />
                        </View>
                      )}
                      {sentence.status === 'failed' ? (
                        <AppText color="danger" variant="caption">
                          Phần này chưa tạo xong. Hãy thử lại chunk chứa câu này.
                        </AppText>
                      ) : null}
                    </View>
                    <IconButton
                      accessibilityLabel={`Phát âm câu ${sentence.index + 1}`}
                      icon="play_circle"
                      onPress={() => handleSpeakSentence(sentence)}
                      disabled={ttsDisabled}
                      testID={`sentence-tts-${sentence.id}`}
                    />
                  </View>
                  {isSpeaking ? (
                    <AppText color="secondary" variant="caption">
                      Đang phát…
                    </AppText>
                  ) : null}
                </View>
              </AppCard>
            );
          })}
        </View>

        {failedChunks.length > 0 ? (
          <View style={styles.section}>
            <AppText variant="h2" style={styles.sectionTitle}>
              Phần cần thử lại
            </AppText>
            {failedChunks.map(chunk => (
              <AppCard key={chunk.id}>
                <View style={styles.retryRow}>
                  <View style={styles.flexBody}>
                    <AppText variant="label">
                      Chunk {chunk.index + 1} ({chunk.sentence_ids.length} câu)
                    </AppText>
                    {chunk.error_code ? (
                      <AppText color="secondary" variant="caption">
                        Lỗi: {chunk.error_code}
                      </AppText>
                    ) : null}
                  </View>
                  <AppButton
                    title="Thử lại phần này"
                    variant="secondary"
                    loading={retryingChunkId === chunk.id}
                    onPress={() => fireAndForget(handleRetryChunk(chunk.id))}
                    testID={`chunk-retry-${chunk.id}`}
                  />
                </View>
              </AppCard>
            ))}
          </View>
        ) : null}

        {failedUnits.length > 0 ? (
          <View style={styles.section}>
            <AppText variant="h2" style={styles.sectionTitle}>
              Nội dung bổ sung lỗi
            </AppText>
            {failedUnits.map(unitKey => (
              <AppCard key={unitKey}>
                <View style={styles.retryRow}>
                  <View style={styles.flexBody}>
                    <AppText variant="label">{UNIT_LABELS[unitKey]}</AppText>
                    <AppText color="secondary" variant="caption">
                      {lesson.units[unitKey].error_code
                        ? `Lỗi: ${lesson.units[unitKey].error_code}`
                        : 'Chưa tải được phần này.'}
                    </AppText>
                  </View>
                  <AppButton
                    title="Thử lại"
                    variant="secondary"
                    loading={retryingUnit === unitKey}
                    onPress={() => fireAndForget(handleRetryUnit(unitKey))}
                    testID={`unit-retry-${unitKey}`}
                  />
                </View>
              </AppCard>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <AppText variant="h2" style={styles.sectionTitle}>
            Từ vựng ({lesson.vocabulary.length})
          </AppText>
          {lesson.vocabulary.length === 0 ? (
            <AppText color="secondary">
              {lesson.units.vocabulary.status === 'ready'
                ? 'Bài này không có từ vựng riêng.'
                : 'Từ vựng đang được trích dần…'}
            </AppText>
          ) : null}
          {lesson.vocabulary.map(vocabulary => (
            <AppCard key={vocabulary.id}>
              <View
                style={styles.vocabRow}
                testID={`vocab-card-${vocabulary.id}`}>
                <View style={styles.vocabBody}>
                  <AppText variant="h3">{vocabulary.word}</AppText>
                  {vocabulary.ipa ? (
                    <AppText
                      color="secondary"
                      style={styles.ipa}
                      testID={`vocab-ipa-${vocabulary.id}`}>
                      /{vocabulary.ipa}/
                    </AppText>
                  ) : null}
                  <AppText color="secondary">{vocabulary.meaning_vi}</AppText>
                  {vocabulary.example && vocabulary.example.trim() !== lesson.sentences.find(s => s.id === vocabulary.source_sentence_id)?.text.trim() ? (
                    <AppText color="secondary" variant="caption">
                      {vocabulary.example}
                      {vocabulary.example_translation
                        ? ` — ${vocabulary.example_translation}`
                        : ''}
                    </AppText>
                  ) : null}
                </View>
                <IconButton
                  accessibilityLabel={`Phát âm từ ${vocabulary.word}`}
                  icon="play_circle"
                  onPress={() => handleSpeakVocabulary(vocabulary)}
                  disabled={ttsDisabled}
                  testID={`vocab-tts-${vocabulary.id}`}
                />
              </View>
            </AppCard>
          ))}
        </View>

        <View style={styles.section}>
          <AppText variant="h2" style={styles.sectionTitle}>
            Ngữ pháp ({lesson.grammar.length})
          </AppText>
          {lesson.grammar.length === 0 ? (
            <AppText color="secondary">
              {lesson.units.grammar.status === 'ready'
                ? 'Bài này không có điểm ngữ pháp riêng.'
                : 'Ngữ pháp đang được trích dần…'}
            </AppText>
          ) : null}
          {lesson.grammar.map(grammar => (
            <AppCard key={grammar.id}>
              <View testID={`grammar-card-${grammar.id}`}>
                <AppText variant="h3">{grammar.name}</AppText>
                {grammar.name_vi && !grammar.name.toLowerCase().includes(grammar.name_vi.toLowerCase()) ? (
                  <AppText color="secondary">{grammar.name_vi}</AppText>
                ) : null}
                <AppText>{grammar.explanation_vi}</AppText>
                {grammar.beginner_tip ? (
                  <AppText color="secondary" variant="caption">
                    {grammar.beginner_tip}
                  </AppText>
                ) : null}
              </View>
            </AppCard>
          ))}
        </View>

        <View style={styles.section}>
          <AppText variant="h2" style={styles.sectionTitle}>
            Bài tập ({lesson.practice.length})
          </AppText>
          {lesson.units.practice.status === 'pending' || lesson.units.practice.status === 'processing' ? (
            <View style={styles.skeletonColumn} testID="practice-skeleton">
              <View style={styles.skeletonBox} />
              <View style={styles.skeletonBox} />
              <View style={[styles.skeletonBox, styles.skeletonNarrow]} />
            </View>
          ) : null}
          {lesson.units.practice.status === 'ready' && lesson.practice.length === 0 ? (
            <AppText color="secondary" testID="practice-empty">
              Bài này không có bài tập riêng.
            </AppText>
          ) : null}
          {lesson.practice.map(practice => (
            <AppCard key={practice.id}>
              <View testID={`practice-card-${practice.id}`}>
                <AppText variant="h3">{practice.question}</AppText>
                {practice.type === 'multiple_choice' && practice.options ? (
                  <View style={{gap: theme.spacing.xs, marginTop: theme.spacing.xs}}>
                    {practice.options.map((opt, i) => (
                      <AppText key={i} color="secondary">• {opt}</AppText>
                    ))}
                  </View>
                ) : null}
                <AppText color="secondary" style={{marginTop: theme.spacing.xs}}>
                  Đáp án: {practice.answer}
                </AppText>
                {practice.explanation_vi ? (
                  <AppText color="secondary" variant="caption">
                    Giải thích: {practice.explanation_vi}
                  </AppText>
                ) : null}
              </View>
            </AppCard>
          ))}
        </View>

        {ttsMessage ? (
          <AppText color="danger" testID="tts-error">
            {ttsMessage}
          </AppText>
        ) : null}
        {lesson.status === 'ready' || lesson.status === 'ready_with_warnings' ? (
          <View style={{gap: theme.spacing.md}}>
            <Banner message="Bài học đã hoàn tất!" />
            {saveError ? (
              <AppText color="danger" testID="lesson-save-error">
                {saveError}
              </AppText>
            ) : null}
            {!isSaved ? (
              <AppButton
                title="Lưu vào Thư viện"
                loading={saving}
                onPress={() => {
                  setSaveError(null);
                  setSaving(true);
                  setTimeout(() => {
                    const success = setLessonV2Saved(lesson.lesson_id, true);
                    if (success) {
                      setIsSaved(true);
                    } else {
                      setSaveError('Lưu bài học thất bại. Vui lòng thử lại.');
                    }
                    setSaving(false);
                  }, 0);
                }}
                testID="lesson-save-button"
              />
            ) : (
              <View style={{gap: theme.spacing.md}}>
                <AppButton
                  title="Về Thư viện"
                  onPress={() => (navigation as any).navigate('Lessons')}
                  testID="lesson-ready-cta"
                />
                <AppButton
                  title="Bỏ lưu"
                  variant="secondary"
                  loading={saving}
                  onPress={() => {
                    setSaveError(null);
                    setSaving(true);
                    setTimeout(() => {
                      const success = setLessonV2Saved(lesson.lesson_id, false);
                      if (success) {
                        setIsSaved(false);
                      } else {
                        setSaveError('Bỏ lưu thất bại. Vui lòng thử lại.');
                      }
                      setSaving(false);
                    }, 0);
                  }}
                  testID="lesson-unsave-button"
                />
              </View>
            )}
          </View>
        ) : (isOffline || !isTerminalLesson(lesson) ? (
          <AppButton
            title={isPolling ? 'Đang cập nhật…' : 'Tải lại bài học'}
            variant="secondary"
            disabled={isPolling}
            onPress={handleRefresh}
            testID="lesson-refresh"
          />
        ) : null)}
      </ScrollView>
    </AppScreen>
  );
}
