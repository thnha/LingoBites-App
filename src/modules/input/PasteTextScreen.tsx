import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {CreateStackParamList} from '@/app/navigation/types';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {BottomActionBar} from '@components/BottomActionBar';
import {Chip} from '@components/Chip';
import {ErrorCard} from '@components/ErrorCard';
import {MaterialIcon} from '@components/MaterialIcon';
import {PrimaryActionButton} from '@components/PrimaryActionButton';
import {ScreenHeader} from '@components/ScreenHeader';
import {TextField} from '@components/TextField';
import {useTranslation} from 'react-i18next';
import {useAppTheme} from '@theme';
import {getTextLengthBucket, trackEvent} from '../analytics';
import {validateConfirmedText} from '@shared/utils/textValidation';
import {useFeatureFlags} from '@/release';
import {
  resolveLessonDestination,
  startLessonFromConfirmedText,
} from '@shared/lesson/startLessonFromConfirmedText';

type Props = NativeStackScreenProps<CreateStackParamList, 'PasteText'>;

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
  const {t} = useTranslation();
  const {config} = useFeatureFlags();
  const [text, setText] = useState('');
  const [screenState, setScreenState] = useState<ScreenState>({type: 'input'});
  const [creating, setCreating] = useState(false);
  const wordCount = useMemo(() => countWords(text), [text]);

  // Lỗi phân tích được màn "Đang phân tích" trả về qua param khi quay lại đây.
  const analyzeError = route.params?.analyzeError;
  useEffect(() => {
    if (analyzeError) {
      setScreenState({type: 'error', message: analyzeError});
      navigation.setParams({analyzeError: undefined});
    }
  }, [analyzeError, navigation]);

  async function handleAnalyze() {
    if (creating) return;
    const validation = validateConfirmedText(text);
    if (!validation.valid) {
      setScreenState({type: 'error', message: validation.message});
      return;
    }

    trackEvent('text_entered', {
      text_length_bucket: getTextLengthBucket(validation.value.length),
    });
    trackEvent('text_confirmed', {
      source_type: 'paste_text',
      text_length_bucket: getTextLengthBucket(validation.value.length),
      edited_after_ocr: false,
    });

    const destination = resolveLessonDestination(config.features);
    if (destination === 'v1_analyze') {
      setScreenState({type: 'input'});
    } else {
      setCreating(true);
      setScreenState({type: 'input'});
    }

    const result = await startLessonFromConfirmedText({
      confirmedText: validation.value,
      sourceType: 'paste_text',
      destination,
      origin: 'PasteText',
      navigate: (screen, params) => {
        if (screen === 'Analyzing' && 'confirmedText' in params) {
          navigation.navigate('Analyzing', params);
        } else if (screen === 'ProgressiveLesson' && 'lessonId' in params) {
          navigation.navigate('ProgressiveLesson', params);
        }
      },
    });

    if (!result.ok) {
      setScreenState({type: 'error', message: result.message});
    }
    setCreating(false);
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
        showsVerticalScrollIndicator={false}
      >
        <AppText color="secondary" variant="body">
          Dán hoặc nhập đoạn tiếng Anh — bài viết, thực đơn, tin nhắn — app sẽ
          biến thành bài học.
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

        <Pressable
          accessibilityLabel="Xóa văn bản"
          accessibilityRole="button"
          disabled={!text}
          onPress={() => {
            setText('');
            setScreenState({type: 'input'});
          }}
          style={({pressed}) => ({
            alignItems: 'center',
            alignSelf: 'flex-end',
            flexDirection: 'row',
            gap: 6,
            minHeight: 44,
            opacity: !text || pressed ? theme.states.pressedOpacity : 1,
            paddingHorizontal: theme.spacing.sm,
          })}
        >
          <MaterialIcon color={theme.colors.primary} name="delete" size={20} />
          <AppText style={{color: theme.colors.primary, fontWeight: '600'}}>
            Xóa văn bản
          </AppText>
        </Pressable>

        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <Chip label="Phát hiện: Tiếng Anh" tone="accentSoft" />
          <Chip label={`${wordCount} từ`} tone="neutral" />
          <Chip label={`${text.trim().length} ký tự`} tone="neutral" />
        </View>

        {screenState.type === 'error' ? (
          <ErrorCard
            message={screenState.message}
            onRetry={() => void handleAnalyze()}
            retryLabel={t('common.retry')}
          />
        ) : null}
      </ScrollView>

      <BottomActionBar
        style={{
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.outlineVariant,
          paddingBottom: theme.spacing.lg,
        }}
      >
        <PrimaryActionButton
          accessibilityLabel="Trích xuất từ vựng"
          disabled={creating}
          onPress={() => void handleAnalyze()}
          label={creating ? 'Đang khởi tạo bài học…' : 'Trích xuất từ vựng'}
        />
      </BottomActionBar>
    </AppScreen>
  );
}
