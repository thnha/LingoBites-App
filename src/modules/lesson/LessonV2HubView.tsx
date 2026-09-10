import React, {useMemo} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {AppButton} from '@components/AppButton';
import {AppCard} from '@components/AppCard';
import {AppText} from '@components/AppText';
import {Banner} from '@components/Banner';
import {BottomActionBar} from '@components/BottomActionBar';
import {Chip} from '@components/Chip';
import {ImagePlaceholder} from '@components/ImagePlaceholder';
import {LessonExploreRow} from '@components/LessonExploreRow';
import {MaterialIcon} from '@components/MaterialIcon';
import {SectionHeader} from '@components/SectionHeader';
import type {
  ChunkV2,
  LessonV2,
  SentenceV2,
} from '@shared/schemas/lesson-v2';
import {useAppTheme, type AppTheme} from '@theme';

export type LessonV2UnitKey = keyof LessonV2['units'];

type Props = {
  lesson: LessonV2;
  practiceEligible: boolean;
  isOffline: boolean;
  /** Compact status line for skeleton/partial/failed lessons (single banner). */
  statusMessage?: string | null;
  warningMessages?: string[];
  actionMessage?: string | null;
  saveErrorMessage?: string | null;
  failedChunks: ChunkV2[];
  failedUnits: LessonV2UnitKey[];
  retryingChunkId: string | null;
  retryingUnit: LessonV2UnitKey | null;
  onRetryChunk: (chunkId: string) => void;
  onRetryUnit: (unitKey: LessonV2UnitKey) => void;
  onOpenSentences: () => void;
  onOpenVocabulary: () => void;
  onOpenGrammar: () => void;
  onOpenPronunciation: () => void;
  onOpenPractice: () => void;
  onStartLearning: () => void;
};

const PREVIEW_COUNT = 3;

const UNIT_LABELS: Record<LessonV2UnitKey, string> = {
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  ipa_resolve: 'Phiên âm IPA',
  practice: 'Luyện tập',
};

export function getReadySentences(lesson: LessonV2): SentenceV2[] {
  return [...lesson.sentences]
    .sort((a, b) => a.index - b.index)
    .filter(sentence => sentence.status === 'ready');
}

function makeSubtitleForUnit(
  lesson: LessonV2,
  key: 'vocabulary' | 'grammar',
  count: number,
  countNoun: string,
  emptyMessage: string,
): {subtitle: string; disabled: boolean; creating: boolean; failed: boolean} {
  const unit = lesson.units[key];
  if (unit.status === 'pending' || unit.status === 'processing') {
    return {subtitle: 'Đang tạo…', disabled: true, creating: true, failed: false};
  }
  if (unit.status === 'failed') {
    return {
      subtitle: 'Tải lỗi — thử lại bên dưới',
      disabled: true,
      creating: false,
      failed: true,
    };
  }
  if (unit.status === 'skipped' || count === 0) {
    return {subtitle: emptyMessage, disabled: true, creating: false, failed: false};
  }
  return {
    subtitle: `${count} ${countNoun}`,
    disabled: false,
    creating: false,
    failed: false,
  };
}

