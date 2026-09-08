import {
  clearAllLocalData,
  deleteLesson,
  findLessonByInputHash,
  getLessonById,
  listLessons,
  saveLesson,
} from '../../shared/db/LessonRepository';

/**
 * Public entry point for saved-lesson persistence. Screens call this instead
 * of importing `shared/db/LessonRepository` directly (SETE-118 Việc 3) — the
 * repository stays synchronous under the hood, this only relocates which
 * layer is allowed to know about it. Not to be confused with
 * `useLessonLibrary`, the pre-existing hook for the Library screen's
 * search/filter/summary UI state.
 *
 * Each member forwards to the repository by name at call time (not captured
 * once into an object) so `jest.spyOn(LessonRepository, ...)` in existing
 * tests keeps working through this indirection.
 */
export function useLessonRepository() {
  return lessonRepository;
}

const lessonRepository = {
  listLessons: (...args: Parameters<typeof listLessons>) =>
    listLessons(...args),
  getLessonById: (...args: Parameters<typeof getLessonById>) =>
    getLessonById(...args),
  findLessonByInputHash: (...args: Parameters<typeof findLessonByInputHash>) =>
    findLessonByInputHash(...args),
  saveLesson: (...args: Parameters<typeof saveLesson>) => saveLesson(...args),
  deleteLesson: (...args: Parameters<typeof deleteLesson>) =>
    deleteLesson(...args),
  clearAllLocalData: (...args: Parameters<typeof clearAllLocalData>) =>
    clearAllLocalData(...args),
};
