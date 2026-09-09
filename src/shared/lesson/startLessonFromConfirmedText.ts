import {createLessonV2Skeleton} from '@shared/api/lessonV2Client';
import type {AnalyzeSourceType} from '@shared/api/types';
import type {LessonV2} from '@shared/schemas/lesson-v2';
import {validateLessonV2InputText} from '@shared/utils/textValidation';

export type LessonDestination = 'v1_analyze' | 'v2_progressive';

export type LessonFeatureFlags = {lessonV2?: boolean};

export type NavigateFn = (
  screen: 'Analyzing' | 'ProgressiveLesson',
  params:
    | {
        confirmedText: string;
        sourceType: AnalyzeSourceType;
        origin: 'PasteText' | 'OCRReview';
      }
    | {lessonId: string; initialLesson: LessonV2},
) => void;

export function resolveLessonDestination(
  flags: LessonFeatureFlags,
): LessonDestination {
  return flags.lessonV2 ? 'v2_progressive' : 'v1_analyze';
}

export async function startLessonFromConfirmedText(args: {
  confirmedText: string;
  sourceType: AnalyzeSourceType;
  destination: LessonDestination;
  origin: 'PasteText' | 'OCRReview';
  navigate: NavigateFn;
}): Promise<{ok: true} | {ok: false; message: string; retryable: boolean}> {
  if (args.destination === 'v1_analyze') {
    args.navigate('Analyzing', {
      confirmedText: args.confirmedText,
      sourceType: args.sourceType,
      origin: args.origin,
    });
    return {ok: true};
  }

  const validation = validateLessonV2InputText(args.confirmedText);
  if (!validation.valid) {
    return {ok: false, message: validation.message, retryable: false};
  }

  const result = await createLessonV2Skeleton({
    confirmedText: validation.value,
    sourceType: args.sourceType,
  });

  if (!result.ok) {
    return {
      ok: false,
      message: result.message,
      retryable: result.retryable ?? false,
    };
  }

  args.navigate('ProgressiveLesson', {
    lessonId: result.lesson.lesson_id,
    initialLesson: result.lesson,
  });
  return {ok: true};
}
