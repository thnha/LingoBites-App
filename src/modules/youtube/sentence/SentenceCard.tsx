import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AppButton} from '@components/AppButton';
import {AppText} from '@components/AppText';
import {Chip} from '@components/Chip';
import {useAppTheme, type AppTheme} from '@theme';
import type {
  SentenceEnrichment,
  VocabEntry,
} from '@shared/schemas/sentence-contract';
import {
  useSentenceEnrichment,
  type RetryBlockFn,
} from './useSentenceEnrichment';
import {resolveKeyword, type SentenceBlockId} from './sentencePipeline';

export type SentenceCardSegment = {
  index: number;
  en: string;
  vi: string;
};

export type SentenceCardProps = {
  videoId: string;
  /**
   * C-01: the English sentence renders from `segment.en` only. This card
   * never keeps or derives a second copy of the sentence text.
   */
  segment: SentenceCardSegment;
  /** Enrichment known so far; `null` renders the 3-block skeleton. */
  enrichment: SentenceEnrichment | null;
  /** Injectable per-block fetcher for tests; defaults to the retry API. */
  retryBlock?: RetryBlockFn;
  testID?: string;
};

/** Runs an async side effect without returning its promise to the caller. */
function fireAndForget(task: Promise<unknown>): void {
  task.catch(() => undefined);
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    skeleton: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: theme.radius.md,
      height: 44,
    },
    blockError: {
      gap: theme.spacing.xs,
    },
    vocabRow: {
      gap: 2,
    },
  });
}

function BlockSkeleton({
  testID,
  label,
  hint,
}: {
  testID: string;
  label: string;
  hint: string;
}) {
  const {theme} = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  return (
    <View
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      style={styles.skeleton}
      testID={testID}
    />
  );
}

function BlockError({
  message,
  onRetry,
  retrying,
  retryLabel,
  testID,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
  retryLabel: string;
  testID: string;
}) {
  const {theme} = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.blockError} testID={testID}>
      <AppText color="danger">{message}</AppText>
      <AppButton
        loading={retrying}
        onPress={onRetry}
        testID={`${testID}-retry`}
        title={retryLabel}
        variant="secondary"
      />
    </View>
  );
}

function VocabRow({entry}: {entry: VocabEntry}) {
  const {theme} = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const note = entry.tip ?? entry.inSentenceNote;
  return (
    <View style={styles.vocabRow}>
      <AppText variant="bodyLg">
        {entry.word}
        <AppText color="muted"> · {entry.pos}</AppText>
      </AppText>
      <AppText color="secondary">
        {entry.meaning}
        {entry.ipa ? ` /${entry.ipa}/` : ''}
      </AppText>
      {note ? (
        <AppText color="muted" variant="caption">
          {note}
        </AppText>
      ) : null}
    </View>
  );
}

/**
 * SETE-329 (TASK-2): one sentence card with 3 async AI blocks (keyword,
 * vocab, grammar). Skeleton while pending, progressive fill when ready,
 * per-block error + retry when failed, shorter card (no placeholder) when
 * a block is omitted (`partial`).
 */
export function SentenceCard({
  videoId,
  segment,
  enrichment: initialEnrichment,
  retryBlock,
  testID,
}: SentenceCardProps) {
  const {theme} = useAppTheme();
  const {t} = useTranslation();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const {enrichment, states, errors, retrying, retry} = useSentenceEnrichment({
    videoId,
    segmentIndex: segment.index,
    initialEnrichment,
    retryBlock,
  });

  const blockTestID = useCallback(
    (block: SentenceBlockId, suffix?: string) =>
      testID
        ? `${testID}-block-${block}${suffix ? `-${suffix}` : ''}`
        : undefined,
    [testID],
  );

  const retryLabel = t('youtube.sentence_retry', {defaultValue: 'Thử lại'});
  const blockErrorMessage = (block: SentenceBlockId) =>
    errors[block] ??
    t('youtube.sentence_block_error', {
      defaultValue: 'Không tải được khối này',
    });
  const skeletonHint = t('youtube.sentence_loading_hint', {
    defaultValue: 'Nội dung sẽ hiện khi tải xong',
  });
  const skeletonLabel = (block: SentenceBlockId) =>
    t('youtube.sentence_loading_block', {
      block: t(`youtube.sentence_${block}`, {defaultValue: block}),
      defaultValue: 'Đang tải…',
    });

  const keyword = resolveKeyword(segment.en, enrichment);

  return (
    <View style={styles.card} testID={testID}>
      <AppText variant="bodyLg" testID={testID ? `${testID}-en` : undefined}>
        {segment.en}
      </AppText>
      {segment.vi !== '' ? (
        <AppText color="secondary" testID={testID ? `${testID}-vi` : undefined}>
          {segment.vi}
        </AppText>
      ) : null}

      {states.keyword === 'pending' ? (
        <BlockSkeleton
          hint={skeletonHint}
          label={skeletonLabel('keyword')}
          testID={blockTestID('keyword', 'skeleton') ?? 'keyword-skeleton'}
        />
      ) : states.keyword === 'failed' ? (
        <BlockError
          message={blockErrorMessage('keyword')}
          onRetry={() => fireAndForget(retry('keyword'))}
          retrying={retrying.keyword}
          retryLabel={retryLabel}
          testID={blockTestID('keyword', 'error') ?? 'keyword-error'}
        />
      ) : (
        <View testID={blockTestID('keyword', 'value')}>
          <Chip label={keyword} tone="accent" />
        </View>
      )}

      {states.vocab === 'pending' ? (
        <BlockSkeleton
          hint={skeletonHint}
          label={skeletonLabel('vocab')}
          testID={blockTestID('vocab', 'skeleton') ?? 'vocab-skeleton'}
        />
      ) : states.vocab === 'failed' ? (
        <BlockError
          message={blockErrorMessage('vocab')}
          onRetry={() => fireAndForget(retry('vocab'))}
          retrying={retrying.vocab}
          retryLabel={retryLabel}
          testID={blockTestID('vocab', 'error') ?? 'vocab-error'}
        />
      ) : states.vocab === 'ready' ? (
        <View testID={blockTestID('vocab', 'value')}>
          {(enrichment?.vocab ?? []).map(entry => (
            <VocabRow key={entry.word} entry={entry} />
          ))}
        </View>
      ) : null}

      {states.grammar === 'pending' ? (
        <BlockSkeleton
          hint={skeletonHint}
          label={skeletonLabel('grammar')}
          testID={blockTestID('grammar', 'skeleton') ?? 'grammar-skeleton'}
        />
      ) : states.grammar === 'failed' ? (
        <BlockError
          message={blockErrorMessage('grammar')}
          onRetry={() => fireAndForget(retry('grammar'))}
          retrying={retrying.grammar}
          retryLabel={retryLabel}
          testID={blockTestID('grammar', 'error') ?? 'grammar-error'}
        />
      ) : states.grammar === 'ready' ? (
        <View testID={blockTestID('grammar', 'value')}>
          {(enrichment?.grammar ?? []).map(point => (
            <View key={point.name}>
              <AppText variant="bodyLg">{point.name}</AppText>
              <AppText color="secondary">{point.analysis}</AppText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
