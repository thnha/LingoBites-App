import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../app/navigation/types';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import {HandoffProgressTrack} from '../../components/HandoffProgressTrack';
import {ScreenHeader} from '../../components/ScreenHeader';
import type {AppTheme} from '../../theme';
import {useAppTheme} from '../../theme';
import {analyzeText} from './AIAnalysisService';

type Props = NativeStackScreenProps<HomeStackParamList, 'Analyzing'>;

const STEPS = [
  {key: 'read', label: 'Đọc đoạn văn'},
  {key: 'vocab', label: 'Tìm từ vựng'},
  {key: 'lesson', label: 'Tạo bài học'},
] as const;

// Tiến độ mô phỏng: API không trả % thật nên các bước tự tick theo timer và
// dừng ở bước cuối tại một mốc ngẫu nhiên 91–96% (KHÔNG tự chạm 100%) để người
// dùng khó nhận ra là chạy giả. Khi API trả về, kết quả thật luôn thắng: tick
// nốt tất cả bước cho complete rồi mới chuyển màn.
const STEP_INTERVAL_MS = 450;
const COMPLETE_HOLD_MS = 220;
const STEP_PROGRESS = [0.15, 0.5];

function randomProgressCap() {
  return 0.91 + Math.random() * 0.05;
}

type StepState = 'done' | 'active' | 'pending';

function StepIndicator({state, theme}: {state: StepState; theme: AppTheme}) {
  const size = 26;

  if (state === 'active') {
    return (
      <View style={{alignItems: 'center', height: size, justifyContent: 'center', width: size}}>
        <ActivityIndicator color={theme.colors.primary} size="small" />
      </View>
    );
  }

  const filled = state === 'done';
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: filled ? theme.colors.primary : undefined,
        borderColor: theme.colors.outlineVariant,
        borderRadius: size / 2,
        borderWidth: filled ? 0 : 2,
        height: size,
        justifyContent: 'center',
        width: size,
      }}>
      {filled ? (
        <AppText style={{color: theme.colors.text.inverse, fontSize: 14, fontWeight: '800'}}>
          ✓
        </AppText>
      ) : null}
    </View>
  );
}

export function AnalyzingScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const {confirmedText, sourceType, origin} = route.params;

  const [activeStep, setActiveStep] = useState(0);
  const [done, setDone] = useState(false);
  // Mốc dừng ngẫu nhiên cho bước cuối, cố định trong một lần vào màn.
  const [progressCap] = useState(randomProgressCap);

  useEffect(() => {
    let isActive = true;
    let finishTimer: ReturnType<typeof setTimeout> | undefined;

    const tick = setInterval(() => {
      setActiveStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, STEP_INTERVAL_MS);

    (async () => {
      const result = await analyzeText(confirmedText, {sourceType});
      if (!isActive) {
        return;
      }
      clearInterval(tick);

      if (result.ok) {
        // Kết quả thật về: tick nốt các bước cho complete rồi chuyển màn.
        setActiveStep(STEPS.length - 1);
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
      clearInterval(tick);
      if (finishTimer) {
        clearTimeout(finishTimer);
      }
    };
  }, [confirmedText, sourceType, origin, navigation]);

  const progress = done ? 1 : STEP_PROGRESS[activeStep] ?? progressCap;
  const percentLabel = `${Math.round(progress * 100)}%`;

  return (
    <AppScreen>
      <ScreenHeader onBack={() => navigation.goBack()} title="Đang phân tích" />
      <View
        style={{
          flex: 1,
          gap: theme.spacing.xl,
          justifyContent: 'center',
          paddingBottom: theme.spacing.xxl,
          paddingHorizontal: theme.gutter,
        }}>
        <View style={{alignItems: 'center', gap: theme.spacing.sm}}>
          <AppText style={{textAlign: 'center'}} variant="title">
            Đang tạo bài học…
          </AppText>
          <AppText color="secondary" style={{textAlign: 'center'}} variant="body">
            App đang phân tích đoạn text bạn xác nhận. Giữ app mở một chút nhé.
          </AppText>
        </View>

        <View style={{gap: theme.spacing.md}}>
          {STEPS.map((step, index) => {
            const stepState: StepState = done || index < activeStep
              ? 'done'
              : index === activeStep
                ? 'active'
                : 'pending';
            return (
              <View
                key={step.key}
                style={{alignItems: 'center', flexDirection: 'row', gap: 12}}>
                <StepIndicator state={stepState} theme={theme} />
                <AppText
                  style={{
                    color:
                      stepState === 'pending'
                        ? theme.colors.text.muted
                        : theme.colors.text.primary,
                    fontWeight: stepState === 'active' ? '700' : '500',
                  }}>
                  {step.label}
                </AppText>
              </View>
            );
          })}
        </View>

        <HandoffProgressTrack label={percentLabel} progress={progress} />
      </View>
    </AppScreen>
  );
}
