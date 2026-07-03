# Product Overview — LingoBites

## Purpose

**LingoBites** is a mobile app concept for Vietnamese speakers who are new to English, helping them learn from real-world English content.

The product is not a typical translation app. Its core value is turning everyday English text into an easy-to-understand lesson in Vietnamese.

## Product Positioning

> Capture or enter a passage of English, understand the meaning in Vietnamese, and learn vocabulary, grammar, pronunciation, and practice from that same passage.

The app overlaps with translation tools at the input layer, but differs in the learning outcome:

1. Translate the text into natural Vietnamese.
2. Explain each sentence in simple Vietnamese.
3. Extract useful vocabulary.
4. Highlight the most important grammar points.
5. Support pronunciation.
6. Generate short practice questions.
7. Save the result as a personal lesson for review.

## Target Users

Primary users:

- Vietnamese speakers who are just starting to learn English.
- People who frequently encounter English but do not understand it.
- Students who need simple sentence explanations.
- Working professionals who need to understand practical English in emails, documents, signs, notices, menus, or product labels.

Secondary users:

- Parents helping their children learn English.
- Tutors who want to quickly create learning materials.
- Travelers who need practical English comprehension.

## Phase 0 Scope

Phase 0 proves one core loop:

```text
Capture / Upload / Paste text
→ OCR or manual text entry
→ User confirms text
→ AI generates a structured lesson
→ User learns, practices, and saves the lesson
```

Required Phase 0 capabilities:

- Camera input.
- Image upload.
- Manual text paste.
- OCR text recognition.
- Review and edit OCR text.
- AI Vietnamese translation.
- Sentence-by-sentence explanation.
- Vocabulary extraction.
- Grammar explanation.
- Pronunciation support.
- Mini practice.
- Save lesson.
- Lesson history.

Out of Phase 0 scope:

- Real-time camera translation.
- Full PDF processing.
- Browser extension.
- Full grammar course.
- Advanced speaking scoring.
- Community features.
- Payment/subscription.
- Teacher dashboard.

## Lesson Output

Each generated lesson should display in this order:

1. Title.
2. Original English text.
3. Vietnamese translation.
4. Sentence analysis.
5. Vocabulary.
6. Grammar.
7. Pronunciation.
8. Practice.
9. Save lesson.

Output should prioritize beginners:

- Use Vietnamese explanations.
- Avoid advanced grammar terminology when unnecessary.
- Limit to 1–3 important grammar points.
- Do not list every word as vocabulary to learn.
- Provide examples the user can reuse.

## AI Output Contract

AI must return structured JSON, not free-form text. Required top-level fields:

- `title`
- `detected_language`
- `level`
- `original_text`
- `vietnamese_translation`
- `summary`
- `sentences`
- `grammar_points`
- `vocabulary`
- `pronunciation`
- `practice`
- `warnings`

The app must validate AI output before rendering or saving.

## Technical Direction

Proposed MVP direction:

- Mobile: React Native / Expo.
- OCR: Google ML Kit, Apple Vision, Google Cloud Vision, or another OCR provider.
- AI: LLM API with structured output.
- TTS: Native TTS or cloud TTS.
- Storage: local-first for MVP; backend later if login/cloud sync is needed.
- Analytics: product event tracking only; do not log full scanned text.

## Success Criteria

Phase 0 succeeds if a beginner can scan or paste a short English passage and understand:

- What the text means in Vietnamese.
- Which words are important.
- Which grammar patterns appear.
- How to pronounce important words or sentences.
- How to reuse at least one sentence pattern.

## Source of Truth

This file is intentionally brief. Detailed requirements live in `docs/01-ba/`.

Use:

- `docs/01-ba/README.md` to understand the full BA documentation set.
- `docs/01-ba/04-product/04-phase0-prd.md` for product requirements.
- `docs/01-ba/02-technical/03-ai-output-requirements.md` for AI schema and prompt requirements.
- `docs/01-ba/02-technical/06-ai-agent-implementation-guide.md` for implementation handoff.
