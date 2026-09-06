# Non-Functional Requirements

## 1. Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-PER-001 | App launch time | Cold start < 3 seconds, warm start < 1 second on iPhone 11+ and Android mid-range 2020+ |
| NFR-PER-002 | OCR processing time | P50 < 5 seconds, P95 < 10 seconds with clear-text images, size <= 5 MB |
| NFR-PER-003 | AI analysis time | P50 < 15 seconds, P95 < 30 seconds with text <= 3,000 characters |
| NFR-PER-004 | Saved lesson detail load time | Target < 1 second for saved lessons |
| NFR-PER-005 | Image compression | Mobile compresses/resizes images before upload when image > 5 MB or long edge > 2,000 px; backend rejects images > 5 MB after processing |

---

## 2. Reliability

| ID | Requirement |
|---|---|
| NFR-REL-001 | App should not lose user input after OCR/AI failure. |
| NFR-REL-002 | App must handle invalid AI JSON gracefully. |
| NFR-REL-003 | App should support retry for OCR and AI. |
| NFR-REL-004 | Saved lessons should remain available after app restart. |
| NFR-REL-005 | App should prevent duplicate lesson save from repeated taps. |

---

## 3. Security & privacy

| ID | Requirement |
|---|---|
| NFR-SEC-001 | User-uploaded images/text may contain personal data and must be handled carefully. |
| NFR-SEC-002 | Sensitive content should not be logged in plaintext unless required and consented. |
| NFR-SEC-003 | API keys must not be stored directly in mobile client. |
| NFR-SEC-004 | AI/OCR calls must go through backend proxy; mobile must not call providers directly in Phase 0. |
| NFR-SEC-005 | Communication with backend/AI/OCR providers must use HTTPS. |
| NFR-SEC-006 | User can delete saved lesson data. |

---

## 4. Usability

| ID | Requirement |
|---|---|
| NFR-USE-001 | New learners can start scanning within at most 2 taps from Home. |
| NFR-USE-002 | Explanations must be easy to read on small mobile screens. |
| NFR-USE-003 | Result sections must be clearly grouped and easy to scan. |
| NFR-USE-004 | Avoid overwhelming user with too much grammar/vocabulary at once. |
| NFR-USE-005 | Error messages should be friendly and include a clear action. |

---

## 5. Accessibility

| ID | Requirement |
|---|---|
| NFR-ACC-001 | Text should support dynamic font size where possible. |
| NFR-ACC-002 | Buttons should have sufficient tap area. |
| NFR-ACC-003 | Audio play controls should have accessible labels. |
| NFR-ACC-004 | Color should not be the only way to communicate correct/incorrect answer. |
| NFR-ACC-005 | Contrast must be sufficient for easy reading of learning content. |

---

## 6. Scalability

| ID | Requirement |
|---|---|
| NFR-SCA-001 | AI provider should be replaceable via service abstraction. |
| NFR-SCA-002 | OCR provider should be replaceable via service abstraction. |
| NFR-SCA-003 | Lesson schema should support future features such as flashcards and speaking practice. |
| NFR-SCA-004 | Backend should track API usage to manage cost. |

---

## 7. Maintainability

| ID | Requirement |
|---|---|
| NFR-MAI-001 | AI prompt must be versioned. |
| NFR-MAI-002 | AI output schema must be versioned. |
| NFR-MAI-003 | Business rules should be separated from UI logic where possible. |
| NFR-MAI-004 | Feature flags should be used for experimental features. |
| NFR-MAI-005 | Test cases should cover OCR, AI output, lesson save, and error states. |

---

## 8. Localization

| ID | Requirement |
|---|---|
| NFR-LOC-001 | App UI language in Phase 0 should be Vietnamese. |
| NFR-LOC-002 | AI explanations should be in Vietnamese. |
| NFR-LOC-003 | English terms should include Vietnamese explanation. |
| NFR-LOC-004 | Future localization should not require rewriting business logic. |

---

## 9. Cost control

| ID | Requirement |
|---|---|
| NFR-COST-001 | AI and OCR usage must be logged by request count, status, duration, token usage if available — without logging raw content. |
| NFR-COST-002 | Input length must be limited to avoid high AI costs. |
| NFR-COST-003 | Saved lessons should not call AI again unless user regenerates. |
| NFR-COST-004 | TTS should be cached or generated on demand depending on cost strategy. |

---

## 10. Compatibility

| ID | Requirement |
|---|---|
| NFR-COM-001 | Default app targets: iOS 15+ and Android 8.0/API 26+; if React Native version requires higher, update this file before building. |
| NFR-COM-002 | Image picker and camera must be tested on real devices. |
| NFR-COM-003 | OCR accuracy must be tested under common capture conditions. |
