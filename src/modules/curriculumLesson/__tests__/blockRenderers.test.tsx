import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {FeatureFlagProvider} from '@/release';
import {makeTestReleaseConfig, THEME_UI_FLAGS} from '@/test-support';
import {AppThemeProvider} from '@theme';
import {
  CURRICULUM_LESSON_BLOCK_RENDERERS,
  resolveCurriculumLessonBlockRenderer,
} from '../blockRegistry';
import {ExampleBlockView} from '../ExampleBlockView';
import {
  ExerciseBlockView,
  type CurriculumLessonCheckFn,
} from '../ExerciseBlockView';
import {MediaBlockView} from '../MediaBlockView';
import {TextBlockView} from '../TextBlockView';
import {UnsupportedBlockView} from '../UnsupportedBlockView';
import {VocabularyBlockView} from '../VocabularyBlockView';
import type {
  CurriculumLessonCheckResult,
  CurriculumLessonAnswerInput,
} from '../curriculumLessonClient';
import type {
  CurriculumLessonExercise,
  CurriculumLessonMediaAsset,
} from '../curriculumLessonSchema';
import type {
  CurriculumLessonSoundFactory,
  CurriculumLessonSoundHandle,
} from '../curriculumLessonAudio';

async function renderWithTheme(ui: React.ReactElement) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <FeatureFlagProvider
        releaseConfig={makeTestReleaseConfig(THEME_UI_FLAGS)}
      >
        <AppThemeProvider>{ui}</AppThemeProvider>
      </FeatureFlagProvider>,
    );
  });
  return tree;
}

function textOf(tree: ReactTestRenderer.ReactTestRenderer, testID: string) {
  const node = tree.root.findByProps({testID});
  const children = node.props.children;
  return (Array.isArray(children) ? children : [children])
    .map(child => (typeof child === 'string' ? child : ''))
    .join('');
}

function queryByTestID(
  tree: ReactTestRenderer.ReactTestRenderer,
  testID: string,
) {
  const found = tree.root.findAllByProps({testID});
  return found.length > 0 ? found[0] : null;
}

async function press(
  tree: ReactTestRenderer.ReactTestRenderer,
  testID: string,
) {
  await act(async () => {
    tree.root.findByProps({testID}).props.onPress();
  });
}

const EXERCISE: CurriculumLessonExercise = {
  id: '00000000-0000-4000-8000-000000000040',
  type: 'multiple_choice',
  instruction: 'Choose the best answer.',
  prompt: "How do you ask someone's name?",
  config: {
    options: [
      {id: 'a', label: "What's your name?"},
      {id: 'b', label: 'Where are you?'},
    ],
  },
};

function okCheck(correct: boolean): CurriculumLessonCheckResult {
  return {
    ok: true,
    requestId: '00000000-0000-4000-8000-000000000098',
    correct,
    explanation: {en: correct ? 'Correct!' : 'Review the greeting.'},
  };
}

describe('TextBlockView', () => {
  it('renders content with its variant label', async () => {
    const tree = await renderWithTheme(
      <TextBlockView
        data={{content: 'Welcome to the lesson.', variant: 'body'}}
      />,
    );
    expect(textOf(tree, 'block-text-content')).toBe('Welcome to the lesson.');
    expect(textOf(tree, 'block-text-variant')).toBe('Reading');
  });

  it('omits the variant label when no variant is set', async () => {
    const tree = await renderWithTheme(
      <TextBlockView data={{content: 'Plain text.'}} />,
    );
    expect(textOf(tree, 'block-text-content')).toBe('Plain text.');
    expect(queryByTestID(tree, 'block-text-variant')).toBeNull();
  });
});

describe('ExampleBlockView', () => {
  it('renders source, translation, and highlight chips', async () => {
    const tree = await renderWithTheme(
      <ExampleBlockView
        data={{
          source: "What's your name?",
          translation: 'Bạn tên gì?',
          highlight: ['name'],
        }}
      />,
    );
    expect(textOf(tree, 'block-example-source')).toBe("What's your name?");
    expect(textOf(tree, 'block-example-translation')).toBe('Bạn tên gì?');
    const chips = tree.root.findByProps({testID: 'block-example-highlights'});
    expect(chips.findAllByType(Text).map(node => node.props.children)).toEqual([
      'name',
    ]);
  });

  it('omits optional translation and highlights', async () => {
    const tree = await renderWithTheme(
      <ExampleBlockView data={{source: 'Hello.'}} />,
    );
    expect(textOf(tree, 'block-example-source')).toBe('Hello.');
    expect(queryByTestID(tree, 'block-example-translation')).toBeNull();
    expect(queryByTestID(tree, 'block-example-highlights')).toBeNull();
  });
});

