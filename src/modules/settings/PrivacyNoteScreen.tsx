import React from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../app/navigation/types';
import {AppCard} from '../../components/AppCard';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import type {HandoffIconName} from '../../components/icons/iconRegistry';
import {MaterialIcon} from '../../components/MaterialIcon';
import {ScreenHeader} from '../../components/ScreenHeader';
import {useAppTheme} from '../../theme';
import {
  AI_DISCLAIMER_BODY,
  LOCAL_DATA_NOTE,
  PRIVACY_NOTE_BODY,
} from './privacyCopy';

export function PrivacyNoteScreen() {
  const {theme} = useAppTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'PrivacyNote'>>();

  return (
    <AppScreen>
      <ScreenHeader onBack={() => navigation.goBack()} title="Quyền riêng tư" />
      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.lg,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        showsVerticalScrollIndicator={false}>
        <AppCard style={{gap: theme.spacing.sm}}>
          <SectionTitle icon="shield" title="Dữ liệu bạn cung cấp" />
          <AppText color="secondary">{PRIVACY_NOTE_BODY}</AppText>
        </AppCard>

        <AppCard style={{gap: theme.spacing.sm}}>
          <SectionTitle icon="smartphone" title="Lưu trữ trên thiết bị" />
          <AppText color="secondary">{LOCAL_DATA_NOTE}</AppText>
        </AppCard>

        <AppCard style={{gap: theme.spacing.sm}}>
          <SectionTitle icon="psychology" title="Lưu ý về AI" />
          <AppText color="secondary">{AI_DISCLAIMER_BODY}</AppText>
        </AppCard>
      </ScrollView>
    </AppScreen>
  );
}

function SectionTitle({icon, title}: {icon: HandoffIconName; title: string}) {
  const {theme} = useAppTheme();
  return (
    <View style={{alignItems: 'center', flexDirection: 'row', gap: 8}}>
      <MaterialIcon color={theme.colors.primary} name={icon} size={22} />
      <AppText accessibilityRole="header" variant="h3">
        {title}
      </AppText>
    </View>
  );
}
