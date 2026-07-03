# Phase 0 Feature Scope

## 1. Phase Goal

Phase 0 focuses on building an MVP for:

```text
Input image/text → OCR/edit → AI learning analysis → save lesson
```

The goal is not to build a complete English learning app, but to prove learning from real-world text.

---

## 2. Feature: Image Input

### Goal

Let users bring English content into the app via images.

### Scope

Users can:

- Capture image with camera.
- Upload image from gallery.
- Preview selected image.
- Remove image and choose another.

### Business Rules

- Only common image formats: JPG, PNG, HEIC if mobile supports it.
- If image is too large, app may compress before OCR.
- If camera/photo permission is missing, app must show permission guidance.

### Completion Criteria

- User can capture image successfully.
- User can upload image from gallery.
- App displays image preview.
- App handles permission denied.

---

## 3. Feature: Paste Text

### Goal

Let users enter text directly when they do not want to scan an image.

### Scope

- English text input area.
- Clear text button.
- Analyze button.
- Validation when text is empty.

### Business Rules

- Minimum input: 1 sentence or 5 characters.
- Phase 0 maximum input: recommended 2,000–3,000 characters.
- If limit exceeded, app shows warning.

### Completion Criteria

- User can paste text and analyze.
- Empty text cannot be submitted.
- Overly long text shows clear warning.

---

## 4. Feature: OCR Extraction

### Goal

Recognize English text from images.

### Scope

- OCR image to text.
- Loading state while OCR runs.
- Display extracted text.
- Notify when no text is found.

### Business Rules

- OCR result is only a draft; user must be able to edit.
- If OCR confidence is low, app should show warning.
- If OCR returns multiple lines, app preserves line breaks reasonably.

### Completion Criteria

- Clear image → OCR produces readable text.
- Image with no text → show empty state.
- User does not lose image/input when OCR fails.

---

## 5. Feature: OCR Review and Edit

### Goal

Let users verify and correct text before AI analysis.

### Scope

- Display OCR text.
- Allow direct editing.
- "Analyze" button.
- "Back to image" button.
- Warning if text does not appear to be English.

### Business Rules

- AI analyzes only after user confirms.
- User can edit any part of the text.
- Post-edit text is the source of truth for the lesson.

### Completion Criteria

- User can edit text.
- Edited text is sent to AI.
- App does not auto-analyze before user confirms.

---

## 6. Feature: AI Translation

### Goal

Translate English text into clear, natural Vietnamese.

### Scope

- Translate full passage.
- Translate each sentence.
- May include meaning-focused translation for beginners.

### Business Rules

- Translation should prioritize clarity over literalness.
- For beginners, include phrase-level breakdown when helpful.
- Do not add information not present in the original passage.

### Completion Criteria

- Each lesson has full Vietnamese translation.
- Each sentence has Vietnamese translation.
- Translation renders correctly in result UI.

---

## 7. Feature: Sentence Analysis

### Goal

Help users understand how each sentence is structured.

### Scope

For each sentence, app displays:

- Original sentence.
- Vietnamese translation.
- Sentence breakdown.
- Simple role of each part.
- Extracted sentence pattern.
- Similar examples.

### Business Rules

- Do not break down too finely word-by-word if it confuses users.
- Prioritize meaning-based chunks.
- Roles should be simple: Subject, Verb, Object, Time, Place, Preposition phrase.
- Each sentence should have at most 3 similar examples.

### Completion Criteria

- Multi-sentence text is split reasonably.
- Each sentence has an easy-to-understand breakdown.
- UI can expand/collapse each sentence.

---

## 8. Feature: Grammar Detection

### Goal

Identify important grammar points in the passage.

### Scope

- Detect main tense/structure.
- Explain in Vietnamese.
- Provide simple formula.
- Provide short examples.

### Business Rules

- Select only 1–3 main grammar points in Phase 0.
- Do not list every minor grammar point.
- For beginners, explain based on practical usage.

### Example

```text
Grammar: Present Continuous
Vietnamese: Thì hiện tại tiếp diễn
Pattern: S + am/is/are + V-ing
Use: Dùng để nói ai đó đang làm gì hoặc một tình huống đang diễn ra hiện tại.
```

### Completion Criteria

- Lesson has grammar points when text has teachable structure.
- Grammar explanation is easy to understand in Vietnamese.
- Illustrative examples are included.

---

## 9. Feature: Vocabulary Extraction

### Goal

Select important words/phrases for the user to learn.

### Scope

Each vocabulary item includes:

- Word/phrase.
- Word type.
- Vietnamese meaning.
- Simple pronunciation guide.
- CEFR level if available.
- Example sentence.
- Example translation.
- Source sentence.

### Business Rules

- Do not list overly common words like "the", "a", "is", "you" unless needed to teach structure.
- Prioritize words/phrases important for understanding the passage.
- Phase 0 should limit to about 5–12 vocabulary items per lesson.
- Shorter text may have fewer items.

### Completion Criteria

- Vocabulary list has Vietnamese meanings.
- Not too many words to overwhelm user.
- Includes easy-to-understand examples.

---

## 10. Feature: Pronunciation Support

### Goal

Help users know how to read words/sentences.

### Phase 0 Scope

- Play audio for each sentence or word if TTS is available.
- Show approximate pronunciation guide for Vietnamese speakers.
- May show IPA if appropriate, but not required for beginners.

### Business Rules

- Standard audio is more important than approximate phonetic spelling.
- Approximate phonetic spelling is only initial support.
- Pronunciation guide should not be treated as absolute standard.

### Completion Criteria

- User can listen to sentence or word.
- If audio is unavailable, pronunciation guide must exist in output.

---

## 11. Feature: Save Lesson

### Goal

Let users save generated lessons.

### Scope

- Save lesson button.
- Saved/unsaved state.
- Lesson saved to Lessons list.
- Reopen saved lesson.

### Business Rules

- Saved lesson uses post-edit text, not raw OCR text.
- Lesson must store rendered AI output so AI is not called again on reopen.
- Original image may or may not be saved depending on privacy/cost.

### Completion Criteria

- User saves lesson successfully.
- User reopens saved lesson.
- Saved state displays correctly.

---

## 12. Feature: Short Practice

### Goal

Let users practice immediately after learning.

### Phase 0 Scope

- 0–3 short questions if AI output includes practice.
- Multiple choice or translation question.
- Show answer when questions exist.

### Business Rules

- Practice must come from the same lesson.
- Do not create overly difficult questions.
- Prioritize main vocabulary and grammar.

### Completion Criteria

- If lesson has practice, user selects answer and sees correct/incorrect.
- If practice is empty, UI shows friendly empty state or hides section per screen rules.

---

## 13. Phase 0 Feature Priorities

| Priority | Features |
|---|---|
| P0 Must | Image input, paste text, OCR, edit OCR, AI translation, sentence analysis, grammar, vocabulary |
| P1 Should | Pronunciation, save lesson, lesson history |
| P2 Nice | Mini practice, CEFR tag, IPA, favorite vocabulary |
