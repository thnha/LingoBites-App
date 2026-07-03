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
import {MaterialIcon} from '../../components/MaterialIcon';
import {ScreenHeader} from '../../components/ScreenHeader';
import {useAppTheme} from '../../theme';

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'WordDetail'>
  | NativeStackScreenProps<LessonsStackParamList, 'WordDetail'>;

export function WordDetailScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const nav = navigation as NativeStackScreenProps<HomeStackParamList, 'WordDetail'>['navigation'];
  const {word, practice} = route.params;
  const hasPractice = practice.length > 0;
  const metaParts = [word.word_type, word.ipa].filter(Boolean);

  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        rightAction={
          <IconButton accessibilityLabel="Lưu từ" icon="bookmark" tone="surface" />
        }
        title="Từ vựng"
      />
      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        showsVerticalScrollIndicator={false}>
        <AppCard style={{alignItems: 'center', gap: theme.spacing.sm, paddingTop: 30}}>
          {word.cefr_level ? (
            <View style={{position: 'absolute', right: 16, top: 16}}>
              <Chip label={word.cefr_level} tone="gold" />
            </View>
          ) : null}
          <AppText style={{color: theme.colors.primary, fontSize: 44, lineHeight: 48}}>
            {word.word}
          </AppText>
          {metaParts.length > 0 ? (
            <View style={{alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
              {metaParts.map((part, partIndex) => (
                <React.Fragment key={part}>
                  {partIndex > 0 ? (
                    <AppText color="muted">•</AppText>
                  ) : null}
                  <AppText color="secondary" style={{fontStyle: part === word.ipa ? 'normal' : 'italic'}}>
                    {part}
                  </AppText>
                </React.Fragment>
              ))}
            </View>
          ) : null}
          <View
            style={{
              alignSelf: 'stretch',
              backgroundColor: theme.colors.outlineVariant,
              height: 1,
              marginVertical: theme.spacing.sm,
            }}
          />
          <AppText style={{color: theme.colors.secondary, fontWeight: '700'}} variant="h3">
            {word.meaning_vi}
          </AppText>
          {word.phrase_from_text ? (
            <AppText color="muted">Trong văn bản: “{word.phrase_from_text}”</AppText>
          ) : null}
        </AppCard>

        {word.why_important ? (
          <AppCard
            style={{
              borderLeftColor: theme.colors.accent,
              borderLeftWidth: 4,
              gap: theme.spacing.sm,
            }}>
            <View style={{alignItems: 'center', flexDirection: 'row', gap: 8}}>
              <MaterialIcon color={theme.colors.primary} filled name="lightbulb" size={22} />
              <AppText style={{color: theme.colors.primary, fontWeight: '600'}} variant="h3">
                Vì sao nên học
              </AppText>
            </View>
            <AppText color="secondary">{word.why_important}</AppText>
          </AppCard>
        ) : null}

        {word.example ? (
          <AppCard
            style={{
              borderLeftColor: theme.colors.secondaryContainer,
              borderLeftWidth: 4,
              gap: theme.spacing.sm,
            }}>
            <View style={{alignItems: 'center', flexDirection: 'row', gap: 8}}>
              <MaterialIcon color={theme.colors.secondary} filled name="format_quote" size={22} />
              <AppText style={{color: theme.colors.secondary, fontWeight: '600'}} variant="h3">
                Ví dụ
              </AppText>
            </View>
            <View
              style={{
                backgroundColor: theme.colors.surfaceLow,
                borderLeftColor: theme.colors.secondaryContainer,
                borderLeftWidth: 4,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}>
              <AppText style={{fontWeight: '700'}} variant="bodyLg">
                {word.example}
              </AppText>
            </View>
            {word.example_translation ? (
              <AppText color="muted" style={{fontStyle: 'italic'}}>
                {word.example_translation}
              </AppText>
            ) : null}
          </AppCard>
        ) : null}
      </ScrollView>
      {hasPractice ? (
        <BottomActionBar
          style={{
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.outlineVariant,
            paddingBottom: theme.spacing.lg,
          }}>
          <Pressable
            accessibilityLabel="Luyện từ này"
            accessibilityRole="button"
            onPress={() => nav.navigate('Practice', {questions: practice})}
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
            <MaterialIcon color={theme.colors.text.inverse} name="fitness_center" size={22} />
            <AppText style={{color: theme.colors.text.inverse, fontSize: 18, fontWeight: '600'}}>
              Luyện từ này
            </AppText>
          </Pressable>
        </BottomActionBar>
      ) : null}
    </AppScreen>
  );
}
