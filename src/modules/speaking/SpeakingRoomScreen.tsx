import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import type {LessonsStackParamList} from '@/app/navigation/types';
import {AppCard} from '@components/AppCard';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {Chip} from '@components/Chip';
import {ScreenHeader} from '@components/ScreenHeader';
import {useAppTheme} from '@theme';
import {listSpeakingRoomModes} from './speakingModes';
import type {SpeakingModeInfo} from './speakingModes';

type Props = NativeStackScreenProps<LessonsStackParamList, 'SpeakingRoom'>;

/**
 * Speaking Room mode list (REQ-23, VC-17). All six required modes are always
 * shown; a mode without installed content shows the "not available yet"
 * state instead of a broken/empty screen.
 */
export function SpeakingRoomScreen({navigation}: Props) {
  const {theme} = useAppTheme();
  const [modes, setModes] = React.useState<SpeakingModeInfo[]>(() =>
    listSpeakingRoomModes(),
  );

  useFocusEffect(
    React.useCallback(() => {
      setModes(listSpeakingRoomModes());
    }, []),
  );

  function handlePressMode(mode: SpeakingModeInfo) {
    if (!mode.available) {
      return;
    }
    if (mode.mode === 'shadowing') {
      navigation.navigate('SpeakingShadowing');
    }
  }

  return (
    <AppScreen>
      <ScreenHeader
        title="Phòng luyện nói"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.md,
          paddingBottom: 28,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        showsVerticalScrollIndicator={false}
      >
        {modes.map(mode => (
          <Pressable
            key={mode.mode}
            accessibilityLabel={mode.titleVi}
            accessibilityRole="button"
            disabled={!mode.available}
            onPress={() => handlePressMode(mode)}
            style={({pressed}) => ({
              opacity: !mode.available
                ? 0.6
                : pressed
                ? theme.states.pressedOpacity
                : 1,
            })}
          >
            <AppCard style={{gap: theme.spacing.xs}}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <AppText variant="h3">{mode.titleVi}</AppText>
                {mode.available ? null : (
                  <Chip label="Chưa có sẵn" tone="neutral" />
                )}
              </View>
              <AppText color="secondary">{mode.descriptionVi}</AppText>
            </AppCard>
          </Pressable>
        ))}
      </ScrollView>
    </AppScreen>
  );
}