describe('VocabularyBlockView', () => {
  const items = [
    {
      id: '00000000-0000-4000-8000-000000000020',
      lemma: 'name',
      meaning: 'tên',
      ipa: '/neɪm/',
      audio: null,
      image: null,
    },
    {
      id: '00000000-0000-4000-8000-000000000021',
      lemma: 'hello',
      meaning: 'xin chào',
      ipa: null,
      audio: null,
      image: null,
    },
  ];

  it('renders items in the given order with null-media fallbacks', async () => {
    const tree = await renderWithTheme(<VocabularyBlockView items={items} />);
    const lemmas = tree.root
      .findAllByType(Text)
      .filter(
        node =>
          typeof node.props?.testID === 'string' &&
          node.props.testID.startsWith('vocabulary-lemma-'),
      )
      .map(node => node.props.children);
    expect(lemmas).toEqual(['name', 'hello']);
    expect(
      textOf(tree, 'vocabulary-meaning-00000000-0000-4000-8000-000000000020'),
    ).toBe('tên');
    expect(
      queryByTestID(
        tree,
        'vocabulary-no-media-00000000-0000-4000-8000-000000000020',
      ),
    ).not.toBeNull();
    expect(
      queryByTestID(
        tree,
        'vocabulary-ipa-00000000-0000-4000-8000-000000000021',
      ),
    ).toBeNull();
  });

  it('shows an empty message when there are no items', async () => {
    const tree = await renderWithTheme(<VocabularyBlockView items={[]} />);
    expect(textOf(tree, 'block-vocabulary-empty')).toContain('No vocabulary');
  });
});

describe('MediaBlockView image', () => {
  const image: CurriculumLessonMediaAsset = {
    id: '00000000-0000-4000-8000-000000000030',
    type: 'image',
    url: 'https://cdn.example.com/curriculum/hello.png',
    altText: 'Greeting illustration',
    caption: 'Say hello',
  };

  it('renders the image with alt text and caption', async () => {
    const tree = await renderWithTheme(<MediaBlockView media={image} />);
    const node = tree.root.findByProps({testID: 'media-image'});
    expect(node.props.source).toEqual({uri: image.url});
    expect(node.props.accessibilityLabel).toBe('Greeting illustration');
    expect(textOf(tree, 'block-media-caption')).toBe('Say hello');
  });

  it('shows a local fallback when the image fails to load', async () => {
    const tree = await renderWithTheme(<MediaBlockView media={image} />);
    await act(async () => {
      tree.root.findByProps({testID: 'media-image'}).props.onError();
    });
    expect(queryByTestID(tree, 'media-image')).toBeNull();
    expect(queryByTestID(tree, 'media-image-fallback')).not.toBeNull();
  });
});

