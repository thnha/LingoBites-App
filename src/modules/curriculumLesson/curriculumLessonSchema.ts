/**
 * CurriculumLesson runtime contract (App side).
 *
 * Mirrors the learner-safe Zod contract from LingoBites-Server
 * `src/modules/curriculum/lessonDelivery/model/` at fixture revision
 * `ling-18-task-001-r1` (Server commit
 * `7681bb9fb9970af9972b9ca9a1eb63c73386b33b`). Field names are copied
 * from that contract — never renamed or invented here. Bounds below are
 * the same numeric limits; the Server remains authoritative and any
 * divergence must be escalated (do not "fix" it locally).
 *
 * Unrelated to Lesson V2 (`lessonV2Client.ts`, `lesson-v2` schemas,
 * `ProgressiveLessonScreen`, `LessonV2HubView`): this module must never
 * import from those files.
 */
import {z} from 'zod';

export const CURRICULUM_LESSON_FIXTURE_REVISION = 'ling-18-task-001-r1';
export const CURRICULUM_LESSON_SERVER_FIXTURE_SHA =
  '7681bb9fb9970af9972b9ca9a1eb63c73386b33b';

const CURRICULUM_LESSON_TITLE_MAX = 512;
const CURRICULUM_LESSON_DESCRIPTION_MAX = 10_000;
const CURRICULUM_LESSON_TEXT_CONTENT_MAX = 50_000;
const CURRICULUM_LESSON_EXAMPLE_TEXT_MAX = 10_000;
const CURRICULUM_LESSON_EXAMPLE_TRANSLATION_MAX = 10_000;
const CURRICULUM_LESSON_HIGHLIGHT_ITEM_MAX = 128;
const CURRICULUM_LESSON_HIGHLIGHT_MAX_ITEMS = 64;
const CURRICULUM_LESSON_MEDIA_CAPTION_MAX = 512;
const CURRICULUM_LESSON_MEDIA_ALT_TEXT_MAX = 512;
const CURRICULUM_LESSON_OPTION_ID_MAX = 64;
const CURRICULUM_LESSON_OPTION_LABEL_MAX = 512;
const CURRICULUM_LESSON_OPTIONS_MIN = 2;
const CURRICULUM_LESSON_OPTIONS_MAX = 8;
const CURRICULUM_LESSON_EXPLANATION_KEY_MAX = 32;
const CURRICULUM_LESSON_EXPLANATION_TEXT_MAX = 2_000;
const CURRICULUM_LESSON_EXPLANATION_KEYS_MAX = 8;

export const CurriculumLessonTextVariantValues = [
  'body',
  'note',
  'tip',
  'grammar',
] as const;

export const CurriculumLessonTextBlockDataSchema = z
  .object({
    content: z.string().trim().min(1).max(CURRICULUM_LESSON_TEXT_CONTENT_MAX),
    variant: z.enum(CurriculumLessonTextVariantValues).optional(),
  })
  .strict();

export const CurriculumLessonExampleBlockDataSchema = z
  .object({
    source: z.string().trim().min(1).max(CURRICULUM_LESSON_EXAMPLE_TEXT_MAX),
    translation: z
      .string()
      .trim()
      .min(1)
      .max(CURRICULUM_LESSON_EXAMPLE_TRANSLATION_MAX)
      .optional(),
    highlight: z
      .array(z.string().trim().min(1).max(CURRICULUM_LESSON_HIGHLIGHT_ITEM_MAX))
      .max(CURRICULUM_LESSON_HIGHLIGHT_MAX_ITEMS)
      .optional(),
  })
  .strict();

export const CurriculumLessonVocabularyItemSchema = z
  .object({
    id: z.string().uuid(),
    lemma: z.string(),
    meaning: z.string(),
    ipa: z.string().nullable(),
    audio: z.null(),
    image: z.null(),
  })
  .strict();

export const CurriculumLessonMediaAssetSchema = z
  .object({
    id: z.string().uuid(),
    type: z.enum(['image', 'audio']),
    url: z.string().url(),
    altText: z.string().trim().min(1).max(CURRICULUM_LESSON_MEDIA_ALT_TEXT_MAX),
    caption: z
      .string()
      .trim()
      .min(1)
      .max(CURRICULUM_LESSON_MEDIA_CAPTION_MAX)
      .nullable(),
  })
  .strict();

export const CurriculumLessonMultipleChoiceOptionSchema = z
  .object({
    id: z.string().trim().min(1).max(CURRICULUM_LESSON_OPTION_ID_MAX),
    label: z.string().trim().min(1).max(CURRICULUM_LESSON_OPTION_LABEL_MAX),
  })
  .strict();

