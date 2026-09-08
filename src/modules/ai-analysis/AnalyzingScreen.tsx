import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '@/app/navigation/types';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {HandoffProgressTrack} from '@components/HandoffProgressTrack';
import {ScreenHeader} from '@components/ScreenHeader';
import type {AppTheme} from '@theme';
import {useAppTheme} from '@theme';
import type {AnalysisJobStage} from '@shared/api/types';
import {analyzeText} from './AIAnalysisService';
import type {AnalysisProgress} from './types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Analyzing'>;

// Post-success hold: keep the "all done" state on screen briefly before
// navigating, so the transition doesn't feel abrupt.
const COMPLETE_HOLD_MS = 220;

const FALLBACK_SUBTITLE =
  'App đang phân tích đoạn text bạn xác nhận. Giữ app mở một chút nhé.';

const STAGES = [
  {key: 'source_analysis', label: 'Đang dịch và sắp xếp nội dung'},
  {key: 'sentence_analysis', label: 'Đang phân tích từng câu'},
  {key: 'learning_points', label: 'Đang tìm ngữ pháp và từ vựng'},
  {key: 'pronunciation', label: 'Đang chuẩn bị hướng dẫn phát âm'},
  {key: 'practice', label: 'Đang tạo bài luyện tập'},
  {key: 'finalizing', label: 'Đang kiểm tra bài học'},
] as const;

type StepState = 'done' | 'active' | 'pending';

function getStepState(
  stageName: string,
  stages: AnalysisJobStage[],
  done: boolean,
): StepState {
  if (done) return 'done';
  const status = stages.find(stage => stage.name === stageName)?.status;
  if (status === 'completed' || status === 'skipped') return 'done';
  if (status === 'processing' || status === 'retrying' || status === 'failed') {
    return 'active';
  }
  return 'pending';
}

function StepIndicator({state, theme}: {state: StepState; theme: AppTheme}) {
  const size = 26;
  const themedStyles = React.useMemo(
    () => makeStepIndicatorStyles(theme, size, state === 'done'),
    [state, theme],
  );

  if (state === 'active') {
    return (
      <View style={styles.activeStepIndicator}>
        <ActivityIndicator color={theme.colors.primary} size="small" />
      </View>
    );
  }

  const filled = state === 'done';
  return (
    <View style={themedStyles.indicator}>
      {filled ? <AppText style={themedStyles.checkmark}>✓</AppText> : null}
    </View>
  );
}

export function AnalyzingScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const themedStyles = React.useMemo(() => makeStyles(theme), [theme]);
  const {confirmedText, sourceType, origin} = route.params;

  const [progress, setProgress] = useState<AnalysisProgress>({
    percent: 0,
    stage: null,
    message: null,
    stages: [],
  });
  const [done, setDone] = useState(false);

  useEffect(() => {
    let isActive = true;
    let finishTimer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();

    (async () => {
      const result = await analyzeText(
        confirmedText,
        {sourceType},
        nextProgress => {
          if (isActive) setProgress(nextProgress);
        },
        controller.signal,
      );
      if (!isActive || (!result.ok && result.cancelled)) {
        return;
      }

      if (result.ok) {
        // Kết quả thật về: chốt tiến độ 100% cho tất cả bước rồi mới chuyển màn.
        setProgress(previous => ({...previous, percent: 100}));
        setDone(true);
        finishTimer = setTimeout(() => {
          if (!isActive) {
            return;
          }
          navigation.reset({
            index: 1,
            routes: [
              {name: 'HomeMain'},
              {
                name: 'LessonResult',
                params: {lesson: result.lesson, confirmedText, sourceType},
              },
            ],
          });
        }, COMPLETE_HOLD_MS);
        return;
      }

      // Lỗi: quay lại màn nhập (instance cũ, text còn nguyên) kèm thông báo lỗi.
      navigation.dispatch(
        CommonActions.navigate({
          name: origin,
          params: {analyzeError: result.message},
          merge: true,
        }),
      );
    })();

    return () => {
      isActive = false;
      controller.abort();
      if (finishTimer) {
        clearTimeout(finishTimer);
      }
    };
  }, [confirmedText, sourceType, origin, navigation]);

  const normalizedProgress = done
    ? 1
    : Math.max(0, Math.min(1, progress.percent / 100));
  const percentLabel = `${done ? 100 : Math.round(normalizedProgress * 100)}%`;
  const subtitle = progress.message ?? FALLBACK_SUBTITLE;

  return (
    <AppScreen>
      <ScreenHeader onBack={() => navigation.goBack()} title="Đang phân tích" />
      <View style={themedStyles.container}>
        <View style={themedStyles.heroText}>
          <AppText style={styles.centerText} variant="title">
            Đang tạo bài học…
          </AppText>
          <AppText color="secondary" style={styles.centerText} variant="body">
            {subtitle}
          </AppText>
        </View>

        <View style={themedStyles.stepList}>
          {STAGES.map(step => {
            const stepState = getStepState(step.key, progress.stages, done);
            return (
              <View key={step.key} style={styles.stepRow}>
                <StepIndicator state={stepState} theme={theme} />
                <AppText
                  style={
                    stepState === 'pending'
                      ? themedStyles.pendingStepText
                      : stepState === 'active'
                      ? themedStyles.activeStepText
                      : themedStyles.doneStepText
                  }
                >
                  {step.label}
                </AppText>
              </View>
            );
          })}
        </View>

        <HandoffProgressTrack
          label={percentLabel}
          progress={normalizedProgress}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  activeStepIndicator: {
    alignItems: 'center',
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  centerText: {
    textAlign: 'center',
  },
  stepRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
});

function makeStepIndicatorStyles(
  theme: AppTheme,
  size: number,
  filled: boolean,
) {
  return StyleSheet.create({
    checkmark: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.size.sm,
      fontWeight: theme.typography.weight.bold,
    },
    indicator: {
      alignItems: 'center',
      backgroundColor: filled ? theme.colors.primary : undefined,
      borderColor: theme.colors.outlineVariant,
      borderRadius: size / 2,
      borderWidth: filled ? 0 : 2,
      height: size,
      justifyContent: 'center',
      width: size,
    },
  });
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    activeStepText: {
      color: theme.colors.text.primary,
      fontWeight: '700',
    },
    container: {
      flex: 1,
      gap: theme.spacing.xl,
      justifyContent: 'center',
      paddingBottom: theme.spacing.xxl,
      paddingHorizontal: theme.gutter,
    },
    doneStepText: {
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    heroText: {
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    pendingStepText: {
      color: theme.colors.text.muted,
      fontWeight: '500',
    },
    stepList: {
      gap: theme.spacing.md,
    },
  });
}
