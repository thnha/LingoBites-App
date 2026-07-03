import React, {useEffect, useMemo, useState} from 'react';
import {Image, Pressable, ScrollView, View} from 'react-native';
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
import {
  MAX_INPUT_TEXT_LENGTH,
  OCR_LOW_CONFIDENCE_MESSAGE,
  OCR_NOT_ENGLISH_MESSAGE,
  RETRY_ACTION_LABEL,
} from '../../shared/copy/userMessages';
import {useAppTheme} from '../../theme';
import {getTextLengthBucket, trackEvent} from '../analytics';
import {validateConfirmedText} from '../input/textValidation';
import {extractText} from './OCRService';

type Props = NativeStackScreenProps<HomeStackParamList, 'OCRReview'>;

type ScreenState = {type: 'input'} | {type: 'error'; message: string};

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

export function OCRReviewScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const {
    imageUri,
    fileName,
    mimeType,
    width,
    height,
    sourceType,
    extractedText,
    warnings = [],
    analyzeError,
  } = route.params;

  const [text, setText] = useState(extractedText ?? '');
  const [screenState, setScreenState] = useState<ScreenState>({type: 'input'});
  const [isRetryingOcr, setIsRetryingOcr] = useState(false);
  const initialExtractedText = extractedText ?? '';
  const wordCount = useMemo(() => countWords(text), [text]);

  // Lỗi phân tích được màn "Đang phân tích" trả về qua param khi quay lại đây.
  useEffect(() => {
    if (analyzeError) {
      setScreenState({type: 'error', message: analyzeError});
      navigation.setParams({analyzeError: undefined});
    }
  }, [analyzeError, navigation]);

  const advisoryMessages = useMemo(() => {
    const messages: string[] = [];
    if (warnings.includes('low_confidence_image')) {
      messages.push(OCR_LOW_CONFIDENCE_MESSAGE);
    }
    if (warnings.includes('may_not_be_english')) {
      messages.push(OCR_NOT_ENGLISH_MESSAGE);
    }
    return messages;
  }, [warnings]);

  function handleAnalyze() {
    const validation = validateConfirmedText(text);
    if (!validation.valid) {
      setScreenState({type: 'error', message: validation.message});
      return;
    }

    setScreenState({type: 'input'});
    trackEvent('text_confirmed', {
      source_type: sourceType,
      text_length_bucket: getTextLengthBucket(validation.value.length),
      edited_after_ocr: validation.value.trim() !== initialExtractedText.trim(),
    });

    navigation.navigate('Analyzing', {
      confirmedText: validation.value,
      sourceType,
      origin: 'OCRReview',
    });
  }

  async function handleRetryOcr() {
    setIsRetryingOcr(true);
    setScreenState({type: 'input'});

    const result = await extractText({
      uri: imageUri,
      fileName,
      type: mimeType,
      width,
      height,
      sourceType,
    });

    setIsRetryingOcr(false);

    if (!result.ok) {
      setScreenState({type: 'error', message: result.message});
      return;
    }

    setText(result.extractedText);
  }

  const busy = isRetryingOcr;

  return (
    <AppScreen>
      <ScreenHeader onBack={() => navigation.goBack()} title="Kiểm tra text" />
      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceLow,
            borderColor: theme.colors.accentSoft,
            borderRadius: 20,
            borderWidth: 2,
            overflow: 'hidden',
          }}>
          <Image
            resizeMode="cover"
            source={{uri: imageUri}}
            style={{height: 180, width: '100%'}}
          />
        </View>

        <AppText color="secondary" variant="body">
          Kiểm tra và chỉnh sửa trước khi phân tích. App chỉ gửi text bạn xác nhận cho AI.
        </AppText>

        <TextField
          multiline
          onChangeText={value => {
            setText(value);
            if (screenState.type === 'error') {
              setScreenState({type: 'input'});
            }
          }}
          placeholder="Chỉnh sửa đoạn tiếng Anh..."
          style={{
            borderColor: theme.colors.accentSoft,
            borderRadius: 20,
            borderWidth: 2,
            minHeight: 180,
            textAlignVertical: 'top',
          }}
          value={text}
        />

        <View style={{alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
          <Chip label="Text từ ảnh" tone="accentSoft" />
          <Chip label={`${wordCount} từ`} tone="neutral" />
          <Chip label={`${text.trim().length}/${MAX_INPUT_TEXT_LENGTH}`} tone="neutral" />
        </View>

        {advisoryMessages.map(message => (
          <AppText key={message} style={{color: theme.colors.secondary}}>
            {message}
          </AppText>
        ))}

        {screenState.type === 'error' ? (
          <ErrorCard
            message={screenState.message}
            onRetry={handleAnalyze}
            retryLabel={RETRY_ACTION_LABEL}
          />
        ) : null}

        <Pressable
          accessibilityLabel="Thử OCR lại"
          accessibilityRole="button"
          disabled={busy}
          onPress={() => void handleRetryOcr()}
          style={({pressed}) => [
            {
              alignItems: 'center',
              alignSelf: 'center',
              flexDirection: 'row',
              gap: 6,
              opacity: busy || pressed ? theme.states.pressedOpacity : 1,
              paddingVertical: theme.spacing.sm,
            },
          ]}>
          <MaterialIcon color={theme.colors.primary} name="document_scanner" size={20} />
          <AppText style={{color: theme.colors.primary, fontWeight: '600'}}>
            {isRetryingOcr ? 'Đang nhận diện lại...' : 'Thử OCR lại'}
          </AppText>
        </Pressable>
      </ScrollView>

      <BottomActionBar
        style={{
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.outlineVariant,
          paddingBottom: theme.spacing.lg,
        }}>
        <Pressable
          accessibilityLabel="Phân tích & học ngay"
          accessibilityRole="button"
          disabled={busy}
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
              opacity: busy || pressed ? theme.states.pressedOpacity : 1,
            },
          ]}>
          <MaterialIcon color={theme.colors.text.inverse} name="auto_stories" size={22} />
          <AppText style={{color: theme.colors.text.inverse, fontSize: 18, fontWeight: '600'}}>
            Phân tích & học ngay
          </AppText>
        </Pressable>
      </BottomActionBar>
    </AppScreen>
  );
}
