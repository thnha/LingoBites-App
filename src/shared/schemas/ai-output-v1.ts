import { z } from 'zod';

export const SCHEMA_VERSION = 'ai-output-v1' as const;

export const SentenceBreakdownChunkSchema = z.object({
  text: z.string(),
  meaning: z.string(),
  role: z.string().optional(),
  simple_role_vi: z.string().optional(),
});

export const SentencePatternSchema = z.object({
  pattern: z.string(),
  meaning_vi: z.string(),
  example: z.string(),
  example_translation: z.string(),
});

export const SentenceSchema = z.object({
  id: z.string(),
  original: z.string(),
  translation: z.string(),
  simple_meaning: z.string().optional(),
  breakdown: z.array(SentenceBreakdownChunkSchema).default([]),
  patterns: z.array(SentencePatternSchema).default([]),
  related_grammar_ids: z.array(z.string()).default([]),
  related_vocabulary_ids: z.array(z.string()).default([]),
});

export const GrammarExampleSchema = z.object({
  en: z.string(),
  vi: z.string(),
});

export const GrammarPointSchema = z.object({
  id: z.string(),
  name: z.string(),
  vietnamese_name: z.string().optional(),
  pattern: z.string().optional(),
  found_in: z.string().optional(),
  explanation_vi: z.string(),
  beginner_tip: z.string().optional(),
  examples: z.array(GrammarExampleSchema).default([]),
});

export const VocabularyItemSchema = z.object({
  id: z.string(),
  word: z.string(),
  phrase_from_text: z.string().optional(),
  word_type: z.string().optional(),
  meaning_vi: z.string(),
  pronunciation_guide_vi: z.string().optional(),
  ipa: z.string().optional(),
  cefr_level: z.string().optional(),
  why_important: z.string().optional(),
  source_sentence: z.string().optional(),
  example: z.string().optional(),
  example_translation: z.string().optional(),
});

export const PronunciationFocusWordSchema = z.object({
  word: z.string(),
  pronunciation_guide_vi: z.string().optional(),
  tip_vi: z.string().optional(),
});

export const PronunciationSchema = z.object({
  sentence_audio_texts: z.array(z.string()).default([]),
  focus_words: z.array(PronunciationFocusWordSchema).default([]),
});

export const PracticeQuestionSchema = z
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

export const AIOutputSchema = z.object({
  title: z.string().min(1),
  detected_language: z.string(),
  level: z.string(),
  original_text: z.string(),
  vietnamese_translation: z.string(),
  sentences: z.array(SentenceSchema),
  grammar_points: z.array(GrammarPointSchema),
  vocabulary: z.array(VocabularyItemSchema),
  warnings: z.array(z.string()),
  summary: z.string().default(''),
  pronunciation: PronunciationSchema.default({
    sentence_audio_texts: [],
    focus_words: [],
  }),
  practice: z.array(PracticeQuestionSchema).default([]),
});

export type AIOutput = z.infer<typeof AIOutputSchema>;
export type Sentence = z.infer<typeof SentenceSchema>;
export type GrammarPoint = z.infer<typeof GrammarPointSchema>;
export type VocabularyItem = z.infer<typeof VocabularyItemSchema>;
export type PracticeQuestion = z.infer<typeof PracticeQuestionSchema>;

export type ValidationResult =
  | {valid: true; data: AIOutput}
  | {valid: false; error: string};

export function validateAIOutput(raw: unknown): ValidationResult {
  const parsed = AIOutputSchema.safeParse(raw);
  if (parsed.success) {
    return {valid: true, data: parsed.data};
  }

  const first = parsed.error.issues[0];
  return {
    valid: false,
    error: first
      ? `${first.path.join('.') || '(root)'}: ${first.message}`
      : 'Invalid AI output',
  };
}