describe('MediaBlockView audio', () => {
  const audio: CurriculumLessonMediaAsset = {
    id: '00000000-0000-4000-8000-000000000031',
    type: 'audio',
    url: 'https://cdn.example.com/curriculum/hello.mp3',
    altText: 'Greeting audio',
    caption: null,
  };

  function makeFake() {
    let onEnd: ((success: boolean) => void) | null = null;
    const handle: CurriculumLessonSoundHandle = {
      play: jest.fn((cb?: (success: boolean) => void) => {
        onEnd = cb ?? null;
      }),
      pause: jest.fn(),
      stop: jest.fn(),
      release: jest.fn(),
    };
    const factory: CurriculumLessonSoundFactory = jest.fn(() => handle);
    return {handle, factory, finish: (ok = true) => onEnd?.(ok)};
  }

  it('plays, pauses, and replays through the injected factory', async () => {
    const {handle, factory} = makeFake();
    const tree = await renderWithTheme(
      <MediaBlockView media={audio} createSound={factory} />,
    );
    expect(textOf(tree, 'media-audio-status')).toContain('Tap play');
    await press(tree, 'media-audio-play-pause');
    expect(factory).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledWith(audio.url);
    expect(handle.play).toHaveBeenCalledTimes(1);
    expect(textOf(tree, 'media-audio-status')).toContain('Playing');

    await press(tree, 'media-audio-play-pause');
    expect(handle.pause).toHaveBeenCalledTimes(1);
    expect(textOf(tree, 'media-audio-status')).toContain('Paused');

    await press(tree, 'media-audio-replay');
    expect(handle.stop).toHaveBeenCalledTimes(1);
    expect(handle.play).toHaveBeenCalledTimes(2);
  });

  it('releases the sound on unmount', async () => {
    const {handle, factory} = makeFake();
    const tree = await renderWithTheme(
      <MediaBlockView media={audio} createSound={factory} />,
    );
    await press(tree, 'media-audio-play-pause');
    await act(async () => {
      tree.unmount();
    });
    expect(handle.release).toHaveBeenCalledTimes(1);
  });

  it('releases the old sound when the source changes', async () => {
    const first = makeFake();
    const second = makeFake();
    const factory: CurriculumLessonSoundFactory = jest.fn((url: string) =>
      url === audio.url ? first.handle : second.handle,
    );
    const renderAudio = (media: CurriculumLessonMediaAsset) => (
      <FeatureFlagProvider
        releaseConfig={makeTestReleaseConfig(THEME_UI_FLAGS)}
      >
        <AppThemeProvider>
          <MediaBlockView media={media} createSound={factory} />
        </AppThemeProvider>
      </FeatureFlagProvider>
    );
    const tree = await renderWithTheme(renderAudio(audio));
    await press(tree, 'media-audio-play-pause');
    const next: CurriculumLessonMediaAsset = {
      ...audio,
      id: '00000000-0000-4000-8000-000000000032',
      url: 'https://cdn.example.com/curriculum/bye.mp3',
    };
    await act(async () => {
      tree.update(renderAudio(next));
    });
    expect(first.handle.release).toHaveBeenCalledTimes(1);
    expect(second.handle.release).not.toHaveBeenCalled();
    expect(textOf(tree, 'media-audio-status')).toContain('Tap play');
  });

  it('shows an error when playback fails', async () => {
    const {finish, factory} = makeFake();
    const tree = await renderWithTheme(
      <MediaBlockView media={audio} createSound={factory} />,
    );
    await press(tree, 'media-audio-play-pause');
    await act(async () => {
      finish(false);
    });
    expect(textOf(tree, 'media-audio-status')).toContain('could not be played');
  });

  it('shows an unavailable message when no sound can be created', async () => {
    const factory: CurriculumLessonSoundFactory = jest.fn(() => null);
    const tree = await renderWithTheme(
      <MediaBlockView media={audio} createSound={factory} />,
    );
    await press(tree, 'media-audio-play-pause');
    expect(textOf(tree, 'media-audio-status')).toContain('not available');
  });
});

