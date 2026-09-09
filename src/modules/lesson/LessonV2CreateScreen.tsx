import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '@/app/navigation/types';
import {AppButton} from '@components/AppButton';
import {AppCard} from '@components/AppCard';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {ErrorCard} from '@components/ErrorCard';
import {ScreenHeader} from '@components/ScreenHeader';
import {createLessonV2Skeleton} from '@shared/api/lessonV2Client';
import {useAppTheme, type AppTheme} from '@theme';

const SAMPLES = [
  {
    title: 'Anna in Hanoi',
    text: 'Anna lives in Hanoi. She works at a small cafe near the lake. Every morning, she prepares fresh coffee for regular customers. People love visiting her quiet cafe.',
  },
  {
    title: 'Language Learning',
    text: 'Learning a new language opens up exciting opportunities. When you practice every day, your vocabulary expands rapidly and speaking becomes natural.',
  },
  {
    title: 'Weekend Plan',
    text: 'This weekend, my family will visit a botanical garden. We want to see the blooming flowers and enjoy a peaceful picnic under the trees.',
  },
];

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

export function LessonV2CreateScreen() {
  const {theme} = useAppTheme();
  const themedStyles = useMemo(() => makeStyles(theme), [theme]);
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const [text, setText] = useState(SAMPLES[0].text);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wordCount = useMemo(() => countWords(text), [text]);
  const isTooLong = wordCount > 500;
  const isEmpty = wordCount === 0;

  async function handleCreate() {
    if (isEmpty || isTooLong || submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await createLessonV2Skeleton({
        confirmedText: text.trim(),
        sourceType: 'paste_text',
      });

      if (!result.ok) {
        setErrorMessage(result.message || 'Không thể tạo bài học V2.');
        return;
      }

      navigation.navigate('ProgressiveLesson', {
        lessonId: result.lesson.lesson_id,
        initialLesson: result.lesson,
      });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Lỗi kết nối tới máy chủ.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        title="Tạo bài học V2 (Beta)"
      />
      <ScrollView
        contentContainerStyle={themedStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AppCard style={themedStyles.infoCard}>
          <AppText variant="h3">Luồng học tiến trình (Progressive)</AppText>
          <AppText color="secondary" variant="caption">
            Bài học sẽ tách câu ngay lập tức để bạn học ngay, trong khi từ vựng,
            phiên âm IPA, ngữ pháp và bài tập được tải bổ sung ở chế độ nền.
          </AppText>
        </AppCard>

        {errorMessage ? (
          <ErrorCard message={errorMessage} onRetry={handleCreate} />
        ) : null}

        <View style={themedStyles.sampleSection}>
          <AppText variant="label">Đoạn văn mẫu nhanh:</AppText>
          <View style={themedStyles.chipRow}>
            {SAMPLES.map(sample => (
              <AppButton
                key={sample.title}
                onPress={() => {
                  setText(sample.text);
                  setErrorMessage(null);
                }}
                style={themedStyles.chipButton}
                title={sample.title}
                variant={text === sample.text ? 'primary' : 'secondary'}
              />
            ))}
          </View>
        </View>

        <AppCard style={themedStyles.inputCard}>
          <TextInput
            multiline
            numberOfLines={6}
            onChangeText={setText}
            placeholder="Nhập hoặc dán văn bản tiếng Anh (tối đa 500 từ)..."
            placeholderTextColor={theme.colors.text.secondary}
            style={themedStyles.textInput}
            testID="lesson-v2-input-text"
            value={text}
          />
          <View style={themedStyles.inputFooter}>
            <AppText
              color={isTooLong ? 'danger' : 'secondary'}
              variant="caption"
            >
              {wordCount} / 500 từ
            </AppText>
          </View>
        </AppCard>

        <AppButton
          accessibilityLabel="Bắt đầu bài học V2"
          disabled={isEmpty || isTooLong || submitting}
          loading={submitting}
          onPress={handleCreate}
          testID="lesson-v2-submit-button"
          title={submitting ? 'Đang khởi tạo…' : 'Bắt đầu bài học V2'}
          variant="primary"
        />
      </ScrollView>
    </AppScreen>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    scrollContent: {
      gap: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
    infoCard: {
      backgroundColor: theme.colors.surfaceMuted,
      gap: 6,
    },
    sampleSection: {
      gap: theme.spacing.xs,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    chipButton: {
      paddingHorizontal: 12,
      height: 36,
    },
    inputCard: {
      padding: theme.spacing.sm,
    },
    textInput: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.size.md,
      lineHeight: 22,
      minHeight: 140,
      textAlignVertical: 'top',
    },
    inputFooter: {
      alignItems: 'flex-end',
      borderTopColor: theme.colors.surfaceMuted,
      borderTopWidth: 1,
      paddingTop: theme.spacing.xs,
    },
  });
}
