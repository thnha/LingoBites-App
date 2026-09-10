import React from 'react';
import {StyleSheet} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {AppThemeProvider} from '@theme';
import {FeatureFlagProvider} from '@/release';
import {LessonsTabContent} from '../LessonsTabContent';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

const renderedTrees: ReactTestRenderer.ReactTestRenderer[] = [];

function render(ui: React.ReactElement) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>{ui}</AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  renderedTrees.push(tree);
  return tree;
}

const mockPersonalLesson = {
  id: 'personal-1',
  title: 'English Basics',
  summary: 'Learn basic English',
  sourceType: 'paste_text',
};

const mockPersonalLesson2 = {
  id: 'personal-2',
  title: 'Advanced Grammar',
  summary: 'Master advanced grammar rules',
  sourceType: 'camera',
};

const mockPackagedLesson = {
  id: 'packaged-1',
  titleVi: 'Tiếng Anh Giao Tiếp',
  blurbVi: 'Khóa học giao tiếp tiếng Anh',
  titleEn: 'English Communication',
  level: 'A1',
  estimatedDurationMinutes: 30,
};

const mockPackagedLesson2 = {
  id: 'packaged-2',
  titleVi: 'Tiếng Anh Kinh Doanh',
  blurbVi: 'Khóa học tiếng Anh kinh doanh',
  titleEn: 'Business English',
  level: 'B1',
  estimatedDurationMinutes: 45,
};

