# Data Model & Entities

## 1. Overview

Phase 0 data model must support:

- User input.
- OCR result.
- AI analysis result.
- Saved lesson.
- Vocabulary items.
- Grammar points.
- Practice questions.

May store local-first in MVP or backend database if multi-device sync is needed.

> **Modular releases (MT-Practice / MT-Situation):** Future entities `ReviewItem`, `GameSession`,
> `SituationLesson` are described in `07-modular-architecture-and-release.md §11`. Do not add tables
> until P1+ FRs are scoped. Mini games and situation modules must read from saved `lessons.ai_output_json`.

> **Important — Phase 0 vs Phase 1+ (read before coding):**
> This file describes the **full logical data model**. Phase 0 **does NOT** split child
> entities into separate tables.
>
> - **Actual Phase 0 persistence** uses the schema in
>   `02-technical/01-technical-implementation-spec.md §9`: **one `lessons` table** with
>   `ai_output_json` column (stores full AI output) + `app_settings` table. Structure inside
>   `ai_output_json` follows `01-schema/01-ai-output-v1.ts` (source of truth).
> - `SentenceAnalysis`, `SentenceBreakdownChunk`, `VocabularyItem`, `GrammarPoint`,
>   `PracticeQuestion` (sections 4–8) are **logical model / Phase 1+ schema** — split into
>   tables only when search/flashcard/spaced-repetition/cloud-sync is needed (see `02-technical/01-technical-implementation-spec.md §9`).
> - Key difference: Phase 0 uses `anonymous_user_id` (login not required;
>   see `User` entity section 2 → `id` field is the anonymous id); **does not** store
>   `original_image_url` by default (see `Lesson` section 3 → this field is No/Phase 1+).
>
> When field conflicts exist between this file and `02-technical/01-technical-implementation-spec.md`
> or `01-schema/01-ai-output-v1.ts`, **prioritize those two files** for Phase 0.

---

## 2. Entity: User

### Purpose

Store basic user info and learning settings.

### Fields

| Field | Type | Required | Note |
|---|---|---|---|
| id | string | Yes | Unique user id |
| display_name | string | No | Optional |
| email | string | No | Optional if login |
| learning_level | enum | Yes | Beginner default |
| native_language | string | Yes | Vietnamese default |
| created_at | datetime | Yes |  |
| updated_at | datetime | Yes |  |

### `learning_level` values

```text
Beginner | Elementary | Intermediate
```

Phase 0 defaults to `Beginner`.

---

## 3. Entity: Lesson

### Purpose

One lesson created from one input/analyze flow.

### Fields

| Field | Type | Required | Note |
|---|---|---|---|
| id | string | Yes | Unique lesson id |
| user_id | string | Yes | Owner |
| title | string | Yes | AI-generated or fallback |
| source_type | enum | Yes | camera, gallery, paste_text |
| original_image_url | string | No | If image is stored |
| ocr_raw_text | text | No | Initial OCR text |
| confirmed_text | text | Yes | Text user confirms/edits |
| vietnamese_translation | text | Yes | Full translation |
| summary | text | No | Short summary |
| level | string | Yes | Beginner |
| ai_output_json | json | Yes | Full structured output |
| is_saved | boolean | Yes | Default false/true depending flow |
| created_at | datetime | Yes |  |
| updated_at | datetime | Yes |  |

### `source_type` values

```text
camera | gallery | paste_text
```

---

## 4. Entity: SentenceAnalysis

### Purpose

Store per-sentence analysis within a lesson.

### Fields

| Field | Type | Required | Note |
|---|---|---|---|
| id | string | Yes | Unique id |
| lesson_id | string | Yes | Parent lesson |
| order_index | number | Yes | Sentence order |
| original | text | Yes | Original sentence |
| translation | text | Yes | Vietnamese translation |
| simple_meaning | text | No | Beginner explanation |
| breakdown | json | No | Array of chunks |
| patterns | json | No | Sentence patterns |
| related_grammar_ids | array | No |  |
| related_vocabulary_ids | array | No |  |

---

## 5. Entity: SentenceBreakdownChunk

May be stored embedded in SentenceAnalysis.

