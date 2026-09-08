import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {LessonsHistoryScreen} from '../LessonsHistoryScreen';
import {AppThemeProvider} from '@theme';
import {FeatureFlagProvider} from '@/release';
import {bootstrapContentPackage} from '@modules/content';

const mockRefresh = jest.fn();

jest.mock('../useLibrarySegments', () => ({
  useLibrarySegments: () => ({
    personalLessons: [],
    packagedLessons: [
      {
        id: 'lesson-1',
        lessonId: 'lesson-1',
        titleVi: 'Giới thiệu bản thân và Công nghệ sử dụng',
        blurbVi: 'Học cách giới thiệu tên, vai trò...',
        titleEn: 'Self Introduction & Tech Stack',
        level: 'A1',
        estimatedDurationMinutes: 15,
      },
    ],
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

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => callback(),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('@modules/content', () => ({
  bootstrapContentPackage: jest.fn(),
}));

describe('LessonsHistoryScreen Bootstrap Integration (SETE-114)', () => {
  const mockNavigation: any = {
    navigate: jest.fn(),
    getParent: jest.fn().mockReturnValue({navigate: jest.fn()}),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRefresh.mockClear();
  });

  it('triggers bootstrap and renders packaged lessons in lessons tab', async () => {
    (bootstrapContentPackage as jest.Mock).mockResolvedValue({
      ok: true,
      status: 'installed',
      packageId: 'pkg-1',
      lessonCount: 16,
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <LessonsHistoryScreen
              navigation={mockNavigation}
              route={{key: '1', name: 'LessonsList'}}
            />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });

    expect(bootstrapContentPackage).toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalled();

    const lessonItem = tree!.root.findByProps({
      testID: 'lesson-item-lesson-1',
    });
    expect(lessonItem).toBeTruthy();
  });

  it('still refreshes library segments when bootstrap fails', async () => {
    (bootstrapContentPackage as jest.Mock).mockResolvedValue({
      ok: false,
      status: 'failed',
      error: {code: 'INVALID_ZIP', message: 'Package corrupt'},
      previousActivePackageId: null,
    });

    await act(async () => {
      ReactTestRenderer.create(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <LessonsHistoryScreen
              navigation={mockNavigation}
              route={{key: '1', name: 'LessonsList'}}
            />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });

    expect(bootstrapContentPackage).toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalled();
  });
});