describe('ExerciseBlockView', () => {
  function checkReturning(
    result: CurriculumLessonCheckResult | Promise<CurriculumLessonCheckResult>,
  ): CurriculumLessonCheckFn {
    return jest.fn(
      async (_id: string, _answer: CurriculumLessonAnswerInput) => result,
    );
  }

  it('disables submit until an option is selected', async () => {
    const onCheck = checkReturning(okCheck(true));
    const tree = await renderWithTheme(
      <ExerciseBlockView exercise={EXERCISE} onCheckExercise={onCheck} />,
    );
    expect(textOf(tree, 'block-exercise-prompt')).toContain('name');
    expect(
      tree.root.findByProps({testID: 'exercise-submit'}).props
        .accessibilityState,
    ).toEqual({disabled: true});
    await press(tree, 'exercise-option-a');
    expect(
      tree.root.findByProps({testID: 'exercise-submit'}).props
        .accessibilityState,
    ).toEqual({disabled: false});
    expect(onCheck).not.toHaveBeenCalled();
  });

  it('shows correct feedback with the server explanation', async () => {
    const onCheck = checkReturning(okCheck(true));
    const tree = await renderWithTheme(
      <ExerciseBlockView exercise={EXERCISE} onCheckExercise={onCheck} />,
    );
    await press(tree, 'exercise-option-a');
    await press(tree, 'exercise-submit');
    expect(onCheck).toHaveBeenCalledWith(EXERCISE.id, {optionId: 'a'});
    expect(queryByTestID(tree, 'exercise-feedback-correct')).not.toBeNull();
    expect(textOf(tree, 'exercise-feedback-message')).toBe('Correct!');
  });

  it('shows incorrect feedback with the server explanation', async () => {
    const onCheck = checkReturning(okCheck(false));
    const tree = await renderWithTheme(
      <ExerciseBlockView exercise={EXERCISE} onCheckExercise={onCheck} />,
    );
    await press(tree, 'exercise-option-b');
    await press(tree, 'exercise-submit');
    expect(queryByTestID(tree, 'exercise-feedback-incorrect')).not.toBeNull();
    expect(textOf(tree, 'exercise-feedback-message')).toBe(
      'Review the greeting.',
    );
  });

  it('shows error feedback for an invalid answer without crashing', async () => {
    const onCheck = checkReturning({
      ok: false,
      kind: 'invalid-answer',
      errorCode: 'INVALID_EXERCISE_ANSWER',
      message: 'Answer must include an option.',
      retryable: false,
    });
    const tree = await renderWithTheme(
      <ExerciseBlockView exercise={EXERCISE} onCheckExercise={onCheck} />,
    );
    await press(tree, 'exercise-option-a');
    await press(tree, 'exercise-submit');
    expect(queryByTestID(tree, 'exercise-feedback-error')).not.toBeNull();
    expect(textOf(tree, 'exercise-feedback-message')).toBe(
      'Answer must include an option.',
    );
  });

  it('suppresses duplicate taps while a check is pending', async () => {
    let resolveCheck!: (r: CurriculumLessonCheckResult) => void;
    const gated = new Promise<CurriculumLessonCheckResult>(resolve => {
      resolveCheck = resolve;
    });
    const onCheck = jest.fn(async () => gated);
    const tree = await renderWithTheme(
      <ExerciseBlockView exercise={EXERCISE} onCheckExercise={onCheck} />,
    );
    await press(tree, 'exercise-option-a');
    let submitPromise!: Promise<void>;
    await act(async () => {
      submitPromise = tree.root
        .findByProps({testID: 'exercise-submit'})
        .props.onPress();
    });
    expect(queryByTestID(tree, 'exercise-pending')).not.toBeNull();
    await act(async () => {
      await tree.root.findByProps({testID: 'exercise-submit'}).props.onPress();
    });
    expect(onCheck).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveCheck(okCheck(true));
      await submitPromise;
    });
    expect(queryByTestID(tree, 'exercise-pending')).toBeNull();
    expect(queryByTestID(tree, 'exercise-feedback-correct')).not.toBeNull();
  });
});

describe('UnsupportedBlockView', () => {
  it('renders a safe placeholder that keeps the lesson going', async () => {
    const tree = await renderWithTheme(
      <UnsupportedBlockView
        block={{type: 'unsupported', blockId: 'x', position: 7, raw: {}}}
      />,
    );
    expect(queryByTestID(tree, 'block-unsupported')).not.toBeNull();
    expect(textOf(tree, 'block-unsupported-message')).toContain(
      'safely continue',
    );
  });
});

describe('blockRegistry', () => {
  it('resolves every known block type to its renderer', () => {
    expect(resolveCurriculumLessonBlockRenderer('text')).toBe(TextBlockView);
    expect(resolveCurriculumLessonBlockRenderer('example')).toBe(
      ExampleBlockView,
    );
    expect(resolveCurriculumLessonBlockRenderer('vocabulary')).toBe(
      VocabularyBlockView,
    );
    expect(resolveCurriculumLessonBlockRenderer('media')).toBe(MediaBlockView);
    expect(resolveCurriculumLessonBlockRenderer('exercise')).toBe(
      ExerciseBlockView,
    );
    expect(resolveCurriculumLessonBlockRenderer('unsupported')).toBe(
      UnsupportedBlockView,
    );
    expect(CURRICULUM_LESSON_BLOCK_RENDERERS.text).toBe(TextBlockView);
  });

  it('falls back to the unsupported renderer for unknown types', () => {
    expect(resolveCurriculumLessonBlockRenderer('quiz')).toBe(
      UnsupportedBlockView,
    );
    expect(resolveCurriculumLessonBlockRenderer('')).toBe(UnsupportedBlockView);
  });
});
