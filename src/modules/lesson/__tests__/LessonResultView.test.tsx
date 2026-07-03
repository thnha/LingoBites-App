import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {FeatureFlagProvider} from '../../../release';
import {
  EMPTY_GRAMMAR_MESSAGE,
  EMPTY_VOCABULARY_MESSAGE,
} from '../../../shared/copy/userMessages';
import {validFullOutput, validMinimalOutput} from '../../../shared/fixtures';
import type {AIOutput, GrammarPoint, VocabularyItem} from '../../../shared/schemas/ai-output-v1';
import {AppThemeProvider} from '../../../theme';
import {LessonResultView} from '../LessonResultView';

function renderLesson(lesson: AIOutput): string {
  let tree!: ReactTestRenderer.ReactTestRenderer;

  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider>
        <AppThemeProvider>
          <LessonResultView lesson={lesson} />
        </AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });

  return JSON.stringify(tree!.toJSON());
}

function buildLessonWithVocab(count: number): AIOutput {
  const vocabulary: VocabularyItem[] = Array.from({length: count}, (_, index) => ({
    id: `v${index + 1}`,
    word: `word-${index + 1}`,
    meaning_vi: `nghĩa ${index + 1}`,
  }));

  return {
    ...validFullOutput,
    vocabulary,
  };
}

function buildLessonWithGrammar(count: number): AIOutput {
  const grammar_points: GrammarPoint[] = Array.from({length: count}, (_, index) => ({
    id: `g${index + 1}`,
    name: `Grammar ${index + 1}`,
    vietnamese_name: `Ngữ pháp ${index + 1}`,
    pattern: 'pattern',
    found_in: 'found',
    explanation_vi: `Giải thích ${index + 1}`,
    examples: [],
  }));

  return {
    ...validFullOutput,
    grammar_points,
  };
}

describe('LessonResultView', () => {
  it('renders pronunciation and save button states', () => {
    let unsavedTree!: ReactTestRenderer.ReactTestRenderer;
    let savedTree!: ReactTestRenderer.ReactTestRenderer;

    const wrap = (lesson: React.ReactElement) => (
      <FeatureFlagProvider>
        <AppThemeProvider>{lesson}</AppThemeProvider>
      </FeatureFlagProvider>
    );

    ReactTestRenderer.act(() => {
      unsavedTree = ReactTestRenderer.create(
        wrap(
          <LessonResultView lesson={validFullOutput} saveState="unsaved" />,
        ),
      );
      savedTree = ReactTestRenderer.create(
        wrap(<LessonResultView lesson={validFullOutput} saveState="saved" />),
      );
    });

    const text = JSON.stringify(unsavedTree!.toJSON());

    expect(text).toContain('Luyện phát âm');
    expect(text).toContain('discount');
    expect(text).toContain('Lưu bài học');
    expect(
      unsavedTree!.root.findByProps({testID: 'save-lesson-enabled'}).props.disabled,
    ).toBe(false);
    expect(
      savedTree!.root.findByProps({testID: 'save-lesson-disabled'}).props.disabled,
    ).toBe(true);
    expect(JSON.stringify(savedTree!.toJSON())).toContain('Đã lưu');
  });

  it('renders valid-minimal without crash and shows canonical empty copy', () => {
    const text = renderLesson(validMinimalOutput);

    expect(text).toContain(EMPTY_VOCABULARY_MESSAGE);
    expect(text).toContain(EMPTY_GRAMMAR_MESSAGE);
    expect(text).toContain('Staff only.');
  });

  it('shows at most 5 vocabulary items with xem thêm', () => {
    const text = renderLesson(buildLessonWithVocab(6));

    expect(text).toContain('word-1');
    expect(text).toContain('word-5');
    expect(text).not.toContain('word-6');
    expect(text).toContain('xem thêm');
    expect(text).toContain('(1)');
  });

  it('shows at most 3 grammar points', () => {
    const text = renderLesson(buildLessonWithGrammar(5));

    expect(text).toContain('Ngữ pháp 1');
    expect(text).toContain('Ngữ pháp 3');
    expect(text).not.toContain('Ngữ pháp 4');
  });
});
