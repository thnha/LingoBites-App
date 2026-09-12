import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import type {LessonsStackParamList} from '@/app/navigation/types';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {MaterialIcon} from '@components/MaterialIcon';
import {useAppTheme, type AppTheme} from '@theme';
import {bootstrapContentPackage} from '@modules/content';
import {GrammarTabContent} from './components/GrammarTabContent';
import {LessonsTabContent} from './components/LessonsTabContent';
import {SearchAndFilterBar} from './components/SearchAndFilterBar';
import {SegmentedTabBar} from './components/SegmentedTabBar';
import {VocabularyTabContent} from './components/VocabularyTabContent';
import type {PracticeQuestion} from '@shared/schemas/ai-output-v1';
import {resolveQuickPractice} from '../practice/resolveQuickPractice';
import {useFlashcardLibrary} from './useFlashcardLibrary';
import {useLessonRepository} from './useLessonRepository';
import {useLibrarySegments} from './useLibrarySegments';

type Props = NativeStackScreenProps<LessonsStackParamList, 'LessonsList'>;

type PracticeChip = {
  icon: 'refresh' | 'mic' | 'bolt';
  value: string;
  labelKey: string;
  backgroundKey: 'accentSoft' | 'tertiarySoft' | 'secondarySoft';
  // Same pairing as HomeScreen chips: onPrimaryContainer/onSecondaryContainer
  // fall below 4.5:1 on the light soft tints in neo/comic/core.
  inkKey: 'primary' | 'onTertiaryContainer' | 'secondary';
  onPress: () => void;
  testID: string;
};

export function LessonsHistoryScreen({navigation}: Props) {
  const {theme} = useAppTheme();
  const themedStyles = useMemo(() => makeStyles(theme), [theme]);
  const {t} = useTranslation();
  const {getDueFlashcards} = useFlashcardLibrary();
  const {getLessonById, listLessons} = useLessonRepository();
  const [dueCount, setDueCount] = useState(0);
  const [quickQuestions, setQuickQuestions] = useState<PracticeQuestion[]>([]);
  const [quickTitle, setQuickTitle] = useState('');

  const [activeTab, setActiveTab] = useState<
    'lessons' | 'vocabulary' | 'grammar'
  >('lessons');

  const {
    personalLessons,
    packagedLessons,
    vocabulary,
    grammar,
    lessonsFilter,
    vocabularyFilter,
    grammarFilter,
    setLessonsFilter,
    setVocabularyFilter,
    setGrammarFilter,
    refresh,
  } = useLibrarySegments();

  useFocusEffect(
    useCallback(() => {
      bootstrapContentPackage().catch(() => {});
      refresh();
      setDueCount(getDueFlashcards().length);
      const personal = listLessons();
      const {questions, title} = resolveQuickPractice(personal, getLessonById);
      setQuickQuestions(questions);
      setQuickTitle(title);
    }, [refresh, getDueFlashcards, getLessonById, listLessons]),
  );

  const practiceChips: PracticeChip[] = useMemo(() => {
    const chips: PracticeChip[] = [
      {
        icon: 'refresh',
        value: t('home.shortcut_review_meta', {count: dueCount}),
        labelKey: 'home.shortcut_review',
        backgroundKey: 'accentSoft',
        inkKey: 'primary',
        onPress: () => navigation.navigate('FlashcardList'),
        testID: 'library-practice-review',
      },
      {
        icon: 'mic',
        value: t('home.shortcut_speaking_meta'),
        labelKey: 'home.shortcut_speaking',
        backgroundKey: 'tertiarySoft',
        inkKey: 'onTertiaryContainer',
        onPress: () => navigation.navigate('SpeakingRoom'),
        testID: 'library-practice-speaking',
      },
    ];
    if (quickQuestions.length > 0) {
      const questions = quickQuestions;
      const title = quickTitle || t('home.shortcut_quick');
      chips.push({
        icon: 'bolt',
        value: t('home.shortcut_quick_meta'),
        labelKey: 'home.shortcut_quick',
        backgroundKey: 'secondarySoft',
        inkKey: 'secondary',
        onPress: () =>
          navigation.navigate('Practice', {
            questions,
            title,
          }),
        testID: 'library-practice-quick',
      });
    }
    return chips;
  }, [
    dueCount,
    navigation,
    quickQuestions,
    quickTitle,
    t,
  ]);

  const currentFilter =
    activeTab === 'lessons'
      ? lessonsFilter
      : activeTab === 'vocabulary'
        ? vocabularyFilter
        : grammarFilter;

  const setCurrentFilter =
    activeTab === 'lessons'
      ? setLessonsFilter
      : activeTab === 'vocabulary'
        ? setVocabularyFilter
        : setGrammarFilter;

  return (
    <AppScreen>
      <View style={themedStyles.header}>
        <AppText style={themedStyles.title}>Thư viện</AppText>
      </View>

      <View style={themedStyles.practiceRow} testID="library-practice-row">
        {practiceChips.map(chip => (
          <Pressable
            accessibilityLabel={`${t(chip.labelKey)}. ${chip.value}`}
            accessibilityRole="button"
            key={chip.testID}
            onPress={chip.onPress}
            style={({pressed}) => [
              themedStyles.practiceChip,
              {backgroundColor: theme.colors[chip.backgroundKey]},
              pressed && themedStyles.pressed,
            ]}
            testID={chip.testID}
          >
            <MaterialIcon
              color={theme.colors[chip.inkKey]}
              name={chip.icon}
              size={20}
            />
            <View style={themedStyles.practiceCopy}>
              <AppText
                variant="label"
                style={{color: theme.colors[chip.inkKey]}}
                numberOfLines={1}
              >
                {t(chip.labelKey)}
              </AppText>
              <AppText
                variant="caption"
                style={{color: theme.colors[chip.inkKey]}}
                numberOfLines={1}
              >
                {chip.value}
              </AppText>
            </View>
          </Pressable>
        ))}
      </View>

      <SegmentedTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <SearchAndFilterBar
        searchQuery={currentFilter.searchQuery}
        sourceFilter={currentFilter.sourceFilter}
        onSearchChange={query =>
          setCurrentFilter({...currentFilter, searchQuery: query})
        }
        onFilterChange={filter =>
          setCurrentFilter({...currentFilter, sourceFilter: filter})
        }
      />

      {activeTab === 'lessons' && (
        <View style={themedStyles.tabContent} testID="lessons-tab-content">
          <LessonsTabContent
            personalLessons={personalLessons}
            packagedLessons={packagedLessons}
          />
        </View>
      )}
      {activeTab === 'vocabulary' && (
        <View style={themedStyles.tabContent} testID="vocabulary-tab-content">
          <VocabularyTabContent vocabulary={vocabulary} />
        </View>
      )}
      {activeTab === 'grammar' && (
        <View style={themedStyles.tabContent} testID="grammar-tab-content">
          <GrammarTabContent grammar={grammar} />
        </View>
      )}
    </AppScreen>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: theme.gutter,
      paddingVertical: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.size.lg,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    practiceRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.gutter,
    },
    practiceChip: {
      alignItems: 'center',
      borderRadius: theme.radius.lg,
      flex: 1,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      minHeight: 56,
      minWidth: 0,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    practiceCopy: {flex: 1, gap: 0, minWidth: 0},
    pressed: {opacity: theme.states.pressedOpacity},
    tabContent: {
      flex: 1,
    },
  });
}
