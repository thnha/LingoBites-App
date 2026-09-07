import React, {useCallback, useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {
  HomeStackParamList,
  LessonsStackParamList,
} from '../../app/navigation/types';
import {AppCard} from '../../components/AppCard';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import {BottomActionBar} from '../../components/BottomActionBar';
import {Chip} from '../../components/Chip';
import {IconButton} from '../../components/IconButton';
import {MaterialIcon} from '../../components/MaterialIcon';
import {ScreenHeader} from '../../components/ScreenHeader';
import {useFeatureEnabled} from '../../release';
import {
  listFlashcards,
  saveFlashcard,
  unsaveFlashcard,
} from '../../shared/db/FlashcardRepository';
import type {FlashcardRecord} from '../../shared/db/types';
import {useAppTheme, type AppTheme} from '../../theme';
import {confirmFirstFlashcardSave} from './flashcardDisclosure';

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'WordDetail'>
  | NativeStackScreenProps<LessonsStackParamList, 'WordDetail'>;

export function WordDetailScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const themedStyles = React.useMemo(() => makeStyles(theme), [theme]);
  const reviewSystemEnabled = useFeatureEnabled('reviewSystem');
  const nav = navigation as NativeStackScreenProps<
    HomeStackParamList,
    'WordDetail'
  >['navigation'];
  const {word, practice, lessonId} = route.params;
  const hasPractice = practice.length > 0;
  const metaParts = [word.word_type, word.ipa].filter(Boolean);
  const [savedFlashcard, setSavedFlashcard] = useState<FlashcardRecord | null>(
    null,
  );

  const refreshSavedFlashcard = useCallback(() => {
    if (!lessonId) {
      setSavedFlashcard(null);
      return;
    }

    setSavedFlashcard(
      listFlashcards({lessonId}).find(card => card.vocabularyId === word.id) ??
        null,
    );
  }, [lessonId, word.id]);

  useEffect(() => {
    refreshSavedFlashcard();
  }, [refreshSavedFlashcard]);

  async function handleToggleSave() {
    if (!lessonId) {
      return;
    }

    if (savedFlashcard) {
      unsaveFlashcard(savedFlashcard.id);
      refreshSavedFlashcard();
      return;
    }

    await confirmFirstFlashcardSave(() => {
      const result = saveFlashcard({lessonId, vocabulary: word});
      if (result.ok) {
        refreshSavedFlashcard();
      }
    });
  }

  const saveAction =
    reviewSystemEnabled && lessonId ? (
      <IconButton
        accessibilityLabel={savedFlashcard ? 'Bỏ lưu từ' : 'Lưu từ'}
        filled={Boolean(savedFlashcard)}
        icon="bookmark"
        onPress={() => void handleToggleSave()}
        tone={savedFlashcard ? 'accent' : 'surface'}
      />
    ) : undefined;

  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        rightAction={saveAction}
        title="Từ vựng"
      />
      <ScrollView
        contentContainerStyle={themedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppCard style={themedStyles.heroCard}>
          {word.cefr_level ? (
            <View style={styles.cefrBadge}>
              <Chip label={word.cefr_level} tone="gold" />
            </View>
          ) : null}
          <AppText style={themedStyles.word}>{word.word}</AppText>
          {metaParts.length > 0 ? (
            <View style={styles.metaRow}>
              {metaParts.map((part, partIndex) => (
                <React.Fragment key={part}>
                  {partIndex > 0 ? <AppText color="muted">•</AppText> : null}
                  <AppText
                    color="secondary"
                    style={
                      part === word.ipa ? styles.normalText : styles.italicText
                    }
                  >
                    {part}
                  </AppText>
                </React.Fragment>
              ))}
            </View>
          ) : null}
          <View style={themedStyles.divider} />
          <AppText style={themedStyles.meaning} variant="h3">
            {word.meaning_vi}
          </AppText>
          {word.phrase_from_text ? (
            <AppText color="muted">
              Trong văn bản: “{word.phrase_from_text}”
            </AppText>
          ) : null}
        </AppCard>

        {word.why_important ? (
          <AppCard style={themedStyles.whyCard}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcon
                color={theme.colors.primary}
                filled
                name="lightbulb"
                size={22}
              />
              <AppText style={themedStyles.whyTitle} variant="h3">
                Vì sao nên học
              </AppText>
            </View>
            <AppText color="secondary">{word.why_important}</AppText>
          </AppCard>
        ) : null}

        {word.example ? (
          <AppCard style={themedStyles.exampleCard}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcon
                color={theme.colors.secondary}
                filled
                name="format_quote"
                size={22}
              />
              <AppText style={themedStyles.exampleTitle} variant="h3">
                Ví dụ
              </AppText>
            </View>
            <View style={themedStyles.exampleQuote}>
              <AppText style={styles.boldText} variant="bodyLg">
                {word.example}
              </AppText>
            </View>
            {word.example_translation ? (
              <AppText color="muted" style={styles.italicText}>
                {word.example_translation}
              </AppText>
            ) : null}
          </AppCard>
        ) : null}
      </ScrollView>
      {hasPractice ? (
        <BottomActionBar style={themedStyles.actionBar}>
          <Pressable
            accessibilityLabel="Luyện từ này"
            accessibilityRole="button"
            onPress={() => nav.navigate('Practice', {questions: practice})}
            style={({pressed}) => [
              themedStyles.practiceButton,
              pressed && themedStyles.pressed,
            ]}
          >
            <MaterialIcon
              color={theme.colors.text.inverse}
              name="fitness_center"
              size={22}
            />
            <AppText style={themedStyles.practiceButtonText}>
              Luyện từ này
            </AppText>
          </Pressable>
        </BottomActionBar>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  boldText: {
    fontWeight: '700',
  },
  cefrBadge: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  italicText: {
    fontStyle: 'italic',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  normalText: {
    fontStyle: 'normal',
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    actionBar: {
      backgroundColor: theme.colors.background,
      borderTopColor: theme.colors.outlineVariant,
      paddingBottom: theme.spacing.lg,
    },
    divider: {
      alignSelf: 'stretch',
      backgroundColor: theme.colors.outlineVariant,
      height: 1,
      marginVertical: theme.spacing.sm,
    },
    exampleCard: {
      borderLeftColor: theme.colors.secondaryContainer,
      borderLeftWidth: 4,
      gap: theme.spacing.sm,
    },
    exampleQuote: {
      backgroundColor: theme.colors.surfaceLow,
      borderLeftColor: theme.colors.secondaryContainer,
      borderLeftWidth: 4,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: theme.spacing.md,
    },
    exampleTitle: {
      color: theme.colors.secondary,
      fontWeight: theme.typography.weight.medium,
    },
    heroCard: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingTop: 30,
    },
    meaning: {
      color: theme.colors.secondary,
      fontWeight: '700',
    },
    practiceButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.lg,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      minHeight: 52,
      opacity: 1,
    },
    practiceButtonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.size.md,
      fontWeight: theme.typography.weight.medium,
    },
    pressed: {
      opacity: theme.states.pressedOpacity,
    },
    scrollContent: {
      gap: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      paddingHorizontal: theme.gutter,
      paddingTop: theme.spacing.sm,
    },
    whyCard: {
      borderLeftColor: theme.colors.accent,
      borderLeftWidth: 4,
      gap: theme.spacing.sm,
    },
    whyTitle: {
      color: theme.colors.primary,
      fontWeight: theme.typography.weight.medium,
    },
    word: {
      color: theme.colors.primary,
      fontSize: 44,
      lineHeight: 48,
    },
  });
}
