// =============================================================================
// 01-ai-output-v1.ts — SINGLE SOURCE OF TRUTH for AI output schema (Phase 0)
// =============================================================================
//
// This file is the canonical schema. Do NOT describe AI output structure elsewhere.
// Documents 02-technical/03-ai-output-requirements.md, 02-technical/05-data-model.md,
// 02-technical/06-ai-agent-implementation-guide.md, and 02-technical/01-technical-implementation-spec.md
// must only REFERENCE this file; they must not redefine fields.
//
// schema_version: "ai-output-v1"
//
// Rules (aligned with spec sections 6 and 10):
// - 9 REQUIRED fields (no defaults): if missing → backend retries once →
//   if still missing, return AI_INVALID_OUTPUT.
//   title, detected_language, level, original_text, vietnamese_translation,
//   sentences, grammar_points, vocabulary, warnings
// - Recommended fields normalized with defaults: summary "", pronunciation {},
//   practice []
// - sentences/grammar_points/vocabulary/practice/warnings MUST be arrays.
// - pronunciation MUST be an object (may be empty).
// - original_text must match confirmed_text (only whitespace trim differences allowed).
//   validateAIOutput(raw) validates schema only because confirmed_text is not part of the
//   AI output object. Backend/mobile services must perform the original_text vs
//   confirmed_text check before returning, rendering, or saving.
//
// Usage: import { AIOutputSchema, type AIOutput } from "./01-ai-output-v1";
//        const result = AIOutputSchema.safeParse(raw);
// =============================================================================

import { z } from "zod";

export const SCHEMA_VERSION = "ai-output-v1" as const;

// --- Sub-schemas ------------------------------------------------------------

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

export const PracticeQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(["multiple_choice", "translation", "fill_blank"]),
  question: z.string(),
  options: z.array(z.string()).optional(), // required when type = multiple_choice (see refine)
  answer: z.string(),
  explanation_vi: z.string().optional(),
  skill: z.enum(["vocabulary", "grammar", "translation"]).optional(),
}).refine(
  (q) => q.type !== "multiple_choice" || (Array.isArray(q.options) && q.options.length >= 2),
  { message: "multiple_choice must have at least 2 options", path: ["options"] },
);

// --- Root schema ------------------------------------------------------------

export const AIOutputSchema = z.object({
  // 9 required fields:
  title: z.string().min(1),
  detected_language: z.string(), // Phase 0 expected "English"
  level: z.string(),             // Phase 0 default "Beginner"
  original_text: z.string(),
  vietnamese_translation: z.string(),
  sentences: z.array(SentenceSchema),
  grammar_points: z.array(GrammarPointSchema),
  vocabulary: z.array(VocabularyItemSchema),
  warnings: z.array(z.string()),
  // recommended fields (normalized with defaults):
  summary: z.string().default(""),
  pronunciation: PronunciationSchema.default({ sentence_audio_texts: [], focus_words: [] }),
  practice: z.array(PracticeQuestionSchema).default([]),
});

export type AIOutput = z.infer<typeof AIOutputSchema>;
export type Sentence = z.infer<typeof SentenceSchema>;
export type GrammarPoint = z.infer<typeof GrammarPointSchema>;
export type VocabularyItem = z.infer<typeof VocabularyItemSchema>;
export type PracticeQuestion = z.infer<typeof PracticeQuestionSchema>;
export type Pronunciation = z.infer<typeof PronunciationSchema>;

// --- Helper -----------------------------------------------------------------

export type ValidationResult =
  | { valid: true; data: AIOutput }
  | { valid: false; error: string };

/**
 * Validate raw AI output. Returns normalized data (defaults applied) when valid.
 * Backend calls this BEFORE returning success; mobile calls again BEFORE rendering.
 */
export function validateAIOutput(raw: unknown): ValidationResult {
  const parsed = AIOutputSchema.safeParse(raw);
  if (parsed.success) return { valid: true, data: parsed.data };
  const first = parsed.error.issues[0];
  return {
    valid: false,
    error: first ? `${first.path.join(".") || "(root)"}: ${first.message}` : "Invalid AI output",
  };
}
