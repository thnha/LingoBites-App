/**
 * Legacy re-export shim (LING-48 / TASK-007). `useFlashcardLibrary` is
 * owned by `@modules/review` now; this shim keeps the v1 lesson screens
 * compiling until TASK-010 removes them. New code must import from
 * `@modules/review` instead.
 */
export {useFlashcardLibrary} from '@modules/review';
