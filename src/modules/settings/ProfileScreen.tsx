import React, {useState} from 'react';
import {Alert, Linking, Pressable, ScrollView, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../app/navigation/types';
import {AppCard} from '../../components/AppCard';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import {IconButton} from '../../components/IconButton';
import {MaterialIcon} from '../../components/MaterialIcon';
import {ProfileSettingsRow} from '../../components/ProfileSettingsRow';
import {SectionHeader} from '../../components/SectionHeader';
import {ThemePicker} from '../../components/ThemePicker';
import {getSupportEmail} from '../../shared/api/appConfig';
import {
  CLEAR_DATA_CONFIRM_MESSAGE,
  CLEAR_DATA_DONE_MESSAGE,
} from '../../shared/copy/userMessages';
import {clearAllLocalData} from '../../shared/db/LessonRepository';
import {useAppTheme} from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

/** Phase 0 placeholders — visual parity with handoff mock until progress store ships. */
const PROFILE_PLACEHOLDER = {
  initials: 'HV',
  name: 'Học viên',
  subtitle: 'Học tiếng Anh · Trình độ Beginner',
  streakDays: 5,
  wordsKnown: '4.2k',
  accuracy: '85%',
} as const;

export function ProfileScreen({navigation}: Props) {
  const {theme} = useAppTheme();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const supportEmail = getSupportEmail();

  function handleClearData() {
    Alert.alert('Xóa dữ liệu local', CLEAR_DATA_CONFIRM_MESSAGE, [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          clearAllLocalData();
          setStatusMessage(CLEAR_DATA_DONE_MESSAGE);
        },
      },
    ]);
  }

  function handleSupport() {
    const subject = encodeURIComponent('LingoBites — Góp ý / báo lỗi');
    void Linking.openURL(`mailto:${supportEmail}?subject=${subject}`);
  }

  return (
    <AppScreen>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          height: 56,
          justifyContent: 'space-between',
          paddingHorizontal: theme.gutter,
        }}>
        <AppText
          style={{
            color: theme.colors.primary,
            fontSize: 20,
            fontWeight: '600',
            marginLeft: 4,
          }}>
          Hồ sơ
        </AppText>
        <IconButton accessibilityLabel="Chỉnh sửa hồ sơ" icon="edit" tone="surface" />
      </View>

      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.lg,
          paddingBottom: 28,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        showsVerticalScrollIndicator={false}>
        <AppCard style={{alignItems: 'center', flexDirection: 'row', gap: 16}}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: theme.colors.accent,
              borderRadius: theme.radius.pill,
              height: 64,
              justifyContent: 'center',
              width: 64,
            }}>
            <AppText style={{color: theme.colors.accentInk, fontSize: 24, fontWeight: '700'}}>
              {PROFILE_PLACEHOLDER.initials}
            </AppText>
          </View>
          <View style={{flex: 1, gap: 4, minWidth: 0}}>
            <AppText variant="h3">{PROFILE_PLACEHOLDER.name}</AppText>
            <AppText color="secondary" variant="caption">
              {PROFILE_PLACEHOLDER.subtitle}
            </AppText>
          </View>
        </AppCard>

        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.colors.accent,
            borderRadius: theme.radius.lg,
            flexDirection: 'row',
            gap: 14,
            padding: theme.spacing.lg,
            ...theme.shadow.medium,
          }}>
          <MaterialIcon
            color={theme.colors.accentInk}
            filled
            name="local_fire_department"
            size={42}
          />
          <View style={{flex: 1, gap: 4}}>
            <AppText style={{color: theme.colors.accentInk, fontSize: 22, fontWeight: '600'}}>
              {`Chuỗi ${PROFILE_PLACEHOLDER.streakDays} ngày`}
            </AppText>
            <AppText style={{color: theme.colors.accentInk, fontSize: 12, opacity: 0.85}}>
              Tiếp tục duy trì — học gì đó hôm nay nhé!
            </AppText>
          </View>
        </View>

        <View style={{flexDirection: 'row', gap: 12}}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: theme.colors.tertiarySoft,
              borderRadius: 18,
              flex: 1,
              paddingHorizontal: 12,
              paddingVertical: 16,
            }}>
            <AppText style={{color: theme.colors.tertiary, fontSize: 26, fontWeight: '700'}}>
              {PROFILE_PLACEHOLDER.wordsKnown}
            </AppText>
            <AppText style={{color: theme.colors.tertiary, fontSize: 12, fontWeight: '600'}}>
              Từ đã biết
            </AppText>
          </View>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: theme.colors.secondarySoft,
              borderRadius: 18,
              flex: 1,
              paddingHorizontal: 12,
              paddingVertical: 16,
            }}>
            <AppText style={{color: theme.colors.secondary, fontSize: 26, fontWeight: '700'}}>
              {PROFILE_PLACEHOLDER.accuracy}
            </AppText>
            <AppText style={{color: theme.colors.secondary, fontSize: 12, fontWeight: '600'}}>
              Độ chính xác
            </AppText>
          </View>
        </View>

        <View style={{gap: 10}}>
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

        <AppCard style={{gap: theme.spacing.sm}}>
          <AppText variant="h3">Giao diện</AppText>
          <AppText color="secondary" variant="caption">
            Chọn theme — áp dụng ngay cho toàn app.
          </AppText>
          <ThemePicker />
        </AppCard>

        <Pressable
          accessibilityLabel="Xóa dữ liệu học trên máy"
          accessibilityRole="button"
          onPress={handleClearData}
          style={({pressed}) => [
            {
              alignItems: 'center',
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.danger,
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              justifyContent: 'center',
              minHeight: 48,
              opacity: pressed ? theme.states.pressedOpacity : 1,
              paddingHorizontal: theme.spacing.lg,
            },
          ]}>
          <AppText color="danger" style={{fontWeight: theme.typography.weight.bold}}>
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
