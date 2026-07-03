import {create} from 'zustand';
import {listLessons} from '../shared/db/LessonRepository';
import type {LessonListItem} from '../shared/db/types';
import type {ChipTone} from '../components/Chip';
import type {LessonCardView, LessonSubjectKey, LibraryLessonCardView} from '../types/lesson';

const SUBJECT_ROTATION: Array<{
  key: LessonSubjectKey;
  label: string;
  tone: ChipTone;
}> = [
  {key: 'grammar', label: 'Ngữ pháp', tone: 'accentSoft'},
  {key: 'vocabulary', label: 'Từ vựng', tone: 'gold'},
  {key: 'idioms', label: 'Thành ngữ', tone: 'coralSoft'},
  {key: 'conversation', label: 'Hội thoại', tone: 'accentSoft'},
];

export type LibrarySubjectFilter = 'all' | LessonSubjectKey;

function formatLessonDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {day: 'numeric', month: 'short'});
}

function estimateDurationMin(vocabularyCount: number): number {
  return Math.max(5, Math.ceil(vocabularyCount / 8));
}

function toCardView(item: LessonListItem, index: number): LibraryLessonCardView {
  const subject = SUBJECT_ROTATION[index % SUBJECT_ROTATION.length];
  return {
    id: item.id,
    title: item.title,
    blurb: item.summary || item.previewText,
    dateLabel: formatLessonDate(item.createdAt),
    vocabularyCount: item.vocabularyCount,
    durationMin: estimateDurationMin(item.vocabularyCount),
    subjectLabel: subject.label,
    subjectTone: subject.tone,
    subjectKey: subject.key,
  };
}

function toHomeCardView(item: LessonListItem): LessonCardView {
  return {
    id: item.id,
    title: item.title,
    meta: `${item.vocabularyCount} từ vựng`,
    blurb: item.summary || item.previewText,
  };
}

type LibraryStore = {
  query: string;
  subjectFilter: LibrarySubjectFilter;
  setQuery: (query: string) => void;
  setSubjectFilter: (filter: LibrarySubjectFilter) => void;
  getLibraryCards: () => LibraryLessonCardView[];
  getHomeCards: (limit?: number) => LessonCardView[];
  getSummary: () => {lessonCount: number; wordCount: number};
};

function listFilteredItems(query: string, subjectFilter: LibrarySubjectFilter): LessonListItem[] {
  const q = query.trim().toLowerCase();
  const items = listLessons();
  return items.filter((item, index) => {
    const subjectKey = SUBJECT_ROTATION[index % SUBJECT_ROTATION.length].key;
    if (subjectFilter !== 'all' && subjectKey !== subjectFilter) {
      return false;
    }
    if (!q) {
      return true;
    }
    return (
      item.title.toLowerCase().includes(q) ||
      item.previewText.toLowerCase().includes(q) ||
      (item.summary?.toLowerCase().includes(q) ?? false)
    );
  });
}

// UI search/filter layer; persistence via LessonRepository (M4).
export const useLibraryStore = create<LibraryStore>((set, get) => ({
  query: '',
  subjectFilter: 'all',

  setQuery(query: string) {
    set({query});
  },

  setSubjectFilter(subjectFilter: LibrarySubjectFilter) {
    set({subjectFilter});
  },

  getLibraryCards() {
    const {query, subjectFilter} = get();
    const items = listLessons();
    return listFilteredItems(query, subjectFilter).map(item => {
      const index = items.findIndex(entry => entry.id === item.id);
      return toCardView(item, Math.max(index, 0));
    });
  },

  getHomeCards(limit?: number) {
    const items = limit && limit > 0 ? listLessons(limit) : listLessons();
    return items.map(toHomeCardView);
  },

  getSummary() {
    const items = listLessons();
    return {
      lessonCount: items.length,
      wordCount: items.reduce((sum, item) => sum + item.vocabularyCount, 0),
    };
  },
}));
