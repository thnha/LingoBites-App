import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {LessonsHistoryScreen} from '../LessonsHistoryScreen';
import {AppThemeProvider} from '@theme';
import {FeatureFlagProvider} from '@/release';
import {bootstrapContentPackage} from '@modules/content/bootstrap';
import {listActivePackageLessons} from '@shared/db/ContentRuntimeRepository';

jest.mock('@modules/content/bootstrap', () => ({
  bootstrapContentPackage: jest.fn(),
}));

jest.mock('@shared/db/ContentRuntimeRepository', () => ({
  listActivePackageLessons: jest.fn(),
}));

describe('LessonsHistoryScreen Bootstrap Integration (SETE-114)', () => {
  const mockNavigation: any = {
    navigate: jest.fn(),
    getParent: jest.fn().mockReturnValue({navigate: jest.fn()}),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('triggers bootstrap and renders packaged lessons directly when bootstrap succeeds', async () => {
    (bootstrapContentPackage as jest.Mock).mockResolvedValue({
      ok: true,
      status: 'installed',
      packageId: 'pkg-1',
      lessonCount: 16,
    });
    (listActivePackageLessons as jest.Mock).mockReturnValue([
      {
        id: 'lesson-1',
        titleEn: 'Self Introduction & Tech Stack',
        titleVi: 'Giới thiệu bản thân và Công nghệ sử dụng',
        blurbVi: 'Học cách giới thiệu tên, vai trò...',
        level: 'A1',
        estimatedDurationMinutes: 15,
      },
    ]);

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

    const packagedCard = tree!.root.findByProps({
      testID: 'packaged-lesson-lesson-1',
    });
    expect(packagedCard).toBeTruthy();

    await act(async () => {
      packagedCard.props.onPress();
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      'ContentLessonDetail',
      {
        lessonId: 'lesson-1',
      },
    );
  });

  it('renders recoverable error state with Thử lại button when bootstrap fails', async () => {
    (bootstrapContentPackage as jest.Mock).mockResolvedValue({
      ok: false,
      status: 'failed',
      error: {code: 'INVALID_ZIP', message: 'Package corrupt'},
      previousActivePackageId: null,
    });
    (listActivePackageLessons as jest.Mock).mockReturnValue([]);

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

    const retryBtn = tree!.root.findByProps({
      testID: 'content-bootstrap-retry',
    });
    expect(retryBtn).toBeTruthy();

    (bootstrapContentPackage as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 'installed',
      packageId: 'pkg-1',
      lessonCount: 16,
    });
    (listActivePackageLessons as jest.Mock).mockReturnValue([
      {
        id: 'lesson-1',
        titleEn: 'Self Introduction',
        titleVi: 'Giới thiệu bản thân',
        blurbVi: 'Blurb',
        level: 'A1',
        estimatedDurationMinutes: 15,
      },
    ]);

    await act(async () => {
      retryBtn.props.onPress();
    });

    expect(bootstrapContentPackage).toHaveBeenCalledTimes(2);
  });
});
