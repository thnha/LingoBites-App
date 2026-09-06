# PRD — Product Requirements Document

## 1. Overview

**LingoBites** is an English learning app for Vietnamese beginners. Users can capture or upload images containing English text; the app recognizes the text and generates an easy-to-understand lesson in Vietnamese.

---

## 2. Phase 0 Goals

Build an MVP to prove the core loop:

```text
Scan real-world English → Understand Vietnamese translation → Learn sentence/grammar/vocabulary → Save lesson
```

---

## 3. Target User Problems

Users encounter English in daily life but do not know:

- What the sentence means.
- Which tense the sentence uses.
- Which words are important.
- How to pronounce those words.
- How to reuse a similar sentence pattern.

---

## 4. Product Principles

1. **Beginner first**: explain as if teaching someone with no foundation.
2. **Vietnamese explanation**: prioritize clear Vietnamese.
3. **Learning over translation**: translation is only the first step; learning is the focus.
4. **Structured output**: AI result must render into a clear UI.
5. **Recoverable errors**: when OCR/AI fails, user can fix or retry.

---

## 5. MVP Feature List

| Feature ID | Feature | Priority | Description |
|---|---|---|---|
| F-01 | Image Input | Must | Capture/upload image containing English text |
| F-02 | Paste text | Must | Manual text entry when not using an image |
| F-03 | OCR Extraction | Must | Extract text from image |
| F-04 | OCR Review/Edit | Must | User reviews and edits text before analysis |
| F-05 | AI Translation | Must | Translate full text into Vietnamese |
| F-06 | Sentence Analysis | Must | Split sentences, translate each sentence, breakdown |
| F-07 | Grammar Detection | Must | Detect main tense/structure |
| F-08 | Vocabulary Extraction | Must | Extract important, difficult, uncommon words/phrases |
| F-09 | Pronunciation Support | Should | Audio or pronunciation guide for words/sentences |
| F-10 | Save lesson | Should | Save lesson |
| F-11 | Lesson History | Should | Review saved lessons |
| F-12 | Mini Practice | Nice | Practice questions after lesson |

---

## 6. Main User Flow

```text
Open app
→ Tap Scan / Upload / Paste text
→ App extracts text
→ User reviews extracted text
→ User taps Analyze
→ App shows loading state
→ AI returns learning output
→ User views translation, sentence, vocabulary, grammar, pronunciation
→ User saves lesson
```

---

## 7. Output Structure

Each lesson must include:

1. Auto-generated title.
2. Original text.
3. Vietnamese full translation.
4. Sentence-by-sentence analysis.
5. Grammar points.
6. Vocabulary list.
7. Pronunciation support.
8. Practice questions if available.
9. Save status.

---

## 8. User Experience Requirements

### Beginner Mode

Phase 0 defaults to Beginner Mode.

Requirements:

- Short explanation sentences.
- Do not overuse terminology.
- If using terms like "Present Continuous", include Vietnamese and an easy explanation.
- Examples must be simple.
- Do not list too much vocabulary and overwhelm the user.

### Result Page

The result page must have clear sections:

```text
1. Bản dịch
2. Học từng câu
3. Từ vựng quan trọng
4. Ngữ pháp trong đoạn
5. Luyện phát âm
6. Quick practice nếu có câu hỏi
```

---

## 9. Error Handling Requirements

| Scenario | Expected Behavior |
|---|---|
| OCR finds no text | Show message and let user try another image or paste text |
| OCR text is wrong | User can edit text before analyze |
| AI timeout | Allow retry without losing input text |
| AI returns invalid JSON | Backend retry or fallback parser |
| Network fail | Show clear error, allow retry |
| Text too long | App warns and suggests shortening |
| Blurry image | App suggests capturing a clearer image |

---

## 10. MVP Limitations

- English input only.
- Vietnamese output only.
- No guarantee of 100% perfect grammar analysis.
- No multi-page PDF support in Phase 0.
- No pronunciation scoring in Phase 0.
- No very long/complex content such as research papers.

---

## 11. Launch Criteria

Internal beta can launch when:

- Core flow works reliably on iOS/Android.
- At least 20 sample images pass testing.
- AI output renders correct schema >= 95% after validation/retry.
- User can save and reopen lessons.
- Crash-free basic test meets requirements.
- Event tracking exists for scan funnel.
