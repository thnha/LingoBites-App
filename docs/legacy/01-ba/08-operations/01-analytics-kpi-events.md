# Analytics, KPI & Tracking Events

## 1. Objectives

Phase 0 tracking aims to answer these questions:

1. Do users start scanning?
2. Do users complete OCR?
3. Do users edit OCR text?
4. Do users receive AI results?
5. Do users save lessons?
6. Do users return to review lessons?
7. Which step has the highest drop-off?

---

## 2. Core funnel

```text
app_opened
→ input_method_selected
→ image_selected/text_entered
→ ocr_completed
→ text_confirmed
→ ai_analysis_started
→ ai_analysis_completed
→ result_viewed
→ lesson_saved
→ lesson_reopened
```

---

## 3. KPI metrics

| KPI | Description | Phase 0 target |
|---|---|---|
| Input start rate | % users who start scan/upload/paste | >= 60% |
| OCR success rate | % image inputs with OCR text detected | >= 75% for clear images |
| Text confirmation rate | % users who proceed from OCR review to analyze | >= 70% |
| AI completion rate | % AI requests completed successfully | >= 85% |
| Result view rate | % users who see results after input | >= 70% |
| Lesson save rate | % result sessions saved as lesson | >= 25% |
| Lesson reopen rate | % saved lessons reopened | >= 20% |
| Error rate | % OCR/AI/network errors | <= 10–15% |

---

## 4. Event naming convention

Format:

```text
object_action
```

Examples:

```text
image_selected
ocr_completed
lesson_saved
```

---

## 5. Event specifications

### Event: app_opened

| Field | Type | Note |
|---|---|---|
| user_id | string | Optional anonymous id |
| app_version | string |  |
| platform | string | iOS/Android |
| timestamp | datetime |  |

---

### Event: input_method_selected

| Field | Type | Note |
|---|---|---|
| method | enum | camera, gallery, paste_text |
| screen | string | Home/Scan |

---

### Event: image_selected

| Field | Type | Note |
|---|---|---|
| source | enum | camera, gallery |
| image_size_category | string | small, medium, large |
| has_permission | boolean |  |

---

### Event: text_entered

| Field | Type | Note |
|---|---|---|
| text_length_bucket | enum | 1-100, 101-500, 501-1000, 1001-2000, 2001-3000, 3000+ |

---

### Event: ocr_started

| Field | Type | Note |
|---|---|---|
| provider | string | OCR provider |
| source | enum | camera, gallery |

---

### Event: ocr_completed

| Field | Type | Note |
|---|---|---|
| status | enum | success, failed |
| text_length_bucket | enum | 1-100, 101-500, 501-1000, 1001-2000, 2001-3000, 3000+ |
| confidence | number | If available |
| error_code | string | If failed |

---

### Event: text_confirmed

| Field | Type | Note |
|---|---|---|
| source_type | enum | ocr, paste_text |
| text_length_bucket | enum | 1-100, 101-500, 501-1000, 1001-2000, 2001-3000, 3000+ |
| edited_after_ocr | boolean |  |

---

### Event: ai_analysis_started

| Field | Type | Note |
|---|---|---|
| text_length_bucket | enum | 1-100, 101-500, 501-1000, 1001-2000, 2001-3000, 3000+ |
| level | string | Beginner |
| prompt_version | string |  |

---

### Event: ai_analysis_completed

| Field | Type | Note |
|---|---|---|
| status | enum | success, failed |
| duration_ms | number |  |
| model | string |  |
| schema_valid | boolean |  |
| sentence_count | number |  |
| vocabulary_count | number |  |
| grammar_count | number |  |
| error_code | string | If failed |

---

### Event: result_viewed

| Field | Type | Note |
|---|---|---|
| lesson_id | string |  |
| source_type | enum | camera, gallery, paste_text |
| sentence_count | number |  |
| vocabulary_count | number |  |
| grammar_count | number |  |

---

### Event: result_section_opened

| Field | Type | Note |
|---|---|---|
| section | enum | translation, sentences, vocabulary, grammar, pronunciation, practice |
| lesson_id | string |  |

---

### Event: lesson_saved

| Field | Type | Note |
|---|---|---|
| lesson_id | string |  |
| source_type | enum | camera, gallery, paste_text |
| time_from_result_view_ms | number |  |

---

### Event: lesson_reopened

| Field | Type | Note |
|---|---|---|
| lesson_id | string |  |
| days_since_created | number |  |

---

### Event: audio_played

| Field | Type | Note |
|---|---|---|
| target_type | enum | word, sentence |
| lesson_id | string |  |
| word | string | Optional |

---

### Event: practice_answered

| Field | Type | Note |
|---|---|---|
| lesson_id | string |  |
| question_id | string |  |
| is_correct | boolean |  |
| skill | enum | vocabulary, grammar, translation |

---

## 6. Dashboard suggestions

### MVP dashboard

- Daily active users.
- Number of scans/uploads/paste text.
- OCR success/fail rate.
- AI success/fail rate.
- Average AI duration.
- Lesson save rate.
- Most opened result section.
- Average vocabulary count per lesson.

---

## 7. Product questions to answer after beta

| Question | Data Needed |
|---|---|
| Which input method do users prefer? | input_method_selected |
| Does OCR cause user drop-off? | ocr_completed → text_confirmed |
| Is AI result valuable enough? | result_viewed → lesson_saved |
| Which section is viewed most? | result_section_opened |
| Do users review lessons? | lesson_reopened |
| Is pronunciation feature used? | audio_played |

---

## 8. Privacy notes for tracking

Do not log full user text or images in analytics events. Only log metadata such as:

- text length bucket
- source type
- status
- counts
- duration
- error code

If full content debugging is needed, use a consent mechanism or a separate internal test environment.
