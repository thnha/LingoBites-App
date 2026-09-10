import React, {useState} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppButton} from '@components/AppButton';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {ScreenHeader} from '@components/ScreenHeader';
import {TextField} from '@components/TextField';
import type {HomeStackParamList} from '@/app/navigation/types';
import {parseManualTranscript} from '../transcript/parser';
import {useTranslation} from 'react-i18next';

type Props = NativeStackScreenProps<
  HomeStackParamList,
  'YouTubeManualTranscript'
>;
export function YouTubeManualTranscriptScreen({navigation, route}: Props) {
  const {t} = useTranslation();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    try {
      const cues = parseManualTranscript(text);
      navigation.replace('YouTubeProcessing', {
        url: route.params.url,
        manualCues: cues,
      });
    } catch {
      setError(t('errors.transcript_unparsable'));
    }
  };
  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        title={t('youtube.manual_title')}
      />
      <AppText variant="h2">{t('youtube.manual_prompt')}</AppText>
      <AppText color="secondary">{t('youtube.manual_example')}</AppText>
      <TextField
        multiline
        label={t('youtube.transcript_label')}
        value={text}
        onChangeText={value => {
          setText(value);
          setError(null);
        }}
        placeholder={'0:00 Hello there\n0:04 How are you?'}
        hasError={!!error}
        errorMessage={error ?? undefined}
      />
      <AppButton
        title={t('youtube.submit_transcript')}
        onPress={submit}
        testID="youtube-manual-submit"
      />
    </AppScreen>
  );
}