export const CurriculumLessonMultipleChoiceConfigSchema = z
  .object({
    options: z
      .array(CurriculumLessonMultipleChoiceOptionSchema)
      .min(CURRICULUM_LESSON_OPTIONS_MIN)
      .max(CURRICULUM_LESSON_OPTIONS_MAX),
  })
  .strict();

export const CurriculumLessonExerciseExplanationSchema = z
  .record(
    z.string().trim().min(1).max(CURRICULUM_LESSON_EXPLANATION_KEY_MAX),
    z.string().trim().min(1).max(CURRICULUM_LESSON_EXPLANATION_TEXT_MAX),
  )
  .superRefine((value, ctx) => {
    if (Object.keys(value).length > CURRICULUM_LESSON_EXPLANATION_KEYS_MAX) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'too many explanation entries',
      });
    }
  });

export const CurriculumLessonExerciseSchema = z
  .object({
    id: z.string().uuid(),
    type: z.literal('multiple_choice'),
    instruction: z.string(),
    prompt: z.string(),
    config: CurriculumLessonMultipleChoiceConfigSchema,
  })
  .strict();

export const CurriculumLessonTextBlockSchema = z
  .object({
    id: z.string().uuid(),
    type: z.literal('text'),
    position: z.number().int().min(0),
    data: CurriculumLessonTextBlockDataSchema,
  })
  .strict();

export const CurriculumLessonExampleBlockSchema = z
  .object({
    id: z.string().uuid(),
    type: z.literal('example'),
    position: z.number().int().min(0),
    data: CurriculumLessonExampleBlockDataSchema,
  })
  .strict();

export const CurriculumLessonVocabularyBlockSchema = z
  .object({
    id: z.string().uuid(),
    type: z.literal('vocabulary'),
    position: z.number().int().min(0),
    items: z.array(CurriculumLessonVocabularyItemSchema),
  })
  .strict();

export const CurriculumLessonMediaBlockSchema = z
  .object({
    id: z.string().uuid(),
    type: z.literal('media'),
    position: z.number().int().min(0),
    media: CurriculumLessonMediaAssetSchema,
  })
  .strict();

export const CurriculumLessonExerciseBlockSchema = z
  .object({
    id: z.string().uuid(),
    type: z.literal('exercise'),
    position: z.number().int().min(0),
    exercise: CurriculumLessonExerciseSchema,
  })
  .strict();

export const CurriculumLessonBlockSchema = z.discriminatedUnion('type', [
  CurriculumLessonTextBlockSchema,
  CurriculumLessonExampleBlockSchema,
  CurriculumLessonVocabularyBlockSchema,
  CurriculumLessonMediaBlockSchema,
  CurriculumLessonExerciseBlockSchema,
]);

/**
 * Local fallback for one unknown or malformed block. The player renders a
 * placeholder for these and continues with the remaining blocks, so a
 * single bad block can never crash the lesson. Constructed by
 * `parseCurriculumLessonBlock`, never sent by the Server.
 */
export const CurriculumLessonUnsupportedBlockSchema = z.object({
  type: z.literal('unsupported'),
  blockId: z.string().nullable(),
  position: z.number().int().nullable(),
  raw: z.unknown(),
});

export const CurriculumLessonAggregateSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().max(CURRICULUM_LESSON_TITLE_MAX),
    description: z.string().max(CURRICULUM_LESSON_DESCRIPTION_MAX),
    estimatedMinutes: z.number().int().nullable(),
    blocks: z.array(CurriculumLessonBlockSchema),
  })
  .strict();

export const CurriculumLessonAggregateSuccessResponseSchema = z.object({
  request_id: z.string(),
  status: z.literal('success'),
  lesson: CurriculumLessonAggregateSchema,
});

export const CurriculumLessonCheckRequestBodySchema = z
  .object({
    answer: z
      .object({
        optionId: z.string().trim().min(1).max(CURRICULUM_LESSON_OPTION_ID_MAX),
      })
      .strict(),
  })
  .strict();

export const CurriculumLessonCheckSuccessResponseSchema = z.object({
  request_id: z.string(),
  status: z.literal('success'),
  correct: z.boolean(),
  explanation: CurriculumLessonExerciseExplanationSchema,
});

export const CurriculumLessonErrorCodeSchema = z.enum([
  'LESSON_NOT_FOUND',
  'LESSON_CONTENT_INVALID',
  'EXERCISE_NOT_FOUND',
  'INVALID_EXERCISE_ANSWER',
]);

/** Loose error envelope: unknown codes must still map, never throw. */
export const CurriculumLessonErrorResponseSchema = z.object({
  request_id: z.string().optional(),
  status: z.literal('failed'),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
  retryable: z.boolean().optional(),
});

export type CurriculumLessonTextBlockData = z.infer<
  typeof CurriculumLessonTextBlockDataSchema
>;
export type CurriculumLessonExampleBlockData = z.infer<
  typeof CurriculumLessonExampleBlockDataSchema
