import React, {useCallback, useState} from 'react';
import {ScrollView, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppButton} from '@components/AppButton';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {ScreenHeader} from '@components/ScreenHeader';
import {TextField} from '@components/TextField';
import type {HomeStackParamList} from '@/app/navigation/types';
import {parseYouTubeVideoId} from '../api/youtubeApi';
import {useTranslation} from 'react-i18next';
import {useAppTheme} from '@theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'YouTubeInput'>;

export function YouTubeInputScreen({navigation}: Props) {
  const {t} = useTranslation();
  const {theme} = useAppTheme();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!parseYouTubeVideoId(url)) {
      setError(t('errors.youtube_invalid_url'));
      return;
    }
    navigation.navigate('YouTubeProcessing', {url: url.trim()});
  };

  const pasteFromClipboard = useCallback(async () => {
    const value = (await Clipboard.getString()).trim();
    if (!value) {
      setError(t('youtube.input_paste_empty'));
      return;
    }
    setUrl(value);
    setError(null);
  }, [t]);

  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        title={t('youtube.input_title')}
      />
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
        </View>
      </ScrollView>
    </AppScreen>
  );
}
