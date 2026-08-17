import React, {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {
  HomeStackParamList,
  LessonsStackParamList,
} from '../../app/navigation/types';
import {AppButton} from '../../components/AppButton';
import {AppCard} from '../../components/AppCard';
import {AppScreen} from '../../components/AppScreen';
import {AppText} from '../../components/AppText';
import {Chip} from '../../components/Chip';
import {ErrorCard} from '../../components/ErrorCard';
import {FlipCard} from '../../components/FlipCard';
import {IconButton} from '../../components/IconButton';
import {ScreenHeader} from '../../components/ScreenHeader';
import {useFeatureEnabled} from '../../release';
import {
  listFlashcards,
  unsaveFlashcard,
} from '../../shared/db/FlashcardRepository';
import {listLessons} from '../../shared/db/LessonRepository';
import type {
  FlashcardRecord,
  LessonListItem,
} from '../../shared/db/types';
import {useAppTheme} from '../../theme';

type HomeProps = Partial<
  NativeStackScreenProps<HomeStackParamList, 'FlashcardList'>
>;
type LessonsProps = Partial<
  NativeStackScreenProps<LessonsStackParamList, 'FlashcardList'>
>;
type Props = HomeProps | LessonsProps;

export function FlashcardListScreen({navigation, route}: Props) {
  const {theme} = useAppTheme();
  const reviewSystemEnabled = useFeatureEnabled('reviewSystem');

  const initialLessonId = route?.params?.lessonId;
  const [selectedLessonId, setSelectedLessonId] = useState<
    string | undefined
  >(initialLessonId);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const [cards, setCards] = useState<FlashcardRecord[]>([]);
  const [lessons, setLessons] = useState<LessonListItem[]>([]);

  const refreshData = useCallback(() => {
    const allLessons = listLessons();
    setLessons(allLessons);

    const fetchedCards = listFlashcards({
      lessonId: selectedLessonId,
    });
    setCards(fetchedCards);
  }, [selectedLessonId]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData]),
  );

  const lessonTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    lessons.forEach(l => {
      map.set(l.id, l.title);
    });
    return map;
  }, [lessons]);

  const activeCard = useMemo(() => {
    if (!activeCardId) {
      return null;
    }
    return cards.find(c => c.id === activeCardId) ?? null;
  }, [activeCardId, cards]);

  function handleSelectCard(cardId: string) {
    if (activeCardId === cardId) {
      setIsFlipped(prev => !prev);
    } else {
      setActiveCardId(cardId);
      setIsFlipped(false);
    }
  }

  function handlePromptUnsave(card: FlashcardRecord) {
    Alert.alert(
      'Bỏ lưu flashcard',
      `Bạn có chắc chắn muốn bỏ lưu từ "${card.word}" khỏi danh sách flashcard?`,
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Bỏ lưu',
          style: 'destructive',
          onPress: () => {
            unsaveFlashcard(card.id);
            if (activeCardId === card.id) {
              setActiveCardId(null);
              setIsFlipped(false);
            }
            refreshData();
          },
        },
      ],
    );
  }

  if (!reviewSystemEnabled) {
    return (
      <AppScreen testID="flashcard-list-screen">
        <ScreenHeader
          onBack={() => navigation?.goBack?.()}
          title="Flashcards"
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: theme.spacing.lg,
          }}>
          <ErrorCard message="Tính năng ôn tập hiện chưa được bật." />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen testID="flashcard-list-screen">
      <ScreenHeader
        onBack={() => navigation?.goBack?.()}
        title="Danh sách Flashcards"
      />

      <View style={styles.container}>
        {/* Lesson Filter Selector */}
        <View style={styles.filterSection}>
          <AppText style={styles.filterLabel} variant="label">
            Lọc theo bài học:
          </AppText>
          <ScrollView
            contentContainerStyle={styles.chipContainer}
            horizontal
            showsHorizontalScrollIndicator={false}>
            <Chip
              label="Tất cả bài học"
              onPress={() => {
                setSelectedLessonId(undefined);
              }}
              testID="filter-all-lessons"
              tone={selectedLessonId === undefined ? 'accent' : 'neutral'}
            />
            {lessons.map(lesson => (
              <Chip
                key={lesson.id}
                label={lesson.title}
                onPress={() => {
                  setSelectedLessonId(lesson.id);
                }}
                testID={`filter-lesson-${lesson.id}`}
                tone={selectedLessonId === lesson.id ? 'accent' : 'neutral'}
              />
            ))}
          </ScrollView>
        </View>

        {/* FlipCard Active View Modal / Card Preview */}
        {activeCard ? (
          <View style={styles.activeFlipCardSection} testID="active-flipcard-view">
            <View style={styles.activeCardHeader}>
              <AppText color="secondary" variant="label">
                Đang xem flashcard ({activeCard.word})
              </AppText>
              <IconButton
                accessibilityLabel="Đóng xem flashcard"
                icon="close"
                onPress={() => setActiveCardId(null)}
                size={20}
                tone="surface"
              />
            </View>
            <FlipCard
              back={
                <View style={styles.cardInner}>
                  <AppText style={styles.wordTitle} variant="h2">
                    {activeCard.word}
                  </AppText>
                  <AppText color="primary" style={styles.meaningText} variant="h3">
                    {activeCard.meaningVi}
                  </AppText>
                  {activeCard.example ? (
                    <View style={styles.exampleBox}>
                      <AppText color="secondary" style={styles.exampleText}>
                        "{activeCard.example}"
                      </AppText>
                      {activeCard.exampleTranslation ? (
                        <AppText color="muted" style={styles.exampleText}>
                          {activeCard.exampleTranslation}
                        </AppText>
                      ) : null}
                    </View>
                  ) : null}
                  {activeCard.sourceSentence ? (
                    <AppText color="muted" style={styles.sourceText}>
                      Nguồn: {activeCard.sourceSentence}
                    </AppText>
                  ) : null}
                  <AppText color="secondary" style={styles.badgeText}>
                    📌 {lessonTitleMap.get(activeCard.lessonId) ?? 'Bài học'}
                  </AppText>
                </View>
              }
              flipped={isFlipped}
              front={
                <View style={styles.cardInner}>
                  <AppText style={styles.wordTitle} variant="h2">
                    {activeCard.word}
                  </AppText>
                  {activeCard.wordType || activeCard.ipa ? (
                    <AppText color="secondary" style={styles.subText}>
                      {activeCard.wordType ? `[${activeCard.wordType}] ` : ''}
                      {activeCard.ipa ? `/${activeCard.ipa}/` : ''}
                    </AppText>
                  ) : null}
                  {activeCard.pronunciationGuideVi ? (
                    <AppText color="muted" style={styles.subText}>
                      Phát âm: {activeCard.pronunciationGuideVi}
                    </AppText>
                  ) : null}
                  <AppText color="secondary" style={styles.badgeText}>
                    📌 {lessonTitleMap.get(activeCard.lessonId) ?? 'Bài học'}
                  </AppText>
                </View>
              }
              onFlip={() => setIsFlipped(prev => !prev)}
              testID="active-flip-card"
            />
          </View>
        ) : null}

        {/* Flashcards List */}
        <FlatList
          contentContainerStyle={styles.listContent}
          data={cards}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppText color="muted" style={{textAlign: 'center'}}>
                {selectedLessonId
                  ? 'Chưa có flashcard nào thuộc bài học này.'
                  : 'Chưa có flashcard nào được lưu.'}
              </AppText>
            </View>
          }
          renderItem={({item}) => {
            const lessonTitle = lessonTitleMap.get(item.lessonId) ?? 'Bài học';
            const isActive = activeCardId === item.id;

            return (
              <Pressable
                accessibilityLabel={`Flashcard ${item.word}`}
                accessibilityRole="button"
                onPress={() => handleSelectCard(item.id)}
                testID={`card-item-${item.id}`}>
                <AppCard
                  style={StyleSheet.flatten([
                    styles.cardRow,
                    isActive
                      ? {
                          borderColor: theme.colors.primary,
                          borderWidth: 2,
                        }
                      : {},
                  ])}>
                  <View style={styles.cardRowLeft}>
                    <View style={styles.wordHeaderRow}>
                      <AppText style={styles.itemWordTitle} variant="h3">
                        {item.word}
                      </AppText>
                      {item.wordType ? (
                        <AppText color="secondary" style={styles.wordTypeBadge}>
                          {item.wordType}
                        </AppText>
                      ) : null}
                    </View>

                    <AppText color="secondary" style={styles.itemMeaning}>
                      {item.meaningVi}
                    </AppText>

                    {/* Lesson Badge - E2 requirement: visually sets apart same word from different lessons */}
                    <AppText color="muted" style={styles.lessonBadge} testID={`card-lesson-tag-${item.id}`}>
                      📖 {lessonTitle}
                    </AppText>
                  </View>

                  <View style={styles.cardRowRight}>
                    <AppButton
                      accessibilityLabel={`Bỏ lưu ${item.word}`}
                      onPress={() => handlePromptUnsave(item)}
                      style={styles.unsaveButton}
                      testID={`unsave-button-${item.id}`}
                      title="Bỏ lưu"
                      variant="secondary"
                    />
                  </View>
                </AppCard>
              </Pressable>
            );
          }}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  activeCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    width: '100%',
  },
  activeFlipCardSection: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  badgeText: {
    fontSize: 12,
    marginTop: 8,
  },
  cardInner: {
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cardRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  cardRowLeft: {
    flex: 1,
    gap: 4,
    marginRight: 10,
  },
  cardRowRight: {
    alignItems: 'flex-end',
  },
  chipContainer: {
    gap: 8,
    paddingRight: 16,
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  exampleBox: {
    alignItems: 'center',
    gap: 2,
    marginVertical: 4,
  },
  exampleText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  filterLabel: {
    marginBottom: 6,
  },
  filterSection: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  itemMeaning: {
    fontSize: 14,
  },
  itemWordTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  lessonBadge: {
    fontSize: 12,
    marginTop: 2,
  },
  listContent: {
    gap: 10,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  meaningText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  sourceText: {
    fontSize: 12,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
  },
  unsaveButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  wordHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  wordTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  wordTypeBadge: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
