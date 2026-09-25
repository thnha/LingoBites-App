import type {ComponentType} from 'react';
import {ExampleBlockView} from './ExampleBlockView';
import {ExerciseBlockView} from './ExerciseBlockView';
import {MediaBlockView} from './MediaBlockView';
import {TextBlockView} from './TextBlockView';
import {UnsupportedBlockView} from './UnsupportedBlockView';
import {VocabularyBlockView} from './VocabularyBlockView';

/**
 * `block.type → renderer` registry for curriculum lesson blocks.
 *
 * Dispatch is solely on the parsed `block.type` — never on lesson ID or any
 * other lesson-level field (AD-005). Unknown types cannot occur in the
 * parsed model (`parseCurriculumLessonBlock` degrades them to
 * `unsupported`), but {@link resolveCurriculumLessonBlockRenderer} still
 * falls back defensively so a renderer lookup can never return undefined.
 */

export const CURRICULUM_LESSON_BLOCK_RENDERERS = {
  text: TextBlockView,
  example: ExampleBlockView,
  vocabulary: VocabularyBlockView,
  media: MediaBlockView,
  exercise: ExerciseBlockView,
  unsupported: UnsupportedBlockView,
} as const satisfies Record<string, ComponentType<any>>;

export type CurriculumLessonBlockType =
  keyof typeof CURRICULUM_LESSON_BLOCK_RENDERERS;

export function resolveCurriculumLessonBlockRenderer(
  type: string,
): ComponentType<any> {
  const renderer = (
    CURRICULUM_LESSON_BLOCK_RENDERERS as Record<string, ComponentType<any>>
  )[type];
  return renderer ?? UnsupportedBlockView;
}
