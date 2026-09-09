import {z} from 'zod';

export const SCHEMA_VERSION_V2 = 'lesson-v2' as const;

export const LESSON_V2_TIME_CONSTANTS = {
  SEGMENTATION_BUDGET_MS: 200,
  AI_CALL_TIMEOUT_SEC: 45,
  UNIT_TIMEOUT_SEC: 120,
  JOB_TIMEOUT_SEC: 300,
  LEASE_TTL_SEC: 30,
  LEASE_RENEW_SEC: 10,
  UNIT_MAX_ATTEMPTS: 3,
  MOBILE_POST_TIMEOUT_SEC: 10,
  MOBILE_SKELETON_EXPECTED_SEC: 2,
  MOBILE_POLL_INTERVAL_BASE_MS: 800,
  MOBILE_POLL_INTERVAL_STAGE2_MS: 2000,
  MOBILE_POLL_INTERVAL_STAGE3_MS: 4000,
  MOBILE_ENRICH_DEADLINE_SEC: 180,
} as const;

export const LESSON_V2_ERROR_CODES = {
  VALIDATION_EMPTY_TEXT: 'VALIDATION_EMPTY_TEXT',
  VALIDATION_TEXT_TOO_LONG_WORDS: 'VALIDATION_TEXT_TOO_LONG_WORDS',
  VALIDATION_LANGUAGE_NOT_ENGLISH: 'VALIDATION_LANGUAGE_NOT_ENGLISH',
  VALIDATION_CONTENT_REJECTED: 'VALIDATION_CONTENT_REJECTED',
  VALIDATION_MISSING_IDEMPOTENCY_KEY: 'VALIDATION_MISSING_IDEMPOTENCY_KEY',
  IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
  LESSON_NOT_FOUND: 'LESSON_NOT_FOUND',
  RETRY_NOT_ALLOWED: 'RETRY_NOT_ALLOWED',
  AI_UNIT_INVALID_OUTPUT: 'AI_UNIT_INVALID_OUTPUT',
} as const;

export const LESSON_V2_WARNING_CODES = {
  CHUNK_FAILED: 'CHUNK_FAILED',
  VOCAB_NOT_IN_SOURCE: 'VOCAB_NOT_IN_SOURCE',
  GRAMMAR_NOT_IN_SOURCE: 'GRAMMAR_NOT_IN_SOURCE',
} as const;

export const TTSRefSchema = z.object({
  text: z.string(),
  locale: z.literal('en-US'),
  rate: z.number().default(1.0),
});

export const WarningSchema = z.object({
  code: z.string(),
  unit: z.string().nullable(),
  message_vi: z.string(),
});

export const SentencePhraseSchema = z.object({
  text: z.string(),
  meaning_vi: z.string(),
  role_vi: z.string(),
});

export const SentenceV2Schema = z.object({
  id: z.string(),
  index: z.number(),
  text: z.string(),
  char_start: z.number(),
  char_end: z.number(),
  chunk_id: z.string(),
  status: z.enum(['pending', 'processing', 'ready', 'failed']),
  translation: z.string().nullable(),
  simple_meaning: z.string().nullable(),
  phrases: z.array(SentencePhraseSchema),
  tts: TTSRefSchema,
  related_vocabulary_ids: z.array(z.string()),
  related_grammar_ids: z.array(z.string()),
});

export const ChunkV2Schema = z.object({
  id: z.string(),
  index: z.number(),
  sentence_ids: z.array(z.string()),
  status: z.enum(['pending', 'processing', 'ready', 'failed']),
  attempts: z.number(),
  error_code: z.string().nullable(),
  retryable: z.boolean(),
});

export const UnitStateSchema = z.object({
  status: z.enum(['pending', 'processing', 'ready', 'failed', 'skipped']),
  attempts: z.number(),
  error_code: z.string().nullable(),
  retryable: z.boolean(),
});

