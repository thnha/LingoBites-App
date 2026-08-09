import {useLibraryStore} from '../useLibraryStore';
import type {LessonListItem} from '../../shared/db/types';

jest.mock('../../shared/db/LessonRepository', () => ({
  listLessons: jest.fn(),
}));

import {listLessons} from '../../shared/db/LessonRepository';
const mockListLessons = listLessons as jest.Mock;

function makeItem(overrides: Partial<LessonListItem>): LessonListItem {
  return {
    id: 'lesson-1',
    title: 'Lesson',
    summary: null,
    previewText: 'preview',
    vocabularyCount: 5,
    category: 'vocabulary',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('useLibraryStore', () => {
  beforeEach(() => {
    mockListLessons.mockReset();
    useLibraryStore.setState({query: '', subjectFilter: 'all'});
  });

  it('filters by real category, not list position, with a single lesson', () => {
    mockListLessons.mockReturnValue([makeItem({id: '1', category: 'grammar'})]);

    useLibraryStore.getState().setSubjectFilter('vocabulary');
    expect(useLibraryStore.getState().getLibraryCards()).toHaveLength(0);

    useLibraryStore.getState().setSubjectFilter('grammar');
    expect(useLibraryStore.getState().getLibraryCards()).toHaveLength(1);
  });

  it('returns only vocabulary-category lessons under the Từ vựng filter', () => {
    mockListLessons.mockReturnValue([
      makeItem({id: '1', category: 'vocabulary'}),
      makeItem({id: '2', category: 'grammar'}),
      makeItem({id: '3', category: 'vocabulary'}),
    ]);

    useLibraryStore.getState().setSubjectFilter('vocabulary');
    const cards = useLibraryStore.getState().getLibraryCards();

    expect(cards.map(c => c.id)).toEqual(['1', '3']);
    expect(cards.every(c => c.subjectKey === 'vocabulary')).toBe(true);
  });

  it('returns all lessons regardless of category under "all"', () => {
    mockListLessons.mockReturnValue([
      makeItem({id: '1', category: 'vocabulary'}),
      makeItem({id: '2', category: 'grammar'}),
    ]);

    useLibraryStore.getState().setSubjectFilter('all');
    expect(useLibraryStore.getState().getLibraryCards()).toHaveLength(2);
  });

  it('assigns the correct label/tone for the grammar category', () => {
    mockListLessons.mockReturnValue([makeItem({id: '1', category: 'grammar'})]);

    const [card] = useLibraryStore.getState().getLibraryCards();
    expect(card.subjectLabel).toBe('Ngữ pháp');
    expect(card.subjectKey).toBe('grammar');
  });
});