export function LessonV2HubView({
  lesson,
  practiceEligible,
  isOffline,
  statusMessage,
  warningMessages = [],
  actionMessage,
  saveErrorMessage,
  failedChunks,
  failedUnits,
  retryingChunkId,
  retryingUnit,
  onRetryChunk,
  onRetryUnit,
  onOpenSentences,
  onOpenVocabulary,
  onOpenGrammar,
  onOpenPronunciation,
  onOpenPractice,
  onStartLearning,
}: Props) {
  const {theme} = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const totalSentences = lesson.sentences.length;
  const preview = useMemo(
    () => getReadySentences(lesson).slice(0, PREVIEW_COUNT),
    [lesson],
  );
  const readyCount = useMemo(
    () => lesson.sentences.filter(s => s.status === 'ready').length,
    [lesson],
  );
  const translationPreview = useMemo(
    () =>
      preview.filter(
        sentence =>
          typeof sentence.translation === 'string' &&
          sentence.translation.trim().length > 0,
      ),
    [preview],
  );
  const hasMoreSentences = totalSentences > preview.length;

  const sentencesState = useMemo(() => {
    if (failedChunks.length > 0 || lesson.status === 'failed') {
      return {
        subtitle: 'Có phần lỗi — thử lại bên dưới',
        disabled: totalSentences === 0,
      };
    }
    if (
      lesson.status === 'skeleton_ready' ||
      lesson.status === 'partially_ready' ||
      totalSentences === 0
    ) {
      return {
        subtitle:
          totalSentences === 0
            ? 'Đang tách câu…'
            : `Đã xong ${readyCount}/${totalSentences} câu — đang tạo…`,
        disabled: false,
      };
    }
    return {
      subtitle: `${readyCount}/${totalSentences} câu sẵn sàng`,
      disabled: false,
    };
  }, [failedChunks.length, lesson.status, readyCount, totalSentences]);

  const vocabularyState = useMemo(
    () =>
      makeSubtitleForUnit(
        lesson,
        'vocabulary',
        lesson.vocabulary.length,
        'từ',
        'Bài này không có từ vựng riêng.',
      ),
    [lesson],
  );
  const grammarState = useMemo(
    () =>
      makeSubtitleForUnit(
        lesson,
        'grammar',
        lesson.grammar.length,
        'điểm',
        'Bài này không có điểm ngữ pháp riêng.',
      ),
    [lesson],
  );

  const pronunciationDisabled = readyCount === 0;
  const practiceState = useMemo(() => {
    if (practiceEligible) {
      return {subtitle: 'Quiz nhanh cho bài này', disabled: false};
    }
    if (lesson.units.practice.status === 'pending' || lesson.units.practice.status === 'processing') {
      return {subtitle: 'Đang tạo…', disabled: true};
    }
    return {
      subtitle: 'Cần thêm nội dung để tạo bài tập',
      disabled: true,
    };
  }, [practiceEligible, lesson.units.practice.status]);

  return (
    <View style={localStyles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {isOffline ? (
          <View testID="offline-banner" accessibilityRole="alert">
            <Banner message="Bạn đang ngoại tuyến. Bài học đã lưu vẫn đọc được; kết nối lại để tiếp tục cập nhật." />
          </View>
        ) : null}
        {statusMessage ? <Banner message={statusMessage} /> : null}
        {warningMessages.length > 0 ? (
          <AppCard>
            <View style={styles.warningBox} testID="lesson-warnings">
              <AppText variant="h3">Bài học xong kèm lưu ý</AppText>
              {warningMessages.map((message, index) => (
                <AppText
                  key={`${index}-${message}`}
                  color="secondary"
                  testID={`lesson-warning-${index}`}>
                  {message}
                </AppText>
              ))}
            </View>
          </AppCard>
        ) : null}
        {actionMessage ? (
          <AppText color="danger" testID="lesson-action-error">
            {actionMessage}
          </AppText>
        ) : null}
        {saveErrorMessage ? (
          <AppText color="danger" testID="lesson-save-error">
            {saveErrorMessage}
          </AppText>
        ) : null}

        <View style={styles.heroImage} testID="v2hub-hero">
          <ImagePlaceholder height={170} label={lesson.title ?? 'Bài học'} />
          <View style={styles.heroOverlay}>
            <AppText style={styles.heroTitle}>
              {lesson.title ?? 'Bài học đang tạo…'}
            </AppText>
            <View style={localStyles.heroChips}>
              <Chip label={lesson.level || 'Beginner'} tone="gold" />
              <Chip
                label={
                  totalSentences > 0 ? `${totalSentences} câu` : 'Đang tạo…'
                }
                tone="accent"
              />
            </View>
          </View>
        </View>

        <AppCard style={styles.originalCard}>
          <View style={localStyles.sectionTitleRow}>
            <MaterialIcon
              color={theme.colors.primary}
              name="description"
              size={22}
            />
            <AppText style={styles.originalTitle} variant="h3">
              Bản gốc
            </AppText>
          </View>
          <View testID="v2hub-original-preview" style={styles.previewBlock}>
            {preview.length === 0 ? (
              <AppText color="secondary">Nội dung đang được tạo dần…</AppText>
            ) : (
              preview.map(sentence => (
                <AppText key={sentence.id} color="secondary" variant="bodyLg">
                  {sentence.text}
                </AppText>
              ))
            )}
          </View>
          {hasMoreSentences ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Xem tất cả ${totalSentences} câu`}
              accessibilityHint="Mở danh sách đầy đủ các câu trong bài học"
              onPress={onOpenSentences}
              testID="v2hub-see-all-sentences">
              <AppText style={styles.seeAll} variant="label">
                Xem tất cả {totalSentences} câu →
              </AppText>
            </Pressable>
          ) : null}
        </AppCard>

        <AppCard style={styles.translationCard}>
          <View style={localStyles.sectionTitleRow}>
            <MaterialIcon
              color={theme.colors.secondary}
              name="translate"
              size={22}
            />
            <AppText style={styles.translationTitle} variant="h3">
              Bản dịch
            </AppText>
          </View>
          <View testID="v2hub-translation-preview" style={styles.previewBlock}>
            {translationPreview.length === 0 ? (
              <AppText color="secondary">Đang dịch…</AppText>
            ) : (
              translationPreview.map(sentence => (
                <AppText key={sentence.id} color="secondary" variant="bodyLg">
                  {sentence.translation}
                </AppText>
              ))
            )}
          </View>
        </AppCard>

        <View style={localStyles.exploreSection}>
          <SectionHeader title="Khám phá bài học" />
          <View testID="v2hub-explore-sentences">
            <LessonExploreRow
              disabled={sentencesState.disabled}
              icon="menu_book"
              medallionTone="teal"
              onPress={onOpenSentences}
              subtitle={sentencesState.subtitle}
              title="Học từng câu"
            />
          </View>
          <View testID="v2hub-explore-vocabulary">
            <LessonExploreRow
              disabled={vocabularyState.disabled}
              icon="style"
              medallionTone="coral"
              onPress={onOpenVocabulary}
              subtitle={vocabularyState.subtitle}
              title="Từ vựng chính"
            />
          </View>
          <View testID="v2hub-explore-grammar">
            <LessonExploreRow
              disabled={grammarState.disabled}
              icon="rule"
              medallionTone="gold"
              onPress={onOpenGrammar}
              subtitle={grammarState.subtitle}
              title="Ngữ pháp trong ngữ cảnh"
            />
          </View>
          <View testID="v2hub-explore-pronunciation">
            <LessonExploreRow
              disabled={pronunciationDisabled}
              icon="mic"
              medallionTone="teal"
              onPress={onOpenPronunciation}
              subtitle="Nghe và lặp lại to"
              title="Phát âm"
            />
          </View>
          <View testID="v2hub-explore-practice">
            <LessonExploreRow
              badge={practiceEligible ? 'HOT' : undefined}
              disabled={practiceState.disabled}
              icon="bolt"
              medallionTone="coral"
              onPress={onOpenPractice}
              subtitle={practiceState.subtitle}
              title="Luyện tập nhanh"
            />
          </View>
        </View>

        {failedChunks.length > 0 || failedUnits.length > 0 ? (
          <View style={styles.retrySection}>
            <SectionHeader title="Phần cần thử lại" />
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
                    onPress={() => onRetryChunk(chunk.id)}
                    testID={`chunk-retry-${chunk.id}`}
                  />
                </View>
              </AppCard>
            ))}
            {failedUnits.map(unitKey => (
              <AppCard key={unitKey}>
                <View style={styles.retryRow}>
                  <View style={styles.flexBody}>
                    <AppText variant="label">{UNIT_LABELS[unitKey]}</AppText>
                    <AppText color="secondary" variant="caption">
                      Chưa tải được phần này.
                    </AppText>
                  </View>
                  <AppButton
                    title="Thử lại"
                    variant="secondary"
                    loading={retryingUnit === unitKey}
                    onPress={() => onRetryUnit(unitKey)}
                    testID={`unit-retry-${unitKey}`}
                  />
                </View>
              </AppCard>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <BottomActionBar style={styles.actionBar}>
        <View style={styles.actionRow}>
          <Pressable
            accessibilityLabel="Bắt đầu học"
            accessibilityHint="Mở nội dung học đầu tiên khả dụng"
            accessibilityRole="button"
            onPress={onStartLearning}
            testID="v2hub-start-learning"
            style={({pressed}) => [
              styles.primaryAction,
              pressed && styles.pressed,
            ]}>
            <MaterialIcon
              color={theme.colors.text.inverse}
              name="school"
              size={22}
            />
            <AppText style={styles.primaryActionText}>Bắt đầu học</AppText>
          </Pressable>
          <Pressable
            accessibilityLabel="Chia sẻ"
            accessibilityHint="Chia sẻ bài học"
            accessibilityRole="button"
            testID="v2hub-share"
            style={({pressed}) => [
              styles.shareButton,
              pressed && styles.pressed,
            ]}>
            <MaterialIcon
              color={theme.colors.text.inverse}
              name="share"
              size={22}
            />
          </Pressable>
        </View>
      </BottomActionBar>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  exploreSection: {
    gap: 10,
  },
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    actionBar: {
      backgroundColor: theme.colors.background,
      borderTopColor: theme.colors.outlineVariant,
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing.lg,
    },
    actionRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    flexBody: {
      flex: 1,
    },
    heroImage: {
      borderRadius: theme.radius.lg,
      height: 170,
      overflow: 'hidden',
      position: 'relative',
    },
    heroOverlay: {
      backgroundColor: theme.colors.overlay,
      bottom: 0,
      left: 0,
      padding: theme.spacing.lg,
      position: 'absolute',
      right: 0,
    },
    heroTitle: {
      color: theme.colors.onOverlay,
      fontSize: theme.typography.presets.h2.fontSize,
      fontWeight: theme.typography.weight.medium,
    },
    originalCard: {
      borderBottomColor: theme.colors.accentSoft,
      borderBottomWidth: 4,
      gap: theme.spacing.sm,
    },
    originalTitle: {
      color: theme.colors.primary,
      fontWeight: theme.typography.weight.medium,
    },
    pressed: {
      opacity: theme.states.pressedOpacity,
    },
    previewBlock: {
      gap: theme.spacing.xs,
    },
    primaryAction: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.lg,
      flex: 1,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      minHeight: 52,
      opacity: 1,
    },
    primaryActionText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.medium,
    },
    retryRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    retrySection: {
      gap: theme.spacing.sm,
    },
    scrollContent: {
      gap: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
    seeAll: {
      color: theme.colors.primary,
    },
    shareButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.secondaryContainer,
      borderRadius: 18,
      height: 56,
      justifyContent: 'center',
      opacity: 1,
      width: 56,
    },
    translationCard: {
      borderBottomColor: theme.colors.secondarySoft,
      borderBottomWidth: 4,
      gap: theme.spacing.sm,
    },
    translationTitle: {
      color: theme.colors.secondary,
      fontWeight: theme.typography.weight.medium,
    },
    warningBox: {
      gap: theme.spacing.xs,
    },
  });
}