describe('LessonsTabContent', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  afterEach(() => {
    renderedTrees.splice(0).forEach(tree => {
      act(() => {
        tree.unmount();
      });
    });
  });

  it('renders two sections with correct titles', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[mockPersonalLesson]}
        packagedLessons={[mockPackagedLesson]}
      />,
    );

    const sectionList = tree.root.findByProps({testID: 'lessons-section-list'});
    expect(sectionList.props.sections).toHaveLength(2);
    expect(sectionList.props.sections[0].title).toBe('Bài học cá nhân');
    expect(sectionList.props.sections[1].title).toBe('Bài học theo lộ trình');
  });

  it('shows empty state when no lessons', () => {
    const tree = render(
      <LessonsTabContent personalLessons={[]} packagedLessons={[]} />,
    );

    const emptyState = tree.root.findByProps({
      testID: 'empty-state-message-lessons',
    });
    expect(emptyState).toBeDefined();
  });

  it('displays personal lesson cards', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[mockPersonalLesson]}
        packagedLessons={[]}
      />,
    );

    const titleText = tree.root.findByProps({
      testID: 'lesson-title-personal-1',
    });
    expect(titleText.props.children).toBe('English Basics');

    const summaryText = tree.root.findByProps({
      testID: 'lesson-summary-personal-1',
    });
    expect(summaryText.props.children).toBe('Learn basic English');
  });

  it('displays packaged lesson cards', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[]}
        packagedLessons={[mockPackagedLesson]}
      />,
    );

    const titleText = tree.root.findByProps({
      testID: 'lesson-title-packaged-1',
    });
    expect(titleText.props.children).toBe('Tiếng Anh Giao Tiếp');

    const summaryText = tree.root.findByProps({
      testID: 'lesson-summary-packaged-1',
    });
    expect(summaryText.props.children).toBe('Khóa học giao tiếp tiếng Anh');
  });

  it('navigates to SavedLessonDetail when personal lesson is pressed', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[mockPersonalLesson]}
        packagedLessons={[]}
      />,
    );

    const pressable = tree.root.findByProps({
      testID: 'lesson-item-personal-1',
    });

    act(() => {
      pressable.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('SavedLessonDetail', {
      lessonId: 'personal-1',
    });
  });

  it('navigates to ContentLessonRuntime when packaged lesson is pressed', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[]}
        packagedLessons={[mockPackagedLesson]}
      />,
    );

    const pressable = tree.root.findByProps({
      testID: 'lesson-item-packaged-1',
    });

    act(() => {
      pressable.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('ContentLessonRuntime', {
      lessonId: 'packaged-1',
    });
  });

  it('filters out empty sections', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[mockPersonalLesson]}
        packagedLessons={[]}
      />,
    );

    const sectionList = tree.root.findByProps({testID: 'lessons-section-list'});
    expect(sectionList.props.sections).toHaveLength(1);
    expect(sectionList.props.sections[0].title).toBe('Bài học cá nhân');
  });

  it('renders multiple personal lessons', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[mockPersonalLesson, mockPersonalLesson2]}
        packagedLessons={[]}
      />,
    );

    const sectionList = tree.root.findByProps({testID: 'lessons-section-list'});
    expect(sectionList.props.sections[0].data).toHaveLength(2);
  });

  it('renders multiple packaged lessons', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[]}
        packagedLessons={[mockPackagedLesson, mockPackagedLesson2]}
      />,
    );

    const sectionList = tree.root.findByProps({testID: 'lessons-section-list'});
    expect(sectionList.props.sections[0].data).toHaveLength(2);
  });

  it('handles personal lessons without summary', () => {
    const lessonNoSummary = {
      ...mockPersonalLesson,
      summary: null,
    };

    const tree = render(
      <LessonsTabContent
        personalLessons={[lessonNoSummary]}
        packagedLessons={[]}
      />,
    );

    const titleText = tree.root.findByProps({
      testID: 'lesson-title-personal-1',
    });
    expect(titleText.props.children).toBe('English Basics');

    const summaryTexts = tree.root.findAllByProps({
      testID: 'lesson-summary-personal-1',
    });
    expect(summaryTexts).toHaveLength(0);
  });

  it('handles both personal and packaged lessons together', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[mockPersonalLesson, mockPersonalLesson2]}
        packagedLessons={[mockPackagedLesson, mockPackagedLesson2]}
      />,
    );

    const sectionList = tree.root.findByProps({testID: 'lessons-section-list'});
    expect(sectionList.props.sections).toHaveLength(2);
    expect(sectionList.props.sections[0].data).toHaveLength(2);
    expect(sectionList.props.sections[1].data).toHaveLength(2);
  });

  it('lesson titles use h3 variant', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[mockPersonalLesson]}
        packagedLessons={[]}
      />,
    );

    const titleText = tree.root.findByProps({
      testID: 'lesson-title-personal-1',
    });
    expect(titleText.props.variant).toBe('h3');
  });

  it('lesson summaries use label variant with secondary color', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[mockPersonalLesson]}
        packagedLessons={[]}
      />,
    );

    const summaryText = tree.root.findByProps({
      testID: 'lesson-summary-personal-1',
    });
    expect(summaryText.props.variant).toBe('label');
    expect(summaryText.props.color).toBe('secondary');
  });

  it('lesson pressables have correct accessibility roles', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[mockPersonalLesson]}
        packagedLessons={[]}
      />,
    );

    const pressable = tree.root.findByProps({
      testID: 'lesson-item-personal-1',
    });
    expect(pressable.props.accessibilityRole).toBe('button');
    expect(pressable.props.accessibilityLabel).toBe('English Basics');
  });

  it('handles empty packaged lessons blurbVi gracefully', () => {
    const lessonNoBlurb = {
      id: 'packaged-3',
      titleVi: 'Tiếng Anh Cơ Bản',
      blurbVi: null,
      titleEn: 'Basic English',
      level: 'A1',
      estimatedDurationMinutes: 30,
    };

    const tree = render(
      <LessonsTabContent personalLessons={[]} packagedLessons={[lessonNoBlurb]} />,
    );

    const titleText = tree.root.findByProps({
      testID: 'lesson-title-packaged-3',
    });
    expect(titleText.props.children).toBe('Tiếng Anh Cơ Bản');

    const summaryTexts = tree.root.findAllByProps({
      testID: 'lesson-summary-packaged-3',
    });
    expect(summaryTexts).toHaveLength(0);
  });

  it('keeps sticky headers enabled so sections stay grouped', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[mockPersonalLesson]}
        packagedLessons={[]}
      />,
    );

    const sectionList = tree.root.findByProps({testID: 'lessons-section-list'});
    expect(sectionList.props.stickySectionHeadersEnabled).toBe(true);
  });

  it('gives section headers an opaque background so cards never show through (SETE-210 P0)', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[mockPersonalLesson]}
        packagedLessons={[]}
      />,
    );

    const sectionList = tree.root.findByProps({testID: 'lessons-section-list'});
    const header = sectionList.props.renderSectionHeader({
      section: sectionList.props.sections[0],
    });
    const flat = StyleSheet.flatten(header.props.style);
    expect(flat.backgroundColor).toBeTruthy();
    expect(flat.zIndex).toBeGreaterThan(0);
  });

  it('truncates card summaries to two lines', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[mockPersonalLesson]}
        packagedLessons={[]}
      />,
    );

    const summaryText = tree.root.findByProps({
      testID: 'lesson-summary-personal-1',
    });
    expect(summaryText.props.numberOfLines).toBe(2);
    expect(summaryText.props.ellipsizeMode).toBe('tail');
  });

  it('re-renders when personalLessons prop changes', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[mockPersonalLesson]}
        packagedLessons={[]}
      />,
    );

    let sectionList = tree.root.findByProps({testID: 'lessons-section-list'});
    expect(sectionList.props.sections[0].data).toHaveLength(1);

    act(() => {
      tree.update(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <LessonsTabContent
              personalLessons={[mockPersonalLesson, mockPersonalLesson2]}
              packagedLessons={[]}
            />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });

    sectionList = tree.root.findByProps({testID: 'lessons-section-list'});
    expect(sectionList.props.sections[0].data).toHaveLength(2);
  });

  it('re-renders when packagedLessons prop changes', () => {
    const tree = render(
      <LessonsTabContent
        personalLessons={[]}
        packagedLessons={[mockPackagedLesson]}
      />,
    );

    let sectionList = tree.root.findByProps({testID: 'lessons-section-list'});
    expect(sectionList.props.sections[0].data).toHaveLength(1);

    act(() => {
      tree.update(
        <FeatureFlagProvider>
          <AppThemeProvider>
            <LessonsTabContent
              personalLessons={[]}
              packagedLessons={[mockPackagedLesson, mockPackagedLesson2]}
            />
          </AppThemeProvider>
        </FeatureFlagProvider>,
      );
    });

    sectionList = tree.root.findByProps({testID: 'lessons-section-list'});
    expect(sectionList.props.sections[0].data).toHaveLength(2);
  });
});
