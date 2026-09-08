import React, {useCallback, useState} from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '@/app/navigation/types';
import {AppCard} from '@components/AppCard';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {IconButton} from '@components/IconButton';
import {MaterialIcon} from '@components/MaterialIcon';
import {ProfileSettingsRow} from '@components/ProfileSettingsRow';
import {SectionHeader} from '@components/SectionHeader';
import {ThemePicker} from '@components/ThemePicker';
import {getSupportEmail} from '@shared/api/appConfig';
import {
  formatCacheBytes,
  playReadyChapterAudio,
  useAudioLibrary,
} from '../audio';
import {
  getGamificationSnapshot,
  type GamificationSnapshot,
} from '@modules/engagement';
import {useTranslation} from 'react-i18next';
import {useLessonRepository} from '@modules/lesson';
import {deleteRecordingFile} from '@modules/speaking';
import {useAppTheme, type AppTheme} from '@theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

/** Phase 0 placeholders — visual parity with handoff mock until progress store ships. */
const PROFILE_PLACEHOLDER = {
  initials: 'HV',
  name: 'Học viên',
  subtitle: 'Học tiếng Anh · Trình độ Beginner',
  wordsKnown: '4.2k',
  accuracy: '85%',
} as const;

export function ProfileScreen({navigation}: Props) {
  const {theme} = useAppTheme();
  const {t} = useTranslation();
  const themedStyles = React.useMemo(() => makeStyles(theme), [theme]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const supportEmail = getSupportEmail();
  const {getAudioCacheStats, listReadyAudioAssets} = useAudioLibrary();
  const {clearAllLocalData} = useLessonRepository();
  const audioCacheStats = getAudioCacheStats();
  const audioCacheTrailingLabel = `${formatCacheBytes(
    audioCacheStats.readyBytes,
  )} · ${audioCacheStats.chapterCount} chương`;

  // Streak / XP / badge / pet state is recomputed from the local gamification
  // event log on every focus so the screen never shows stale engagement data.
  const [gamification, setGamification] = useState<GamificationSnapshot>(() =>
    getGamificationSnapshot(),
  );
  useFocusEffect(
    useCallback(() => {
      setGamification(getGamificationSnapshot());
    }, []),
  );
  const streak = gamification.currentStreak;
  const streakTitle =
    streak > 0 ? `Chuỗi ${streak} ngày` : 'Chưa có chuỗi ngày';
  const streakSubtitle =
    streak > 0
      ? 'Tiếp tục duy trì — học gì đó hôm nay nhé!'
      : 'Hoàn thành một phiên ôn tập để bắt đầu chuỗi.';

  function handleClearData() {
    Alert.alert('Xóa dữ liệu local', t('settings.clear_data_confirm'), [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          clearAllLocalData();
          setStatusMessage(t('settings.clear_data_done'));
        },
      },
    ]);
  }

  function handleClearSpeakingData() {
    Alert.alert(
      'Xóa dữ liệu luyện nói',
      'Tất cả bản ghi âm và lịch sử sổ tay lỗi nói sẽ bị xóa khỏi máy. Bạn có chắc chắn không?',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const {
              clearSpeakingData,
            } = require('@shared/db/SpeakingRepository');
            const {deletedFilePaths} = clearSpeakingData();
            for (const path of deletedFilePaths) {
              await deleteRecordingFile(path);
            }
            setStatusMessage('Đã xóa toàn bộ dữ liệu luyện nói và ghi âm.');
          },
        },
      ],
    );
  }

  function handleSupport() {
    const subject = encodeURIComponent('LingoBites — Góp ý / báo lỗi');
    void Linking.openURL(`mailto:${supportEmail}?subject=${subject}`);
  }

  /** Plays the first downloaded pronunciation clip — offline playback QA (VC-4). */
  async function handlePlayCachedAudio() {
    const ready = listReadyAudioAssets();
    if (ready.length === 0) {
      Alert.alert(
        'Âm thanh chương học',
        'Chưa có âm thanh được tải về máy. Tải chương học khi có mạng rồi thử lại.',
      );
      return;
    }
    const result = await playReadyChapterAudio(ready[0].id);
    if (!result.ok) {
      Alert.alert('Âm thanh chương học', result.message);
    }
  }

  return (
    <AppScreen>
      <View style={themedStyles.header}>
        <AppText style={themedStyles.headerTitle}>Hồ sơ</AppText>
        <IconButton
          accessibilityLabel="Chỉnh sửa hồ sơ"
          icon="edit"
          tone="surface"
        />
      </View>

      <ScrollView
        contentContainerStyle={themedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppCard style={styles.profileCard}>
          <View style={themedStyles.avatar}>
            <AppText style={themedStyles.avatarText}>
              {PROFILE_PLACEHOLDER.initials}
            </AppText>
          </View>
          <View style={styles.profileCopy}>
            <AppText variant="h3">{PROFILE_PLACEHOLDER.name}</AppText>
            <AppText color="secondary" variant="caption">
              {PROFILE_PLACEHOLDER.subtitle}
            </AppText>
          </View>
        </AppCard>

        <View style={themedStyles.streakCard}>
          <MaterialIcon
            color={theme.colors.accentInk}
            name="local_fire_department"
            size={42}
          />
          <View style={styles.streakCopy}>
            <AppText style={themedStyles.streakTitle}>{streakTitle}</AppText>
            <AppText style={themedStyles.streakSubtitle}>
              {streakSubtitle}
            </AppText>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, themedStyles.metricTertiary]}>
            <AppText style={themedStyles.metricValueTertiary}>
              {gamification.totalXp}
            </AppText>
            <AppText style={themedStyles.metricLabelTertiary}>
              XP đã đạt
            </AppText>
          </View>
          <View style={[styles.metricCard, themedStyles.metricSecondary]}>
            <AppText style={themedStyles.metricValueSecondary}>
              {gamification.badges.length}
            </AppText>
            <AppText style={themedStyles.metricLabelSecondary}>
              Huy hiệu
            </AppText>
          </View>
          <View style={[styles.metricCard, themedStyles.metricAccent]}>
            <AppText style={themedStyles.petMetricValue}>
              {t(`gamification.pet_stage.${gamification.pet.stageId}`)}
            </AppText>
            <AppText style={themedStyles.metricLabelPrimary}>Cây ảo</AppText>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, themedStyles.metricTertiary]}>
            <AppText style={themedStyles.metricValueTertiary}>
              {PROFILE_PLACEHOLDER.wordsKnown}
            </AppText>
            <AppText style={themedStyles.metricLabelTertiary}>
              Từ đã biết
            </AppText>
          </View>
          <View style={[styles.metricCard, themedStyles.metricSecondary]}>
            <AppText style={themedStyles.metricValueSecondary}>
              {PROFILE_PLACEHOLDER.accuracy}
            </AppText>
            <AppText style={themedStyles.metricLabelSecondary}>
              Độ chính xác
            </AppText>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <SectionHeader title="Cài đặt" />
          <ProfileSettingsRow
            icon="flag"
            label="Mục tiêu hàng ngày"
            medallionTone="teal"
            trailing={{chip: '10 từ', chipTone: 'accentSoft'}}
          />
          <ProfileSettingsRow
            icon="translate"
            label="Ngôn ngữ app"
            medallionTone="coral"
            trailing={{text: 'Tiếng Việt'}}
          />
          <ProfileSettingsRow
            icon="subtitles"
            label="Dịch sang"
            medallionTone="gold"
            trailing={{text: 'Tiếng Việt'}}
          />
          <ProfileSettingsRow
            icon="notifications"
            label="Nhắc nhở"
            medallionTone="teal"
            trailing="chevron"
          />
          <ProfileSettingsRow
            accessibilityLabel="Dung lượng âm thanh chương học đã tải về máy — bấm để nghe thử clip đã tải"
            icon="volume_up"
            label="Âm thanh chương học"
            medallionTone="teal"
            onPress={handlePlayCachedAudio}
            trailing={{text: audioCacheTrailingLabel}}
          />
          <ProfileSettingsRow
            accessibilityLabel="Báo cáo tiến độ và năng lực"
            icon="analytics"
            label="Báo cáo tiến độ & Năng lực"
            medallionTone="teal"
            onPress={() => navigation.navigate('ProgressReport')}
            trailing="chevron"
          />
          <ProfileSettingsRow
            accessibilityLabel="Quyền riêng tư"
            icon="visibility"
            label="Quyền riêng tư"
            medallionTone="gold"
            onPress={() => navigation.navigate('PrivacyNote')}
            trailing="chevron"
          />
          <ProfileSettingsRow
            accessibilityLabel="Trợ giúp và góp ý"
            icon="help"
            label="Trợ giúp & góp ý"
            medallionTone="coral"
            onPress={handleSupport}
            trailing="chevron"
          />
        </View>

        <AppCard style={themedStyles.themeCard}>
          <AppText variant="h3">Giao diện</AppText>
          <AppText color="secondary" variant="caption">
            Chọn theme — áp dụng ngay cho toàn app.
          </AppText>
          <ThemePicker />
        </AppCard>

        <Pressable
          accessibilityLabel="Xóa dữ liệu luyện nói"
          accessibilityRole="button"
          onPress={handleClearSpeakingData}
          style={({pressed}) => [
            themedStyles.dangerButton,
            pressed && themedStyles.pressed,
          ]}
        >
          <AppText color="danger" style={themedStyles.dangerButtonText}>
            Xóa dữ liệu luyện nói & ghi âm
          </AppText>
        </Pressable>

        <Pressable
          accessibilityLabel="Xóa dữ liệu học trên máy"
          accessibilityRole="button"
          onPress={handleClearData}
          style={({pressed}) => [
            themedStyles.dangerButton,
            pressed && themedStyles.pressed,
          ]}
        >
          <AppText color="danger" style={themedStyles.dangerButtonText}>
            Xóa dữ liệu học trên máy
          </AppText>
        </Pressable>

        {statusMessage ? (
          <AppText color="secondary">{statusMessage}</AppText>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    alignItems: 'center',
    borderRadius: 18,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  profileCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  profileCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  settingsSection: {
    gap: 10,
  },
  streakCopy: {
    flex: 1,
    gap: 4,
  },
});

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    avatar: {
      alignItems: 'center',
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.pill,
      height: 64,
      justifyContent: 'center',
      width: 64,
    },
    avatarText: {
      color: theme.colors.accentInk,
      fontSize: theme.typography.size.xl,
      fontWeight: '700',
    },
    dangerButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.danger,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      justifyContent: 'center',
      minHeight: 48,
      opacity: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    dangerButtonText: {
      fontWeight: theme.typography.weight.bold,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      height: 56,
      justifyContent: 'space-between',
      paddingHorizontal: theme.gutter,
    },
    headerTitle: {
      color: theme.colors.primary,
      fontSize: theme.typography.size.lg,
      fontWeight: theme.typography.weight.medium,
      marginLeft: theme.spacing.xs,
    },
    metricAccent: {
      backgroundColor: theme.colors.accentSoft,
    },
    metricLabelPrimary: {
      color: theme.colors.primary,
      fontSize: theme.typography.size.xs,
      fontWeight: theme.typography.weight.medium,
    },
    metricLabelSecondary: {
      color: theme.colors.secondary,
      fontSize: theme.typography.size.xs,
      fontWeight: theme.typography.weight.medium,
    },
    metricLabelTertiary: {
      color: theme.colors.tertiary,
      fontSize: theme.typography.size.xs,
      fontWeight: theme.typography.weight.medium,
    },
    metricSecondary: {
      backgroundColor: theme.colors.secondarySoft,
    },
    metricTertiary: {
      backgroundColor: theme.colors.tertiarySoft,
    },
    metricValueSecondary: {
      color: theme.colors.secondary,
      fontSize: 26,
      fontWeight: '700',
    },
    metricValueTertiary: {
      color: theme.colors.tertiary,
      fontSize: 26,
      fontWeight: '700',
    },
    petMetricValue: {
      color: theme.colors.primary,
      fontSize: theme.typography.size.lg,
      fontWeight: '700',
    },
    pressed: {
      opacity: theme.states.pressedOpacity,
    },
    scrollContent: {
      gap: theme.spacing.lg,
      paddingBottom: 28,
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
    streakCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.lg,
      flexDirection: 'row',
      gap: 14,
      padding: theme.spacing.lg,
      ...theme.shadow.medium,
    },
    streakSubtitle: {
      color: theme.colors.accentInk,
      fontSize: theme.typography.size.xs,
      opacity: 0.85,
    },
    streakTitle: {
      color: theme.colors.accentInk,
      fontSize: theme.typography.presets.h2.fontSize,
      fontWeight: theme.typography.weight.medium,
    },
    themeCard: {
      gap: theme.spacing.sm,
    },
  });
}
