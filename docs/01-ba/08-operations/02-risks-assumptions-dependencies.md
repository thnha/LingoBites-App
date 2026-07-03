# Risks, Assumptions & Dependencies

## 1. Risks

| ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-001 | OCR misrecognizes text | High | Medium | Let user edit text before AI analyze |
| R-002 | AI output JSON unstable | High | Medium | Use schema validation, retry, structured output |
| R-003 | Explanations too hard for beginners | High | Medium | Beginner-first prompt, content QA with absolute beginners |
| R-004 | AI/OCR API cost too high | Medium | Medium | Limit text length, cache lesson, track usage |
| R-005 | User scans overly long content | Medium | High | Character limit, split text |
| R-006 | User uploads image with personal information | High | Medium | Privacy notice, limit raw image/text storage |
| R-007 | TTS unnatural or fails | Medium | Medium | Fallback pronunciation guide |
| R-008 | App perceived as Google Translate clone | High | Medium | Focus on learning output, lesson, practice |
| R-009 | AI grammar analysis incorrect | Medium | Medium | Limit scope, confidence/fallback, user feedback |
| R-010 | User overwhelmed by too much output | High | Medium | Collapse sections, limit grammar/vocab count |

---

## 2. Assumptions

| ID | Assumption | How to validate |
|---|---|---|
| A-001 | Learners want to scan real-world text to study | User interviews / beta usage |
| A-002 | Absolute beginners need explanations in Vietnamese | Usability testing |
| A-003 | Translation + grammar + vocabulary on one screen has value | Result satisfaction survey |
| A-004 | Users will save lessons if output is useful | Lesson save rate |
| A-005 | Short/medium text is the main Phase 0 use case | Input length analytics |
| A-006 | Pronunciation guide helps beginners | Audio play / feedback |

---

## 3. Dependencies

| ID | Dependency | Type | Notes |
|---|---|---|---|
| D-001 | OCR provider | Technical | Google ML Kit / Vision / other OCR |
| D-002 | AI model/provider | Technical | Structured output required |
| D-003 | TTS provider | Technical | Native TTS or cloud TTS |
| D-004 | Mobile permission APIs | Platform | Camera/gallery permission |
| D-005 | Storage/database | Technical | Local or backend |
| D-006 | Analytics tool | Technical | Firebase/Amplitude/PostHog/etc. |
| D-007 | UX design | Product | Result layout friendly to beginners |
| D-008 | Test images/data | QA | Need real-world input samples |

---

## 4. Decided items and open questions

The following foundational questions are decided in `02-technical/01-technical-implementation-spec.md` and are defaults for Phase 0:

| ID | Original question | Phase 0 decision | Source |
|---|---|---|---|
| Q-001 | Is login required in Phase 0? | Login not required | `02-technical/01-technical-implementation-spec.md §2` |
| Q-002 | Save lessons locally or in cloud? | Local-first on device | `02-technical/01-technical-implementation-spec.md §2`, `§9` |
| Q-003 | Store original images? | Do not store original images by default | `02-technical/01-technical-implementation-spec.md §2`, `§12` |
| Q-004 | On-device or cloud OCR? | OCR via backend proxy to OCR provider | `02-technical/01-technical-implementation-spec.md §2`, `§7` |
| Q-005 | TTS in Phase 0? | Cloud TTS not required; use native TTS or pronunciation guide | `02-technical/01-technical-implementation-spec.md §2` |
| Q-006 | Text length limit? | 3,000 characters | `02-technical/01-technical-implementation-spec.md §11` |
| Q-007 | Allow user to regenerate AI result? | Off by default in Phase 0 | `07-release/01-release-production-readiness.md §10` |
| Q-008 | Report AI mistakes? | Minimum feedback/support channel required | `07-release/01-release-production-readiness.md §17` |

Questions still to be decided before closed beta:

| ID | Open question | Owner | Decide before |
|---|---|---|---|
| Q-009 | What is the first OCR provider? | Tech Lead | M3 |
| Q-010 | What is the first AI provider/model? | Tech Lead/AI Engineer | M2 |
| Q-011 | What analytics tool? | Product/Tech Lead | M5 |
| Q-012 | What crash/error reporting tool? | Tech Lead | M5 |
| Q-013 | Where to deploy backend? | Tech Lead/DevOps | M2 |
| Q-014 | What is the official support email/URL? | PO | Closed beta |

---

## 5. Mitigation plan

### OCR quality

- Let user edit text.
- Guide clear photo capture.
- Retry OCR.
- Provide paste text fallback.

### AI reliability

- Use strict JSON prompt.
- Validate schema.
- Retry on invalid output.
- Log prompt version/model/error.
- Build sample test suite for AI output.

### User overload

- Collapse sections.
- Limit vocabulary/grammar count.
- Beginner Mode by default.
- Short summary before deep learning.

### Privacy

- Do not store images unless needed.
- Allow lesson deletion.
- Do not log full content in analytics.
- Provide privacy note.

### Cost

- Limit text length.
- Cache lesson output.
- Do not call AI again when opening lesson.
- Track token usage.
