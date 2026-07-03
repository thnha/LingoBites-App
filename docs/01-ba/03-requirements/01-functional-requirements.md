# Functional Requirements

## 1. Requirement format

Each requirement uses the format:

```text
FR-[Module]-[Number]
```

Priority levels:

- Must: required for MVP
- Should: desirable if time permits
- Nice: can be deferred to a later phase

---

## 2. Input requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-IN-001 | System shall allow user to take a photo using device camera | Must |
| FR-IN-002 | System shall allow user to upload image from device gallery | Must |
| FR-IN-003 | System shall allow user to paste/type English text manually | Must |
| FR-IN-004 | System shall show image preview before OCR | Must |
| FR-IN-005 | System shall allow user to replace selected image | Must |
| FR-IN-006 | System shall validate empty text input | Must |
| FR-IN-007 | System shall warn user when input text exceeds maximum length | Should |

---

## 3. OCR requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-OCR-001 | System shall extract text from selected image | Must |
| FR-OCR-002 | System shall display OCR loading state | Must |
| FR-OCR-003 | System shall display extracted text to user | Must |
| FR-OCR-004 | System shall allow user to retry OCR | Should |
| FR-OCR-005 | System shall notify user when no text is detected | Must |
| FR-OCR-006 | System shall preserve line breaks where reasonable | Should |
| FR-OCR-007 | System shall support common image formats | Must |

---

## 4. OCR review requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-REV-001 | System shall allow user to edit extracted text | Must |
| FR-REV-002 | System shall use edited text as final analysis input | Must |
| FR-REV-003 | System shall not send text to AI before user confirms | Must |
| FR-REV-004 | System shall show character count | Should |
| FR-REV-005 | System shall warn if detected text may not be English | Nice |

---

## 5. AI analysis requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-AI-001 | System shall send confirmed text to AI analysis service | Must |
| FR-AI-002 | AI service shall return structured learning output | Must |
| FR-AI-003 | System shall validate AI output schema before rendering | Must |
| FR-AI-004 | System shall retry AI call or parsing when output is invalid | Should |
| FR-AI-005 | System shall show friendly loading messages during AI analysis | Should |
| FR-AI-006 | System shall handle AI timeout without losing user input | Must |

---

## 6. Translation requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-TR-001 | System shall display full Vietnamese translation of input text | Must |
| FR-TR-002 | System shall display Vietnamese translation per sentence | Must |
| FR-TR-003 | Translation shall be natural and beginner-friendly | Must |
| FR-TR-004 | System may display literal phrase translation for beginner | Should |

---

## 7. Sentence analysis requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-SA-001 | System shall split input text into sentences | Must |
| FR-SA-002 | System shall display original sentence and Vietnamese translation | Must |
| FR-SA-003 | System shall display sentence breakdown into meaningful parts | Must |
| FR-SA-004 | System shall display simple role for each part | Should |
| FR-SA-005 | System shall display sentence pattern when available | Should |
| FR-SA-006 | System shall display similar example sentences | Should |

---

## 8. Grammar requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-GR-001 | System shall identify key grammar points from the text | Must |
| FR-GR-002 | System shall explain grammar in Vietnamese | Must |
| FR-GR-003 | System shall provide grammar pattern/formula | Must |
| FR-GR-004 | System shall provide example sentences | Should |
| FR-GR-005 | System shall limit grammar points to avoid overwhelming beginner users | Must |

---

## 9. Vocabulary requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-VOC-001 | System shall extract important or uncommon vocabulary | Must |
| FR-VOC-002 | Each vocabulary item shall include Vietnamese meaning | Must |
| FR-VOC-003 | Each vocabulary item shall include word type | Should |
| FR-VOC-004 | Each vocabulary item shall include pronunciation guide | Should |
| FR-VOC-005 | Each vocabulary item shall include example sentence | Should |
| FR-VOC-006 | Vocabulary list should avoid very common words unless educationally necessary | Must |
| FR-VOC-007 | System shall limit vocabulary count per lesson | Must |

---

## 10. Pronunciation requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-PRO-001 | System shall provide pronunciation support for key vocabulary | Should |
| FR-PRO-002 | System shall provide pronunciation support for sentences | Should |
| FR-PRO-003 | System shall allow user to play audio if TTS is available | Should |
| FR-PRO-004 | System shall show simple Vietnamese-friendly pronunciation guide | Should |
| FR-PRO-005 | System may show IPA for advanced users | Nice |

---

## 11. Lesson requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-LES-001 | System shall create a lesson from each successful AI analysis | Must |
| FR-LES-002 | User can save a lesson | Should |
| FR-LES-003 | User can open a saved lesson | Should |
| FR-LES-004 | System shall show lesson title | Must |
| FR-LES-005 | System shall show created date | Should |
| FR-LES-006 | System shall persist AI result to avoid re-analysis on each open | Should |

---

## 12. Practice requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-PRAC-001 | System shall generate simple practice questions based on lesson | Nice |
| FR-PRAC-002 | System shall support multiple choice questions | Nice |
| FR-PRAC-003 | System shall show correct answer after user selection | Nice |
| FR-PRAC-004 | Practice questions shall use vocabulary/grammar from the current lesson | Nice |

---

## 13. Profile/setting requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-SET-001 | System shall default user level to Beginner | Must |
| FR-SET-002 | User can change learning level in settings | Nice |
| FR-SET-003 | User can choose TTS voice/speed | Nice |
| FR-SET-004 | System shall display privacy note for uploaded content | Should |

---

## 14. Operations/admin requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-OPS-001 | System shall log OCR/AI request status for debugging | Should |
| FR-OPS-002 | System shall not log sensitive full user content unless consented or anonymized | Must |
| FR-OPS-003 | System shall track basic funnel events | Must |
| FR-OPS-004 | System shall support feature flags for AI/TTS providers | Should |
