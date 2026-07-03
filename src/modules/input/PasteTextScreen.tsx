import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../app/navigation/types';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import {BottomActionBar} from '../../components/BottomActionBar';
import {Chip} from '../../components/Chip';
import {ErrorCard} from '../../components/ErrorCard';
import {MaterialIcon} from '../../components/MaterialIcon';
import {ScreenHeader} from '../../components/ScreenHeader';
import {TextField} from '../../components/TextField';
import {RETRY_ACTION_LABEL} from '../../shared/copy/userMessages';
import {useAppTheme} from '../../theme';
import {getTextLengthBucket, trackEvent} from '../analytics';
import {validateConfirmedText} from './textValidation';

type Props = NativeStackScreenProps<HomeStackParamList, 'PasteText'>;

type ScreenState = {type: 'input'} | {type: 'error'; message: string};

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

export function PasteTextScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const [text, setText] = useState(
    'We are offering a special discount for new customers.',
  );
  const [screenState, setScreenState] = useState<ScreenState>({type: 'input'});
  const wordCount = useMemo(() => countWords(text), [text]);

  // Lỗi phân tích được màn "Đang phân tích" trả về qua param khi quay lại đây.
  const analyzeError = route.params?.analyzeError;
  useEffect(() => {
    if (analyzeError) {
      setScreenState({type: 'error', message: analyzeError});
      navigation.setParams({analyzeError: undefined});
    }
  }, [analyzeError, navigation]);

  function handleAnalyze() {
    const validation = validateConfirmedText(text);
    if (!validation.valid) {
      setScreenState({type: 'error', message: validation.message});
      return;
    }

    setScreenState({type: 'input'});
    trackEvent('text_entered', {
      text_length_bucket: getTextLengthBucket(validation.value.length),
    });
    trackEvent('text_confirmed', {
      source_type: 'paste_text',
      text_length_bucket: getTextLengthBucket(validation.value.length),
      edited_after_ocr: false,
    });

    navigation.navigate('Analyzing', {
      confirmedText: validation.value,
      sourceType: 'paste_text',
      origin: 'PasteText',
    });
  }

  return (
    <AppScreen>
      <ScreenHeader onBack={() => navigation.goBack()} title="Dán text" />
      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <AppText color="secondary" variant="body">
          Dán hoặc nhập đoạn tiếng Anh — bài viết, thực đơn, tin nhắn — app sẽ biến
          thành bài học.
        </AppText>

        <TextField
          multiline
          onChangeText={value => {
            setText(value);
            if (screenState.type === 'error') {
              setScreenState({type: 'input'});
            }
          }}
          placeholder="Dán đoạn text của bạn vào đây…"
          style={{
            borderColor: theme.colors.accentSoft,
            borderRadius: 20,
            borderWidth: 2,
            minHeight: 150,
            textAlignVertical: 'top',
          }}
          value={text}
        />

        <View style={{alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
          <Chip
            label="Phát hiện: Tiếng Anh"
            tone="accentSoft"
          />
          <Chip label={`${wordCount} từ`} tone="neutral" />
        </View>

        {screenState.type === 'error' ? (
          <ErrorCard
            message={screenState.message}
            onRetry={handleAnalyze}
            retryLabel={RETRY_ACTION_LABEL}
          />
        ) : null}
      </ScrollView>

      <BottomActionBar
        style={{
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.outlineVariant,
          paddingBottom: theme.spacing.lg,
        }}>
        <Pressable
          accessibilityLabel="Trích xuất từ vựng"
          accessibilityRole="button"
          onPress={handleAnalyze}
          style={({pressed}) => [
            {
              alignItems: 'center',
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.lg,
              flexDirection: 'row',
              gap: 8,
              justifyContent: 'center',
              minHeight: 52,
              opacity: pressed ? theme.states.pressedOpacity : 1,
            },
          ]}>
          <MaterialIcon color={theme.colors.text.inverse} name="auto_stories" size={22} />
          <AppText style={{color: theme.colors.text.inverse, fontSize: 18, fontWeight: '600'}}>
            Trích xuất từ vựng
          </AppText>
        </Pressable>
      </BottomActionBar>
    </AppScreen>
  );
}
