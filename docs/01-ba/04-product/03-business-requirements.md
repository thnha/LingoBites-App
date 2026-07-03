# BRD — Business Requirements Document

## 1. Document Information

| Item | Value |
|---|---|
| Product | LingoBites |
| Document Type | Business Requirements Document |
| Phase | Phase 0 — MVP |
| Audience | Founder, PO, BA, UX, Dev, QA, AI Engineer |
| Version | 1.0 |

---

## 2. Business Objective

Build an MVP English learning app for Vietnamese beginners that lets users capture or upload images containing English text and receive a lesson in Vietnamese.

---

## 3. Detailed Business Objectives

| ID | Objective | Description |
|---|---|---|
| BG-01 | Validate product value | Validate that users see value when scanning text and receiving a lesson |
| BG-02 | Reduce learning friction | Help beginners understand English passages without opening multiple apps |
| BG-03 | Build reusable lesson database | Each scan creates a lesson that can be saved and reviewed |
| BG-04 | Prepare for monetization | Build foundation for flashcard, speaking, and premium AI analysis in later phases |

---

## 4. Business Scope

### In Scope

- Capture or upload images.
- OCR English text recognition.
- User edits text before analysis.
- AI translation to Vietnamese.
- AI sentence, vocabulary, and grammar analysis.
- AI basic pronunciation guidance.
- Save lessons.
- Review saved lessons.
- Create basic mini practice.

### Out of Scope

- Payment.
- Teacher accounts.
- Learner community.
- Livestream / classes.
- Unrelated free-form tutor chat.
- Advanced pronunciation scoring.
- Multi-language support beyond English → Vietnamese.

---

## 5. Stakeholders

| Stakeholder | Role | Responsibility |
|---|---|---|
| Founder / Product Owner | Business owner | Define vision, priorities, release scope |
| Business Analyst | Requirements owner | Write and manage requirements |
| UX/UI Designer | Design owner | Design flow, layout, interaction |
| Mobile Developer | App implementation | Build iOS/Android app |
| Backend Developer | API/data implementation | Handle storage, lessons, AI calls |
| AI Engineer | AI output quality | Prompt, schema, validation, retry |
| QA | Quality assurance | Test functionality, edge cases, regression |
| End User | Learner | Use the app to learn English |

---

## 6. Business Process Overview

```text
User has English text in real life
→ User scans/uploads image
→ App extracts text
→ User confirms/corrects text
→ App sends text to AI analysis service
→ AI returns structured learning result
→ App displays lesson
→ User saves lesson
→ User reviews vocabulary/grammar later
```

---

## 7. High-Level Business Requirements

| ID | Requirement | Priority |
|---|---|---|
| BR-01 | User can input English content from image or text | Must |
| BR-02 | System shall extract readable English text from image | Must |
| BR-03 | User can review and edit extracted text | Must |
| BR-04 | System shall translate English text into Vietnamese | Must |
| BR-05 | System shall explain each sentence in beginner-friendly Vietnamese | Must |
| BR-06 | System shall detect important grammar points | Must |
| BR-07 | System shall extract important/uncommon vocabulary | Must |
| BR-08 | System shall provide pronunciation support | Should |
| BR-09 | User can save generated lessons | Should |
| BR-10 | System shall generate simple practice questions | Nice-to-have |

---

## 8. Business Constraints

| Constraint | Description |
|---|---|
| Beginner-first | Output must be easy for beginners to understand |
| Vietnamese-first explanation | Primary explanations must be in Vietnamese |
| Stable AI schema | AI output needs stable structure to render UI |
| OCR uncertainty | App must let users edit text because OCR can be wrong |
| Cost control | AI/OCR/TTS API costs must be controlled |
| Privacy | User-uploaded images and text may contain personal information |

---

## 9. Assumptions

| ID | Assumption |
|---|---|
| AS-01 | User has internet when running AI analysis |
| AS-02 | Phase 0 only supports English → Vietnamese |
| AS-03 | Scanned content is mainly short to medium text |
| AS-04 | Beginners need simple translation and explanation more than academic terminology |
| AS-05 | AI output may need validation/retry before display |

---

## 10. Business Success Metrics

| Metric | MVP Reference Target |
|---|---|
| Scan completed rate | >= 70% of users who start a scan receive a result |
| Lesson save rate | >= 25% of generated lessons are saved |
| Result satisfaction | >= 4/5 in quick survey |
| Retry/error rate | <= 10% AI/OCR request failures |
| Return usage rate | >= 20% of users return within 7 days |

---

## 11. Approval Criteria

Phase 0 can be approved if:

- Core flow scan → OCR → edit → AI result → save lesson works.
- Output is easy to understand for absolute beginners.
- Test cases pass for common inputs.
- Basic event tracking exists to measure funnel.
- Risk handling exists for OCR fail, AI fail, and network fail.
