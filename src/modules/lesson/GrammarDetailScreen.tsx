import React from 'react';
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
import {LessonExploreRow} from '../../components/LessonExploreRow';
import {MaterialIcon} from '../../components/MaterialIcon';
import {ScreenHeader} from '../../components/ScreenHeader';
import {SectionHeader} from '../../components/SectionHeader';
import type {GrammarPoint} from '../../shared/schemas/ai-output-v1';
import {useAppTheme, type AppTheme} from '../../theme';

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'GrammarDetail'>
  | NativeStackScreenProps<LessonsStackParamList, 'GrammarDetail'>;

export function GrammarDetailScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const themedStyles = React.useMemo(() => makeStyles(theme), [theme]);
  const nav = navigation as NativeStackScreenProps<
    HomeStackParamList,
    'GrammarDetail'
  >['navigation'];
  const {grammar, related, practice} = route.params;
  const hasPractice = practice.length > 0;
  const examples = grammar.examples ?? [];
  const relatedOthers = related.filter(item => item.id !== grammar.id);

  function openRelated(point: GrammarPoint) {
    nav.navigate('GrammarDetail', {
      grammar: point,
      related,
      practice,
    });
  }

  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        rightAction={
          <IconButton
            accessibilityLabel="Phát âm"
            icon="volume_up"
            tone="coral"
          />
        }
        title="Ngữ pháp"
      />
      <ScrollView
        contentContainerStyle={themedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppCard style={themedStyles.heroCard}>
          <View style={styles.heroIcon}>
            <MaterialIcon
              color={theme.colors.accentSoft}
              name="language"
              size={150}
            />
          </View>
          <View style={styles.heroCopy}>
            <Chip label="Ngữ pháp" tone="accent" />
            <AppText style={themedStyles.heroTitle} variant="h1">
              {grammar.name}
            </AppText>
            {grammar.vietnamese_name ? (
              <AppText color="secondary" variant="bodyLg">
                {grammar.vietnamese_name}
              </AppText>
            ) : null}
          </View>

          <View style={styles.contentStack}>
            {grammar.pattern ? (
              <AppCard style={themedStyles.patternCard}>
                <View style={styles.sectionTitleRow}>
                  <MaterialIcon
                    color={theme.colors.primary}
                    name="function"
                    size={20}
                  />
                  <AppText color="muted" variant="caption">
                    CÔNG THỨC
                  </AppText>
                </View>
                <View style={themedStyles.patternBox}>
                  <AppText style={themedStyles.patternText}>
                    {grammar.pattern}
                  </AppText>
                </View>
              </AppCard>
            ) : null}

            <AppCard style={themedStyles.explanationCard}>
              <View style={styles.sectionTitleRow}>
                <MaterialIcon
                  color={theme.colors.tertiary}
                  name="info"
                  size={20}
                />
                <AppText color="muted" variant="caption">
                  GIẢI THÍCH
                </AppText>
              </View>
              <AppText color="secondary">{grammar.explanation_vi}</AppText>
            </AppCard>

            {grammar.found_in ? (
              <AppCard style={themedStyles.foundInCard}>
                <View style={styles.sectionTitleRow}>
                  <MaterialIcon
                    color={theme.colors.secondary}
                    name="history_edu"
                    size={20}
                  />
                  <AppText color="muted" variant="caption">
                    TRONG VĂN BẢN CỦA BẠN
                  </AppText>
                </View>
                <View style={themedStyles.foundInBox}>
                  <AppText style={styles.italicText} variant="bodyLg">
                    {grammar.found_in}
                  </AppText>
                </View>
              </AppCard>
            ) : null}

            {grammar.beginner_tip ? (
              <View style={themedStyles.tipCard}>
                <View style={themedStyles.tipIcon}>
                  <MaterialIcon
                    color={theme.colors.onTertiaryContainer}
                    name="tips_and_updates"
                    size={22}
                  />
                </View>
                <View style={styles.tipCopy}>
                  <AppText style={themedStyles.tipTitle} variant="h3">
                    Mẹo nhỏ
                  </AppText>
                  <AppText style={themedStyles.tipText}>
                    {grammar.beginner_tip}
                  </AppText>
                </View>
              </View>
            ) : null}
          </View>
        </AppCard>

        {examples.length > 0 ? (
          <View style={themedStyles.examplesSection}>
            <SectionHeader title="Ví dụ thêm" />
            {examples.map((example, exampleIndex) => (
              <AppCard
                key={`${exampleIndex}-${example.en}`}
                style={themedStyles.exampleCard}
              >
                <AppText style={styles.boldText} variant="bodyLg">
                  {example.en}
                </AppText>
                <AppText color="muted">{example.vi}</AppText>
              </AppCard>
            ))}
          </View>
        ) : null}

        {relatedOthers.length > 0 ? (
          <View style={styles.relatedSection}>
            <SectionHeader title="Ngữ pháp liên quan" />
            {relatedOthers.map((point, pointIndex) => (
              <LessonExploreRow
                key={point.id}
                icon={pointIndex % 2 === 0 ? 'article' : 'auto_stories'}
                medallionTone={pointIndex % 2 === 0 ? 'teal' : 'coral'}
                onPress={() => openRelated(point)}
                subtitle={point.vietnamese_name ?? point.explanation_vi}
                title={point.name}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
      {hasPractice ? (
        <BottomActionBar style={themedStyles.actionBar}>
          <View style={themedStyles.actionRow}>
            <Pressable
              accessibilityLabel="Luyện ngay"
              accessibilityRole="button"
              onPress={() => nav.navigate('Practice', {questions: practice})}
              style={({pressed}) => [
                themedStyles.practiceButton,
                pressed && themedStyles.pressed,
              ]}
            >
              <MaterialIcon
                color={theme.colors.text.inverse}
                name="play_circle"
                size={22}
              />
              <AppText style={themedStyles.practiceButtonText}>
                Luyện ngay
              </AppText>
            </Pressable>
          </View>
        </BottomActionBar>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  boldText: {
    fontWeight: '700',
  },
  contentStack: {
    gap: 12,
    zIndex: 1,
  },
  heroCopy: {
    gap: 4,
    zIndex: 1,
  },
  heroIcon: {
    position: 'absolute',
    right: -22,
    top: -30,
  },
  italicText: {
    fontStyle: 'italic',
  },
  relatedSection: {
    gap: 10,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tipCopy: {
    flex: 1,
    gap: 4,
  },
});

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    actionBar: {
      backgroundColor: theme.colors.background,
      borderTopColor: theme.colors.outlineVariant,
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing.lg,
    },
    actionRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    exampleCard: {
      gap: theme.spacing.xs,
    },
    examplesSection: {
      gap: theme.spacing.sm,
    },
    explanationCard: {
      backgroundColor: theme.colors.surfaceLow,
      borderColor: theme.colors.tertiarySoft,
      borderWidth: 2,
      gap: theme.spacing.sm,
    },
    foundInBox: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.secondaryContainer,
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: theme.spacing.md,
    },
    foundInCard: {
      backgroundColor: theme.colors.surfaceLow,
      borderColor: theme.colors.secondarySoft,
      borderWidth: 2,
      gap: theme.spacing.sm,
    },
    heroCard: {
      gap: theme.spacing.md,
      overflow: 'hidden',
      position: 'relative',
    },
    heroTitle: {
      color: theme.colors.primary,
    },
    patternBox: {
      backgroundColor: theme.colors.surface,
      borderLeftColor: theme.colors.accent,
      borderLeftWidth: 4,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 10,
    },
    patternCard: {
      backgroundColor: theme.colors.surfaceLow,
      borderColor: theme.colors.accentSoft,
      borderWidth: 2,
      gap: theme.spacing.sm,
    },
    patternText: {
      color: theme.colors.primary,
      fontWeight: '700',
      textAlign: 'center',
    },
    practiceButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.lg,
      flex: 1.4,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      minHeight: 52,
      opacity: 1,
    },
    practiceButtonText: {
      color: theme.colors.text.inverse,
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
    tipCard: {
      alignItems: 'flex-start',
      backgroundColor: theme.colors.tertiarySoft,
      borderColor: theme.colors.tertiaryBorder,
      borderRadius: 18,
      borderWidth: 1,
      flexDirection: 'row',
      gap: theme.spacing.md,
      padding: theme.spacing.lg,
    },
    tipIcon: {
      alignItems: 'center',
      backgroundColor: theme.colors.tertiaryFixed,
      borderRadius: theme.radius.lg,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    tipText: {
      color: theme.colors.onTertiaryContainer,
    },
    tipTitle: {
      color: theme.colors.tertiary,
      fontWeight: theme.typography.weight.medium,
    },
  });
}
