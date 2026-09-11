import React, {useState} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScrollView, StyleSheet} from 'react-native';
import {AppButton} from '@components/AppButton';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {ScreenHeader} from '@components/ScreenHeader';
import {TextField} from '@components/TextField';
import type {HomeStackParamList} from '@/app/navigation/types';
import {parseManualTranscript} from '../transcript/parser';
import {useTranslation} from 'react-i18next';
import {useAppTheme} from '@theme';

type Props = NativeStackScreenProps<
  HomeStackParamList,
  'YouTubeManualTranscript'
>;
export function YouTubeManualTranscriptScreen({navigation, route}: Props) {
  const {t} = useTranslation();
  const {theme} = useAppTheme();
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
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{
          gap: theme.spacing.md,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
          style={styles.textField}
        />
        <AppButton
          title={t('youtube.submit_transcript')}
          onPress={submit}
          testID="youtube-manual-submit"
        />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  textField: {
    maxHeight: 280,
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
