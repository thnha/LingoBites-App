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
import {Chip} from '../../components/Chip';
import {HandoffDualActionBar} from '../../components/HandoffDualActionBar';
import {HandoffProgressTrack} from '../../components/HandoffProgressTrack';
import {IconButton} from '../../components/IconButton';
import {ImagePlaceholder} from '../../components/ImagePlaceholder';
import {MaterialIcon} from '../../components/MaterialIcon';
import {ScreenHeader} from '../../components/ScreenHeader';
import {SectionHeader} from '../../components/SectionHeader';
import {SentenceChunkCard} from '../../components/SentenceChunkCard';
import {EMPTY_SECTION_MESSAGE} from '../../shared/copy/userMessages';
import {useAppTheme} from '../../theme';

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'SentenceDetail'>
  | NativeStackScreenProps<LessonsStackParamList, 'SentenceDetail'>;

export function SentenceDetailScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const nav = navigation as NativeStackScreenProps<HomeStackParamList, 'SentenceDetail'>['navigation'];
  const {sentence, index, total, practice} = route.params;
  const chunks = sentence.breakdown ?? [];
  const hasPractice = practice.length > 0;
  const progress = (index + 1) / Math.max(total, 1);

  return (
    <AppScreen>
      <ScreenHeader
        onBack={() => navigation.goBack()}
        rightAction={
          <IconButton
            accessibilityLabel="Phát âm"
            filled
            icon="volume_up"
            tone="accent"
          />
        }
        title={`Câu ${index + 1} / ${total}`}
      />
      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          paddingHorizontal: theme.gutter,
          paddingTop: theme.spacing.sm,
        }}
        showsVerticalScrollIndicator={false}>
        <HandoffProgressTrack
          label={`${index + 1} / ${total}`}
          progress={progress}
        />

        <ImagePlaceholder height={150} label="Minh họa bài học" />

        <AppCard
          style={{
            borderBottomColor: theme.colors.accent,
            borderBottomWidth: 4,
            gap: theme.spacing.sm,
          }}>
          <Chip label="English" tone="accentSoft" />
          <AppText style={{lineHeight: 28}} variant="h2">
            {sentence.original}
          </AppText>
          <View style={{backgroundColor: theme.colors.outlineVariant, height: 1}} />
          <Chip label="Tiếng Việt" tone="coralSoft" />
          <AppText color="secondary" variant="bodyLg">
            {sentence.translation}
          </AppText>
          {sentence.simple_meaning ? (
            <AppText color="muted">{sentence.simple_meaning}</AppText>
          ) : null}
        </AppCard>

        <SectionHeader
          title="Tách thành cụm"
          action={<MaterialIcon color={theme.colors.text.secondary} name="info" size={20} />}
        />

        {chunks.length === 0 ? (
          <AppText color="muted">{EMPTY_SECTION_MESSAGE}</AppText>
        ) : (
          <View style={{gap: 10}}>
            {chunks.map((chunk, chunkIndex) => (
              <SentenceChunkCard
                key={`${chunkIndex}-${chunk.text}`}
                accentBar={chunkIndex % 2 === 0}
                meaning={chunk.meaning}
                roleLabel={chunk.simple_role_vi || chunk.role}
                text={chunk.text}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <HandoffDualActionBar
        onBack={() => navigation.goBack()}
        onContinue={
          hasPractice ? () => nav.navigate('Practice', {questions: practice}) : undefined
        }
      />
    </AppScreen>
  );
}
