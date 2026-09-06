# Business Rules

## 1. Input rules

| Rule ID | Rule |
|---|---|
| BR-IN-001 | User can start analysis from an uploaded image, a camera photo, or pasted text. |
| BR-IN-002 | Text input must not be empty. |
| BR-IN-003 | Phase 0 should limit input length to around 2,000–3,000 characters. |
| BR-IN-004 | If input is too long, app should ask user to shorten text or process only the first part. |
| BR-IN-005 | App should support English input only in Phase 0. |
| BR-IN-006 | If text appears not to be English, app should show warning but may still allow analysis. |

---

## 2. OCR rules

| Rule ID | Rule |
|---|---|
| BR-OCR-001 | OCR result must be treated as an editable draft. |
| BR-OCR-002 | User must confirm OCR text before AI analysis. |
| BR-OCR-003 | If no text is detected, app must let user retry or enter text manually. |
| BR-OCR-004 | If image is blurry or low contrast, app should show a helpful message. |
| BR-OCR-005 | App should preserve paragraphs and line breaks when possible. |

---

## 3. AI analysis rules

| Rule ID | Rule |
|---|---|
| BR-AI-001 | AI output must be returned as structured JSON. |
| BR-AI-002 | Backend/app must validate required fields before rendering result. |
| BR-AI-003 | If AI output is invalid, backend should retry at most once; if still invalid, return `AI_INVALID_OUTPUT` and do not render/save a fallback lesson. |
| BR-AI-004 | AI explanation must target Vietnamese beginners. |
| BR-AI-005 | AI should not add facts that are not present in the original text. |
| BR-AI-006 | AI should not generate too many grammar points for one short text. |
| BR-AI-007 | AI should avoid advanced linguistic terms unless it also explains them simply. |

---

## 4. Translation rules

| Rule ID | Rule |
|---|---|
| BR-TR-001 | Translation must be in Vietnamese. |
| BR-TR-002 | Translation should be natural and easy to understand. |
| BR-TR-003 | For beginner mode, phrase-by-phrase explanation is allowed and encouraged. |
| BR-TR-004 | Translation should keep the meaning of the original text without unnecessary additions. |

---

## 5. Sentence analysis rules

| Rule ID | Rule |
|---|---|
| BR-SA-001 | Each sentence should have original text and Vietnamese translation. |
| BR-SA-002 | Sentences should be split by meaningful phrases, not necessarily word by word. |
| BR-SA-003 | The breakdown should use simple roles such as Subject, Verb, Object, Time, Place. |
| BR-SA-004 | Each sentence should have at most 1–2 main patterns to avoid overload. |
| BR-SA-005 | Similar examples should use simple vocabulary suitable for beginners. |

---

## 6. Grammar rules

| Rule ID | Rule |
|---|---|
| BR-GR-001 | Grammar points must come from the input text. |
| BR-GR-002 | Each grammar point must include Vietnamese name or Vietnamese explanation. |
| BR-GR-003 | Each grammar point should include a simple pattern/formula if applicable. |
| BR-GR-004 | A short text should have no more than 3 grammar points in Phase 0. |
| BR-GR-005 | If no important grammar point exists, app can show "Không có cấu trúc nổi bật". |

---

## 7. Vocabulary rules

| Rule ID | Rule |
|---|---|
| BR-VOC-001 | Vocabulary list should include important or uncommon words/phrases. |
| BR-VOC-002 | Very common words should be skipped unless needed for beginner explanation. |
| BR-VOC-003 | Each vocabulary item must have Vietnamese meaning. |
| BR-VOC-004 | Each vocabulary item should have word type if identifiable. |
| BR-VOC-005 | Each vocabulary item should have example sentence. |
| BR-VOC-006 | Recommended vocabulary count: 5–12 items per lesson. |
| BR-VOC-007 | Vocabulary should be extracted from the original input text. |

---

## 8. Pronunciation rules

| Rule ID | Rule |
|---|---|
| BR-PRO-001 | Pronunciation guide should support beginners but not replace audio. |
| BR-PRO-002 | Audio should use clear voice and normal speed if supported. |
| BR-PRO-003 | If IPA is shown, it should not be the only pronunciation support for beginners. |
| BR-PRO-004 | Vietnamese-friendly pronunciation hints must be clearly marked as approximate. |

---

## 9. Lesson rules

| Rule ID | Rule |
|---|---|
| BR-LES-001 | A lesson is created after successful AI analysis. |
| BR-LES-002 | Saved lesson should store original text, translation, analysis, vocabulary, grammar, and practice if available. |
| BR-LES-003 | Saved lesson should store edited text as the source of truth. |
| BR-LES-004 | App should not require AI call again to open a saved lesson. |
| BR-LES-005 | Lesson title can be AI-generated or fallback to date/time. |

---

## 10. Practice rules

| Rule ID | Rule |
|---|---|
| BR-PRAC-001 | Practice questions must be based on the current lesson. |
| BR-PRAC-002 | Practice should not introduce unrelated vocabulary. |
| BR-PRAC-003 | For beginner mode, multiple choice is preferred. |
| BR-PRAC-004 | Questions should be short and clear. |
| BR-PRAC-005 | Correct answer and simple explanation must be provided. |

---

## 11. Privacy rules

| Rule ID | Rule |
|---|---|
| BR-PRI-001 | User must be informed that uploaded content may be processed for OCR/AI. |
| BR-PRI-002 | App should avoid storing original images unless needed. |
| BR-PRI-003 | If storing images, app should provide clear reason and deletion option. |
| BR-PRI-004 | Sensitive user content should not be used for training unless explicitly consented. |

---

## 12. Error handling rules

| Rule ID | Rule |
|---|---|
| BR-ERR-001 | User input must not be lost after OCR/AI/network errors. |
| BR-ERR-002 | Error messages should be friendly and include a clear action. |
| BR-ERR-003 | Retry must be available for OCR and AI errors. |
| BR-ERR-004 | If AI service is unavailable, app should show a clear message and allow retry later. |