export const VocabularyV2Schema = z.object({
  id: z.string(),
  word: z.string(),
  phrase_from_text: z.string().nullable(),
  word_type: z.string().nullable(),
  meaning_vi: z.string(),
  ipa: z.string().nullable(),
  ipa_source: z.enum(['dictionary', 'dictionary_composed', 'llm', 'none']),
  source_sentence_id: z.string(),
  example: z.string(),
  example_translation: z.string(),
  tts: TTSRefSchema,
});

export const GrammarExampleV2Schema = z.object({
  en: z.string(),
  vi: z.string(),
});

export const GrammarV2Schema = z.object({
  id: z.string(),
  name: z.string(),
  name_vi: z.string(),
  pattern: z.string(),
  found_in_sentence_id: z.string(),
  found_in_text: z.string(),
  explanation_vi: z.string(),
  beginner_tip: z.string(),
  examples: z.array(GrammarExampleV2Schema),
});

export const PracticeV2Schema = z
  .object({
    id: z.string(),
    type: z.enum(['multiple_choice', 'translation', 'fill_blank']),
    question: z.string(),
    options: z.array(z.string()).optional(),
    answer: z.string(),
    explanation_vi: z.string().optional(),
    skill: z.enum(['vocabulary', 'grammar', 'translation']).optional(),
  })
  .refine(
    q =>
      q.type !== 'multiple_choice' ||
      (Array.isArray(q.options) && q.options.length >= 2),
    {message: 'multiple_choice phải có ít nhất 2 options', path: ['options']},
  );

export const JobErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const LessonSourceSchema = z.object({
  text: z.string(),
  word_count: z.number(),
  char_count: z.number(),
  detected_language: z.string(),
});

export const LessonV2Schema = z.object({
  schema_version: z.literal(SCHEMA_VERSION_V2),
  lesson_id: z.string(),
  request_id: z.string(),
  revision: z.number(),
  status: z.enum([
    'skeleton_ready',
    'partially_ready',
    'ready',
    'ready_with_warnings',
    'failed',
  ]),
  level: z.string(),
  prompt_version: z.string(),
  title: z.string().nullable(),
  source: LessonSourceSchema,
  sentences: z.array(SentenceV2Schema),
  chunks: z.array(ChunkV2Schema),
  units: z.object({
    vocabulary: UnitStateSchema,
    grammar: UnitStateSchema,
    practice: UnitStateSchema,
    ipa_resolve: UnitStateSchema,
  }),
  vocabulary: z.array(VocabularyV2Schema),
  grammar: z.array(GrammarV2Schema),
  practice: z.array(PracticeV2Schema),
  warnings: z.array(WarningSchema),
  error: JobErrorSchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  expires_at: z.string(),
});

export const LessonV2CreateEnvelopeSchema = z.object({
  lesson: LessonV2Schema,
  access_token: z.string(),
  token_type: z.literal('Bearer'),
});

export type TTSRef = z.infer<typeof TTSRefSchema>;
export type Warning = z.infer<typeof WarningSchema>;
export type SentencePhrase = z.infer<typeof SentencePhraseSchema>;
export type SentenceV2 = z.infer<typeof SentenceV2Schema>;
export type ChunkV2 = z.infer<typeof ChunkV2Schema>;
export type UnitState = z.infer<typeof UnitStateSchema>;
export type VocabularyV2 = z.infer<typeof VocabularyV2Schema>;
export type GrammarExampleV2 = z.infer<typeof GrammarExampleV2Schema>;
export type GrammarV2 = z.infer<typeof GrammarV2Schema>;
export type PracticeV2 = z.infer<typeof PracticeV2Schema>;
export type JobError = z.infer<typeof JobErrorSchema>;
export type LessonSource = z.infer<typeof LessonSourceSchema>;
export type LessonV2 = z.infer<typeof LessonV2Schema>;
export type LessonV2CreateEnvelope = z.infer<
  typeof LessonV2CreateEnvelopeSchema
>;
