import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
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
import {useAppTheme} from '../../theme';

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'GrammarDetail'>
  | NativeStackScreenProps<LessonsStackParamList, 'GrammarDetail'>;

export function GrammarDetailScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const nav = navigation as NativeStackScreenProps<HomeStackParamList, 'GrammarDetail'>['navigation'];
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
            filled
            icon="volume_up"
            tone="coral"
          />
        }
        title="Ngữ pháp"
      />
      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        showsVerticalScrollIndicator={false}>
        <AppCard style={{gap: theme.spacing.md, overflow: 'hidden', position: 'relative'}}>
          <View style={{position: 'absolute', right: -22, top: -30}}>
            <MaterialIcon color={theme.colors.accentSoft} name="language" size={150} />
          </View>
          <View style={{gap: 4, zIndex: 1}}>
            <Chip label="Ngữ pháp" tone="accent" />
            <AppText style={{color: theme.colors.primary}} variant="h1">
              {grammar.name}
            </AppText>
            {grammar.vietnamese_name ? (
              <AppText color="secondary" variant="bodyLg">
                {grammar.vietnamese_name}
              </AppText>
            ) : null}
          </View>

          <View style={{gap: 12, zIndex: 1}}>
            {grammar.pattern ? (
              <AppCard
                style={{
                  backgroundColor: theme.colors.surfaceLow,
                  borderColor: theme.colors.accentSoft,
                  borderWidth: 2,
                  gap: theme.spacing.sm,
                }}>
                <View style={{alignItems: 'center', flexDirection: 'row', gap: 8}}>
                  <MaterialIcon color={theme.colors.primary} name="function" size={20} />
                  <AppText color="muted" variant="caption">
                    CÔNG THỨC
                  </AppText>
                </View>
                <View
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderLeftColor: theme.colors.accent,
                    borderLeftWidth: 4,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}>
                  <AppText
                    style={{
                      color: theme.colors.primary,
                      fontWeight: '700',
                      textAlign: 'center',
                    }}>
                    {grammar.pattern}
                  </AppText>
                </View>
              </AppCard>
            ) : null}

            <AppCard
              style={{
                backgroundColor: theme.colors.surfaceLow,
                borderColor: theme.colors.tertiarySoft,
                borderWidth: 2,
                gap: theme.spacing.sm,
              }}>
              <View style={{alignItems: 'center', flexDirection: 'row', gap: 8}}>
                <MaterialIcon color={theme.colors.tertiary} name="info" size={20} />
                <AppText color="muted" variant="caption">
                  GIẢI THÍCH
                </AppText>
              </View>
              <AppText color="secondary">{grammar.explanation_vi}</AppText>
            </AppCard>

            {grammar.found_in ? (
              <AppCard
                style={{
                  backgroundColor: theme.colors.surfaceLow,
                  borderColor: theme.colors.secondarySoft,
                  borderWidth: 2,
                  gap: theme.spacing.sm,
                }}>
                <View style={{alignItems: 'center', flexDirection: 'row', gap: 8}}>
                  <MaterialIcon color={theme.colors.secondary} name="history_edu" size={20} />
                  <AppText color="muted" variant="caption">
                    TRONG VĂN BẢN CỦA BẠN
                  </AppText>
                </View>
                <View
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.secondaryContainer,
                    borderRadius: 10,
                    borderWidth: 1,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  }}>
                  <AppText style={{fontStyle: 'italic'}} variant="bodyLg">
                    {grammar.found_in}
                  </AppText>
                </View>
              </AppCard>
            ) : null}

            {grammar.beginner_tip ? (
              <View
                style={{
                  alignItems: 'flex-start',
                  backgroundColor: theme.colors.tertiarySoft,
                  borderColor: 'rgba(255,226,76,0.45)',
                  borderRadius: 18,
                  borderWidth: 1,
                  flexDirection: 'row',
                  gap: 12,
                  padding: 16,
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: theme.colors.tertiaryFixed,
                    borderRadius: 12,
                    height: 42,
                    justifyContent: 'center',
                    width: 42,
                  }}>
                  <MaterialIcon
                    color={theme.colors.onTertiaryContainer}
                    filled
                    name="tips_and_updates"
                    size={22}
                  />
                </View>
                <View style={{flex: 1, gap: 4}}>
                  <AppText style={{color: theme.colors.tertiary, fontWeight: '600'}} variant="h3">
                    Mẹo nhỏ
                  </AppText>
                  <AppText style={{color: theme.colors.onTertiaryContainer}}>
                    {grammar.beginner_tip}
                  </AppText>
                </View>
              </View>
            ) : null}
          </View>
        </AppCard>

        {examples.length > 0 ? (
          <View style={{gap: theme.spacing.sm}}>
            <SectionHeader title="Ví dụ thêm" />
            {examples.map((example, exampleIndex) => (
              <AppCard key={`${exampleIndex}-${example.en}`} style={{gap: theme.spacing.xs}}>
                <AppText style={{fontWeight: '700'}} variant="bodyLg">
                  {example.en}
                </AppText>
                <AppText color="muted">{example.vi}</AppText>
              </AppCard>
            ))}
          </View>
        ) : null}

        {relatedOthers.length > 0 ? (
          <View style={{gap: 10}}>
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
        <BottomActionBar
          style={{
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.outlineVariant,
            gap: theme.spacing.sm,
            paddingBottom: theme.spacing.lg,
          }}>
          <View style={{flexDirection: 'row', gap: theme.spacing.sm}}>
            <Pressable
              accessibilityLabel="Luyện ngay"
              accessibilityRole="button"
              onPress={() => nav.navigate('Practice', {questions: practice})}
              style={({pressed}) => [
                {
                  alignItems: 'center',
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radius.lg,
                  flex: 1.4,
                  flexDirection: 'row',
                  gap: 8,
                  justifyContent: 'center',
                  minHeight: 52,
                  opacity: pressed ? theme.states.pressedOpacity : 1,
                },
              ]}>
              <MaterialIcon color={theme.colors.text.inverse} filled name="play_circle" size={22} />
              <AppText style={{color: theme.colors.text.inverse, fontWeight: '600'}}>
                Luyện ngay
              </AppText>
            </Pressable>
          </View>
        </BottomActionBar>
      ) : null}
    </AppScreen>
  );
}