>;
export type CurriculumLessonVocabularyItem = z.infer<
  typeof CurriculumLessonVocabularyItemSchema
>;
export type CurriculumLessonMediaAsset = z.infer<
  typeof CurriculumLessonMediaAssetSchema
>;
export type CurriculumLessonMultipleChoiceOption = z.infer<
  typeof CurriculumLessonMultipleChoiceOptionSchema
>;
export type CurriculumLessonMultipleChoiceConfig = z.infer<
  typeof CurriculumLessonMultipleChoiceConfigSchema
>;
export type CurriculumLessonExerciseExplanation = z.infer<
  typeof CurriculumLessonExerciseExplanationSchema
>;
export type CurriculumLessonExercise = z.infer<
  typeof CurriculumLessonExerciseSchema
>;
export type CurriculumLessonBlock = z.infer<typeof CurriculumLessonBlockSchema>;
export type CurriculumLessonUnsupportedBlock = z.infer<
  typeof CurriculumLessonUnsupportedBlockSchema
>;
export type CurriculumLessonParsedBlock =
  | CurriculumLessonBlock
  | CurriculumLessonUnsupportedBlock;
export type CurriculumLesson = Omit<
  z.infer<typeof CurriculumLessonAggregateSchema>,
  'blocks'
> & {blocks: CurriculumLessonParsedBlock[]};
export type CurriculumLessonCheckAnswer = z.infer<
  typeof CurriculumLessonCheckRequestBodySchema
>['answer'];
export type CurriculumLessonErrorCode = z.infer<
  typeof CurriculumLessonErrorCodeSchema
>;

const CurriculumLessonLooseAggregateEnvelopeSchema = z.object({
  request_id: z.string(),
  status: z.literal('success'),
  lesson: z.object({
    id: z.string().uuid(),
    title: z.string().max(CURRICULUM_LESSON_TITLE_MAX),
    description: z.string().max(CURRICULUM_LESSON_DESCRIPTION_MAX),
    estimatedMinutes: z.number().int().nullable(),
    blocks: z.array(z.unknown()),
  }),
});

function toBlockId(raw: unknown): string | null {
  return typeof raw === 'object' &&
    raw !== null &&
    typeof (raw as {id?: unknown}).id === 'string'
    ? (raw as {id: string}).id
    : null;
}

function toBlockPosition(raw: unknown): number | null {
  if (
    typeof raw === 'object' &&
    raw !== null &&
    typeof (raw as {position?: unknown}).position === 'number' &&
    Number.isInteger((raw as {position: number}).position)
  ) {
    return (raw as {position: number}).position;
  }
  return null;
}

/**
 * Parse one raw block. Unknown `type` values and malformed known blocks
 * degrade to an `unsupported` placeholder instead of failing the lesson.
 */
export function parseCurriculumLessonBlock(
  raw: unknown,
): CurriculumLessonParsedBlock {
  const parsed = CurriculumLessonBlockSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  return {
    type: 'unsupported',
    blockId: toBlockId(raw),
    position: toBlockPosition(raw),
    raw,
  };
}

export type CurriculumLessonAggregateParseResult =
  | {ok: true; requestId: string; lesson: CurriculumLesson}
  | {ok: false; message: string};

/**
 * Parse an aggregate success envelope. A malformed envelope is a content
 * error (caller maps it to `content-error`); individual bad blocks become
 * `unsupported` placeholders via {@link parseCurriculumLessonBlock}.
 */
export function parseCurriculumLessonAggregateResponse(
  body: unknown,
): CurriculumLessonAggregateParseResult {
  const envelope = CurriculumLessonLooseAggregateEnvelopeSchema.safeParse(body);
  if (!envelope.success) {
    return {ok: false, message: 'Server returned an invalid lesson.'};
  }
  const {request_id, lesson} = envelope.data;
  return {
    ok: true,
    requestId: request_id,
    lesson: {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      estimatedMinutes: lesson.estimatedMinutes,
      blocks: lesson.blocks.map(parseCurriculumLessonBlock),
    },
  };
}

export type CurriculumLessonCheckParseResult =
  | {
      ok: true;
      requestId: string;
      correct: boolean;
      explanation: CurriculumLessonExerciseExplanation;
    }
  | {ok: false; message: string};

/** Parse an exercise-check success envelope; malformed is a failure. */
export function parseCurriculumLessonCheckResponse(
  body: unknown,
): CurriculumLessonCheckParseResult {
  const parsed = CurriculumLessonCheckSuccessResponseSchema.safeParse(body);
  if (!parsed.success) {
    return {ok: false, message: 'Server returned an invalid check result.'};
  }
  return {
    ok: true,
    requestId: parsed.data.request_id,
    correct: parsed.data.correct,
    explanation: parsed.data.explanation,
  };
}
