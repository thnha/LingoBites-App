import React, {useCallback, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../app/navigation/types';
import {AppCard} from '../../components/AppCard';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import {Chip} from '../../components/Chip';
import {MaterialIcon} from '../../components/MaterialIcon';
import {SectionHeader} from '../../components/SectionHeader';
import {useAppTheme} from '../../theme';
import {generateStudyBlock} from './adaptationEngine';
import {getLearnerStateSnapshot} from './todayAdapter';
import type {StudyActivityItem, StudyBlockPlan, TodayMode} from './types';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export function TodayScreen() {
  const {theme} = useAppTheme();
  const navigation = useNavigation<NavigationProp>();

  const [mode, setMode] = useState<TodayMode>('normal');
  const [plan, setPlan] = useState<StudyBlockPlan | null>(null);

  const loadPlan = useCallback((selectedMode: TodayMode) => {
    const snapshot = getLearnerStateSnapshot();
    const newPlan = generateStudyBlock(snapshot, selectedMode);
    setPlan(newPlan);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlan(mode);
    }, [loadPlan, mode]),
  );

  function handleModeChange(newMode: TodayMode) {
    setMode(newMode);
    loadPlan(newMode);
  }

  function handleExecuteActivity(activity: StudyActivityItem) {
    const target = activity.navigationTarget;
    // Map navigation target to screen
    if (target.screen === 'DailyReview') {
      navigation.navigate('DailyReview');
    } else if (target.screen === 'ContentLessonRuntime') {
      const lessonId = target.params?.lessonId;
      if (lessonId) {
        navigation.navigate('SavedLessonDetail', {lessonId});
      } else {
        navigation.navigate('DailyReview');
      }
    } else if (target.screen === 'SpeakingRoom') {
      navigation.navigate('LessonsList');
    } else if (target.screen === 'FlashcardList') {
      navigation.navigate('FlashcardList');
    } else {
      navigation.navigate('DailyReview');
    }
  }

  return (
    <AppScreen testID="today-screen">
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          height: 56,
          justifyContent: 'space-between',
          paddingHorizontal: theme.gutter,
        }}
      >
        <View style={{alignItems: 'center', flexDirection: 'row', gap: 10}}>
          <MaterialIcon
            color={theme.colors.primary}
            name="event_note"
            size={26}
          />
          <AppText
            style={{
              color: theme.colors.primary,
              fontSize: 20,
              fontWeight: '600',
            }}
          >
            Hôm nay (Today Study Center)
          </AppText>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.lg,
          paddingBottom: 28,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode Selector (REQ-12, REQ-13) */}
        <View style={{gap: 8}}>
          <AppText variant="label" color="secondary">
            Chọn thời gian học hôm nay:
          </AppText>
          <View style={{flexDirection: 'row', gap: 8}} testID="mode-selector">
            <Chip
              label="⚡ 5 phút"
              selected={mode === '5-minute'}
              onPress={() => handleModeChange('5-minute')}
              testID="mode-5-minute"
            />
            <Chip
              label="🎯 Tiêu chuẩn (20m)"
              selected={mode === 'normal'}
              onPress={() => handleModeChange('normal')}
              testID="mode-normal"
            />
            <Chip
              label="🔥 Luyện sâu (45m)"
              selected={mode === 'deep-practice'}
              onPress={() => handleModeChange('deep-practice')}
              testID="mode-deep-practice"
            />
          </View>
        </View>

        {/* Backlog Control Banner (REQ-14) */}
        {plan?.isConsolidation ? (
          <View
            style={{
              backgroundColor: theme.colors.accentSoft,
              borderColor: theme.colors.accent,
              borderRadius: theme.radius.lg,
              borderWidth: 1.5,
              gap: 8,
              padding: 16,
            }}
            testID="backlog-consolidation-banner"
          >
            <View style={{alignItems: 'center', flexDirection: 'row', gap: 8}}>
              <MaterialIcon
                color={theme.colors.primary}
                name="warning"
                size={24}
              />
              <AppText variant="h3" style={{color: theme.colors.primary}}>
                Khối củng cố (Tồn đọng cao)
              </AppText>
            </View>
            <AppText color="secondary" variant="body">
              Lượng bài cần ôn tập đang vượt ngưỡng (&gt; 20 mục hoặc thời gian
              ôn &gt; 10 phút). Hệ thống đã tạm dừng bài học mới để giúp bạn tập
              trung củng cố kiến thức cũ.
            </AppText>
          </View>
        ) : null}

        {/* Explainability UI Card (REQ-31) */}
        {plan ? (
          <AppCard testID="explainability-card" style={{gap: 10}}>
            <View style={{alignItems: 'center', flexDirection: 'row', gap: 8}}>
              <MaterialIcon
                color={theme.colors.tertiary}
                name="auto_awesome"
                size={22}
              />
              <AppText variant="h3">Lý do chọn bài học</AppText>
            </View>
            <AppText color="secondary" variant="body">
              {plan.explanationVi}
            </AppText>

            {plan.reasonCodes.length > 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 6,
                  marginTop: 4,
                }}
              >
                {plan.reasonCodes.map(code => (
                  <View
                    key={code}
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.accentSoft,
                      borderRadius: theme.radius.pill,
                      borderWidth: 1,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <AppText
                      variant="caption"
                      style={{color: theme.colors.primary}}
                    >
                      #{code}
                    </AppText>
                  </View>
                ))}
              </View>
            ) : null}
          </AppCard>
        ) : null}

        {/* Executable Study Block Activity List */}
        <View style={{gap: 12}}>
          <SectionHeader
            title="Chuỗi bài học gợi ý"
            action={
              plan ? (
                <AppText color="secondary" variant="caption">
                  Tổng thời lượng: ~{plan.totalEstimatedMinutes} phút
                </AppText>
              ) : null
            }
          />

          {plan?.activities.map((activity, index) => (
            <Pressable
              key={activity.id}
              accessibilityRole="button"
              onPress={() => handleExecuteActivity(activity)}
              style={({pressed}) => [
                {
                  alignItems: 'center',
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.accentSoft,
                  borderRadius: theme.radius.lg,
                  borderWidth: 1,
                  flexDirection: 'row',
                  gap: 12,
                  opacity: pressed ? theme.states.pressedOpacity : 1,
                  padding: 16,
                  ...theme.shadow.soft,
                },
              ]}
              testID={`activity-item-${index}`}
            >
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: theme.colors.accentSoft,
                  borderRadius: 999,
                  height: 44,
                  justifyContent: 'center',
                  width: 44,
                }}
              >
                <AppText style={{fontSize: 18, fontWeight: '700'}}>
                  {index + 1}
                </AppText>
              </View>

              <View style={{flex: 1, gap: 4}}>
                <AppText variant="h3">{activity.titleVi}</AppText>
                <AppText color="secondary" variant="caption">
                  {activity.subtitleVi}
                </AppText>
              </View>

              <View style={{alignItems: 'flex-end', gap: 4}}>
                <AppText variant="caption" color="secondary">
                  ~{activity.estimatedMinutes}m
                </AppText>
                <MaterialIcon
                  color={theme.colors.primary}
                  name="chevron_right"
                  size={22}
                />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}
