import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import type {LessonsStackParamList} from '@/app/navigation/types';
import {AppScreen} from '@components/AppScreen';
import {AppText} from '@components/AppText';
import {useAppTheme, type AppTheme} from '@theme';
import {bootstrapContentPackage} from '@modules/content';
import {GrammarTabContent} from './components/GrammarTabContent';
import {LessonsTabContent} from './components/LessonsTabContent';
import {SearchAndFilterBar} from './components/SearchAndFilterBar';
import {SegmentedTabBar} from './components/SegmentedTabBar';
import {VocabularyTabContent} from './components/VocabularyTabContent';
import {useLibrarySegments} from './useLibrarySegments';

type Props = NativeStackScreenProps<LessonsStackParamList, 'LessonsList'>;

export function LessonsHistoryScreen({}: Props) {
  const {theme} = useAppTheme();
  const themedStyles = useMemo(() => makeStyles(theme), [theme]);

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
    }, [refresh]),
  );

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
    tabContent: {
      flex: 1,
    },
  });
}
