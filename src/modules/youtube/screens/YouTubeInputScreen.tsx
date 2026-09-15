import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import type {NavigationProp} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppButton} from '@components/AppButton';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {ScreenHeader} from '@components/ScreenHeader';
import {TextField} from '@components/TextField';
import type {
  CreateStackParamList,
  RootStackParamList,
  RootTabParamList,
} from '@/app/navigation/types';
import {
  YOUTUBE_MAX_DURATION_SECONDS,
  YOUTUBE_MAX_SEGMENTS,
} from '@shared/schemas/youtube-transcript-v1';
import {parseYouTubeVideoId} from '../api/youtubeApi';
import {ensureYouTubeDisclosureAcknowledged} from '../utils/youtubeDisclosure';
import {useTranslation} from 'react-i18next';
import {useAppTheme} from '@theme';

type Props = NativeStackScreenProps<CreateStackParamList, 'YouTubeInput'>;

export function YouTubeInputScreen({navigation, route}: Props) {
  const {t} = useTranslation();
  const {theme} = useAppTheme();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  // SETE-283 (HVB-04): same entry-from-Home contract as YouTubeHistory —
  // Back returns to Home, never to CreateMain.
  // SETE-287: reset (not popToTop) so a depth-1 direct entry from Home
  // leaves no stale nested state behind.
  const exitToHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{name: 'CreateMain'}],
    });
    navigation.getParent<NavigationProp<RootTabParamList>>()?.navigate('Home');
  }, [navigation]);

  const goBack = useCallback(() => {
    if (route.params?.fromHome === true) {
      exitToHome();
      return;
    }
    // SETE-310: when this screen is the only route in the Create stack
    // (e.g. restored state), goBack() is a no-op that strands the user
    // with no path back to the composer — fall back to CreateMain.
    if (navigation.canGoBack?.() ?? true) {
      navigation.goBack();
      return;
    }
    navigation.navigate('CreateMain');
  }, [navigation, route.params, exitToHome]);

  // SETE-289: the header Back button is not the only way out. The iOS
  // swipe gesture is disabled for this screen (see AppNavigator), but the
  // Android system Back and any other native pop bypass onBack and would
  // land on CreateMain, dropping the fromHome contract. Intercept those
  // pops so every exit honors it. Non-POP removals (e.g. our own reset)
  // and non-fromHome entries pass through untouched.
  useEffect(() => {
    if (route.params?.fromHome !== true) {
      return undefined;
    }
    return navigation.addListener('beforeRemove', e => {
      if (e.data.action.type !== 'POP') {
        return;
      }
      e.preventDefault();
      exitToHome();
    });
  }, [navigation, route.params, exitToHome]);

  // SETE-283 (HVB-08a): the first submit requires explicit privacy
  // consent — the transcript leaves the device for translation/IPA.
  // Later submits skip the disclosure.
  const submit = async () => {
    if (!parseYouTubeVideoId(url)) {
      setError(t('errors.youtube_invalid_url'));
      return;
    }
    const acknowledged = await ensureYouTubeDisclosureAcknowledged({
      title: t('youtube.disclosure_title'),
      body: t('youtube.disclosure_body'),
      confirmLabel: t('youtube.disclosure_confirm'),
      cancelLabel: t('youtube.disclosure_cancel'),
    });
    if (!acknowledged) {
      return;
    }
    navigation.navigate('YouTubeProcessing', {url: url.trim()});
  };

  const pasteFromClipboard = useCallback(async () => {
    // Lazy-load the clipboard module: the native RNCClipboard TurboModule is
    // absent in binaries built before `pod install`, and a top-level import
    // crashes the whole bundle at startup. Loading it here keeps the screen
    // usable and degrades only the paste action when native linking is
    // missing.
    let clipboardText: string | null = null;
    try {
      const ClipboardModule = require('@react-native-clipboard/clipboard');
      const getString =
        ClipboardModule?.default?.getString ?? ClipboardModule?.getString;
      if (typeof getString !== 'function') {
        throw new Error('clipboard unavailable');
      }
      clipboardText = await getString();
    } catch {
      setError(t('youtube.input_paste_unavailable'));
      return;
    }
    const value = (clipboardText ?? '').trim();
    if (!value) {
      setError(t('youtube.input_paste_empty'));
      return;
    }
    setUrl(value);
    setError(null);
  }, [t]);

  return (
    <AppScreen>
      <ScreenHeader onBack={goBack} title={t('youtube.input_title')} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          gap: theme.spacing.lg,
          justifyContent: 'center',
          padding: theme.gutter,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <AppText color="secondary">{t('youtube.input_description')}</AppText>
        <AppText color="muted" variant="caption">
          {t('youtube.input_expectation')}
        </AppText>
        <AppText color="muted" testID="youtube-input-limits" variant="caption">
          {t('youtube.input_limits', {
            maxMinutes: Math.floor(YOUTUBE_MAX_DURATION_SECONDS / 60),
            maxSegments: YOUTUBE_MAX_SEGMENTS,
          })}
        </AppText>
        <TextField
          autoCapitalize="none"
          hasError={!!error}
          errorMessage={error ?? undefined}
          keyboardType="url"
          label={t('youtube.url_label')}
          onChangeText={value => {
            setUrl(value);
            setError(null);
          }}
          placeholder="https://www.youtube.com/watch?v=…"
          testID="youtube-url-input"
          value={url}
        />
        <View style={{gap: theme.spacing.sm}}>
          <AppButton
            iconLeft="content_paste"
            onPress={() => void pasteFromClipboard()}
            testID="youtube-paste-url"
            title={t('youtube.input_paste')}
            variant="outline"
          />
          <AppButton
            onPress={submit}
            testID="youtube-submit"
            title={t('youtube.start')}
          />
          <AppButton
            // SETE-289: History is a RootStack route above the tabs —
            // reach it through the tab parent so the stack-id lookup
            // stays type-safe (screen nav props carry no navigator id).
            onPress={() =>
              navigation
                .getParent<NavigationProp<RootTabParamList>>()
                ?.getParent<NavigationProp<RootStackParamList>>('RootStack')
                ?.navigate('YouTubeHistory')
            }
            testID="youtube-open-history"
            title={t('youtube.open_history')}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}
