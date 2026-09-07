import {useCallback, useMemo, useState} from 'react';
import {
  useLibraryStore,
  type LibrarySubjectFilter,
} from '../../store/useLibraryStore';
import type {LibraryLessonCardView} from '../../types/lesson';
import {getGamificationSnapshot} from '../engagement';

export type LessonLibrarySummary = {
  lessonCount: number;
  wordCount: number;
  currentStreak: number;
  accuracyLabel: string;
};

export type LessonLibraryState = {
  query: string;
  subjectFilter: LibrarySubjectFilter;
  setQuery: (query: string) => void;
  setSubjectFilter: (filter: LibrarySubjectFilter) => void;
  userLessons: LibraryLessonCardView[];
  summary: LessonLibrarySummary;
  refresh: () => void;
};

export function useLessonLibrary(): LessonLibraryState {
  const query = useLibraryStore(state => state.query);
  const subjectFilter = useLibraryStore(state => state.subjectFilter);
  const setQuery = useLibraryStore(state => state.setQuery);
  const setSubjectFilter = useLibraryStore(state => state.setSubjectFilter);
  const getLibraryCards = useLibraryStore(state => state.getLibraryCards);
  const getSummary = useLibraryStore(state => state.getSummary);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const refresh = useCallback(() => {
    setRefreshVersion(version => version + 1);
  }, []);

  const libraryCacheKey = `${query}\n${subjectFilter}\n${refreshVersion}`;
  const userLessons = useMemo(
    () => readLibraryCards(getLibraryCards, libraryCacheKey),
    [getLibraryCards, libraryCacheKey],
  );

  const summary = useMemo(() => {
    const librarySummary = readLibrarySummary(getSummary, refreshVersion);
    const gamification = getGamificationSnapshot();
    return {
      ...librarySummary,
      currentStreak: gamification.currentStreak,
      accuracyLabel: 'Chưa có dữ liệu',
    };
  }, [getSummary, refreshVersion]);

  return {
    query,
    subjectFilter,
    setQuery,
    setSubjectFilter,
    userLessons,
    summary,
    refresh,
  };
}

function readLibraryCards(
  getLibraryCards: () => LibraryLessonCardView[],
  _cacheKey: string,
): LibraryLessonCardView[] {
  return getLibraryCards();
}

function readLibrarySummary(
  getSummary: () => {lessonCount: number; wordCount: number},
  _refreshVersion: number,
) {
  return getSummary();
}
