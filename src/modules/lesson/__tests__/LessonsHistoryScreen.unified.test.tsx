import * as AuthSession from '@shared/auth/authSession';
import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {AppThemeProvider} from '@theme';
import {LessonsHistoryScreen} from '../LessonsHistoryScreen';

// The shipped presets keep unifiedLesson disabled (status
// not_implemented), so the provider would reject a test config that
// enables it. Stub the hook to simulate the TASK-008-activated shape.
jest.mock('@/release', () => ({
  ...jest.requireActual('@/release'),
  useFeatureFlags: () => ({
    config: {releaseName: 'test-unified', features: {unifiedLesson: true}},
  }),
}));

const mockRefresh = jest.fn();
const mockBootstrap = jest.fn().mockResolvedValue({ok: true});

jest.mock('../useLibrarySegments', () => ({
  useLibrarySegments: () => ({
    personalLessons: [{id: 'p1', title: 'Personal', summary: null}],
    packagedLessons: [{id: 'c1', titleVi: 'Packaged', blurbVi: null}],
    vocabulary: [],
    grammar: [],
    lessonsFilter: {searchQuery: '', sourceFilter: 'all'},
    vocabularyFilter: {searchQuery: '', sourceFilter: 'all'},
    grammarFilter: {searchQuery: '', sourceFilter: 'all'},
    setLessonsFilter: jest.fn(),
    setVocabularyFilter: jest.fn(),
    setGrammarFilter: jest.fn(),
    refresh: mockRefresh,
  }),
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: (callback: () => void) =>
      React.useEffect(callback, [callback]),
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

jest.mock('@modules/content', () => ({
  bootstrapContentPackage: (...args: unknown[]) => mockBootstrap(...args),
}));

// Keep the real unified catalog screen, but pin capabilities on so the
// composition under test is deterministic without a live probe.
jest.mock('@modules/curriculumLesson', () => {
  const actual = jest.requireActual('@modules/curriculumLesson');
  return {
    ...actual,
    useLessonServerCapabilities: () => ({
      catalog: true,
      canonicalDelivery: true,
      aiMaterialization: true,
      packagedImport: true,
    }),
  };
});

jest.mock('@modules/analytics', () => ({
  trackEvent: jest.fn(),
}));

const mockListLessons = jest.fn(() => []);
const mockGetLessonById = jest.fn(() => null);
const mockGetDueFlashcards = jest.fn(() => []);

jest.mock('../useLessonRepository', () => ({
  useLessonRepository: () => ({
    listLessons: mockListLessons,
    getLessonById: mockGetLessonById,
  }),
}));

jest.mock('../useFlashcardLibrary', () => ({
  useFlashcardLibrary: () => ({
    getDueFlashcards: mockGetDueFlashcards,
  }),
}));

const validSession = {
  status: 'valid' as const,
  session: {
    access_token: 'test-token',
    session_id: '1',
    refresh_token: '2',
    access_expires_at: '2050',
    refresh_expires_at: '2050',
  },
  userId: 'user1',
};

const CATALOG_PAGE = {
  request_id: 'req-cat',
  status: 'success',
  lessons: [
    {
      id: '00000000-0000-4000-8000-000000000010',
      title: 'Unified one',
      description: 'First',
      estimatedMinutes: 5,
      contentRevision: 1,
      updatedAt: '2026-09-25T10:00:00.000Z',
    },
    {
      id: '00000000-0000-4000-8000-000000000011',
      title: 'Unified two',
      description: 'Second',
      estimatedMinutes: null,
      contentRevision: 1,
      updatedAt: '2026-09-25T11:00:00.000Z',
    },
  ],
  next_cursor: null,
};

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function renderUnified() {
  const navigation = {navigate: jest.fn(), getParent: jest.fn()};
  const route = {
    key: 'LessonsList',
    name: 'LessonsList' as const,
    params: undefined,
  };
  const tree = ReactTestRenderer.create(
    <AppThemeProvider>
      <LessonsHistoryScreen
        navigation={navigation as never}
        route={route as never}
      />
    </AppThemeProvider>,
  );
  return {tree, navigation};
}

describe('LessonsHistoryScreen unified composition (LING-21 TASK-007)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(AuthSession, 'ensureValidSession')
      .mockResolvedValue(validSession);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => CATALOG_PAGE,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders one flat canonical catalog instead of source sections', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    let navigation!: {navigate: jest.Mock};
    await act(async () => {
      ({tree, navigation} = renderUnified());
    });
    expect(
      tree.root.findByProps({testID: 'unified-lessons-content'}),
    ).toBeDefined();
    expect(
      tree.root.findByProps({testID: 'unified-lessons-list'}),
    ).toBeDefined();
    expect(() =>
      tree.root.findByProps({testID: 'lessons-section-list'}),
    ).toThrow();
    expect(() =>
      tree.root.findByProps({testID: 'curriculum-entry-section'}),
    ).toThrow();

    act(() => {
      tree.root
        .findByProps({
          testID: 'unified-lesson-item-00000000-0000-4000-8000-000000000011',
        })
        .props.onPress();
    });
    expect(navigation.navigate).toHaveBeenCalledWith('CurriculumLesson', {
      lessonId: '00000000-0000-4000-8000-000000000011',
    });
  });

  it('skips the local package bootstrap in unified mode', async () => {
    await act(async () => {
      renderUnified();
    });
    expect(mockBootstrap).not.toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalled();
  });
});
