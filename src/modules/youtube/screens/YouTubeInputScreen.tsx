import React, {useState} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppButton} from '@components/AppButton';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {ScreenHeader} from '@components/ScreenHeader';
import {TextField} from '@components/TextField';
import type {HomeStackParamList} from '@/app/navigation/types';
import {parseYouTubeVideoId} from '../api/youtubeApi';
import {useTranslation} from 'react-i18next';

type Props = NativeStackScreenProps<HomeStackParamList, 'YouTubeInput'>;
export function YouTubeInputScreen({navigation}: Props) {
  const {t} = useTranslation();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    if (!parseYouTubeVideoId(url)) {
      setError(t('errors.youtube_invalid_url'));
      return;
    }
    navigation.navigate('YouTubeProcessing', {url: url.trim()});
  };
  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        title={t('youtube.input_title')}
      />
      <AppText color="secondary">{t('youtube.input_description')}</AppText>
      <TextField
        label={t('youtube.url_label')}
        onChangeText={value => {
          setUrl(value);
          setError(null);
        }}
        value={url}
        placeholder="https://www.youtube.com/watch?v=…"
        autoCapitalize="none"
        keyboardType="url"
        hasError={!!error}
        errorMessage={error ?? undefined}
      />
      <AppButton
        title={t('youtube.start')}
        onPress={submit}
        testID="youtube-submit"
      />
    </AppScreen>
  );
}