| Field | Type | Required | Note |
|---|---|---|---|
| text | string | Yes | Chunk from sentence |
| meaning | string | Yes | Vietnamese meaning |
| role | string | No | Subject, Verb, Object... |
| simple_role_vi | string | No | Explanation in Vietnamese |

---

## 6. Entity: VocabularyItem

### Purpose

Important words/phrases in a lesson.

### Fields

| Field | Type | Required | Note |
|---|---|---|---|
| id | string | Yes | Unique id |
| lesson_id | string | Yes | Parent lesson |
| word | string | Yes | Base word/phrase |
| phrase_from_text | string | No | Actual phrase in source |
| word_type | string | No | noun, verb, adjective... |
| meaning_vi | string | Yes | Vietnamese meaning |
| pronunciation_guide_vi | string | No | Approx guide |
| ipa | string | No | IPA |
| cefr_level | string | No | A1, A2, B1... |
| why_important | string | No | Learning note |
| source_sentence | text | No | Sentence from input |
| example | text | No | English example |
| example_translation | text | No | Vietnamese translation |
| is_saved | boolean | No | Future flashcard feature |
| created_at | datetime | Yes |  |

---

## 7. Entity: GrammarPoint

### Purpose

Main grammar points in a lesson.

### Fields

| Field | Type | Required | Note |
|---|---|---|---|
| id | string | Yes | Unique id |
| lesson_id | string | Yes | Parent lesson |
| name | string | Yes | English name |
| vietnamese_name | string | No | Vietnamese name |
| pattern | string | No | Formula |
| found_in | string | No | Phrase from input |
| explanation_vi | text | Yes | Simple explanation |
| beginner_tip | text | No | Easy tip |
| examples | json | No | Example array |

---

## 8. Entity: PracticeQuestion

### Purpose

Practice questions after a lesson.

### Fields

| Field | Type | Required | Note |
|---|---|---|---|
| id | string | Yes | Unique id |
| lesson_id | string | Yes | Parent lesson |
| type | enum | Yes | multiple_choice, translation, fill_blank |
| question | text | Yes | Question content |
| options | array | No | For multiple choice |
| answer | text | Yes | Correct answer |
| explanation_vi | text | No | Explanation |
| skill | enum | No | vocabulary, grammar, translation |

### `type` values

```text
multiple_choice | translation | fill_blank
```

---

## 9. Entity: OCRRequest

### Purpose

Log OCR status for debug and tracking.

### Fields

| Field | Type | Required | Note |
|---|---|---|---|
| id | string | Yes | Unique request id |
| user_id | string | No | Optional |
| image_url | string | No | If stored |
| status | enum | Yes | pending, success, failed |
| extracted_text | text | No | OCR result |
| confidence | number | No | If provider supports |
| error_code | string | No |  |
| created_at | datetime | Yes |  |

---

## 10. Entity: AIAnalysisRequest

### Purpose

Log AI analysis status.

### Fields

| Field | Type | Required | Note |
|---|---|---|---|
| id | string | Yes | Unique request id |
| user_id | string | No | Optional |
| lesson_id | string | No | Created after success |
| input_text | text | Optional | Should be privacy-aware |
| status | enum | Yes | pending, success, failed, retrying |
| model | string | No | AI model/provider |
| token_usage | json | No | Cost tracking |
| error_code | string | No |  |
| created_at | datetime | Yes |  |

---

## 11. Data Storage Recommendations

### MVP local-first

Use local database if login is not needed yet:

- SQLite
- Realm
- MMKV for small settings

Advantages:

- Fast.
- Less backend.
- Better privacy.

Disadvantages:

- No multi-device sync.
- Data lost if app deleted without backup.

### Backend-first

Use backend database if account/sync is needed:

- PostgreSQL/Supabase
- Firebase Firestore

Advantages:

- Sync supported.
- Easier analytics and subscription later.

Disadvantages:

- More backend cost.
- Stricter privacy/security needed.

---

## 12. Recommended Phase 0 Approach

For fast MVP:

```text
Store lesson output locally first.
Use backend only for OCR/AI proxy if needed.
```

If app needs login from the start:

```text
Use Supabase/Firebase for user + lesson sync.
```
