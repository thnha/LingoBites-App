# Scan & Learn English — Consolidated BA Documentation

> This file was generated from `docs/01-ba/README.md` through `docs/01-ba/07-release/03-store-listing-design-assets.md`. To edit content, update the source file first, then regenerate this file.


---

## Source: `docs/ba/README.md`

# Scan & Learn English — BA Documentation

## 1. Purpose

This directory is the primary BA documentation source for **Scan & Learn English**. Documentation is organized by role so readers do not have to load the entire context at once.

The core loop must not be built differently:

```text
Scan/Input → Confirm Text → Generate Lesson → Learn → Save → Review
```

Do not load `90-archive/MASTER.md` for AI coding agents because it is a very long consolidated document.

---

## 2. Quick reading by role

### Founder / Product Owner

| Read | Purpose |
|---|---|
| `04-product/01-product-brief.md` | Vision, problem, users |
| `04-product/04-phase0-prd.md` | Phase 0 PRD |
| `04-product/05-phase0-feature-scope.md` | MVP scope |
| `04-product/06-roadmap-release-plan.md` | Phase 0+ roadmap |
| `08-operations/03-ai-key-strategy-byok-paid-managed.md` | AI cost reduction strategy and paid managed mode |
| `07-release/01-release-production-readiness.md` | Beta/public ship criteria |

### BA / PM

| Read | Purpose |
|---|---|
| `03-requirements/01-functional-requirements.md` | Product FRs |
| `03-requirements/02-business-rules.md` | Business rules |
| `03-requirements/03-user-stories-acceptance.md` | User stories + acceptance criteria |
| `03-requirements/05-traceability-matrix.md` | FR → US → TC → module |
| `08-operations/02-risks-assumptions-dependencies.md` | Risks, assumptions, dependencies |

### Developer / AI Coding Agent

Read only the critical path group first:

| Read | Purpose |
|---|---|
| `04-product/04-phase0-prd.md` | Phase 0 goals |
| `03-requirements/01-functional-requirements.md` | Features to build |
| `03-requirements/02-business-rules.md` | Rules that must not be violated |
| `05-qa/01-qa-test-plan.md` | Test gate |
| `02-technical/01-technical-implementation-spec.md` | Stack, API, persistence, env |
| `02-technical/02-implementation-plan-m1-m5.md` | Build order M0–M5 |
| `03-requirements/05-traceability-matrix.md` | Checklist to prevent shipping incomplete work |
| `01-schema/01-ai-output-v1.ts` | Canonical AI output schema |

Open additionally only when needed:

| When needed | Read more |
|---|---|
| Prompt/output quality | `02-technical/03-ai-output-requirements.md` |
| Real OCR/AI provider | `02-technical/04-ai-ocr-integration.md` |
| AI coding agent workflow | `02-technical/06-ai-agent-implementation-guide.md` |
| BYOK / paid managed AI | `08-operations/03-ai-key-strategy-byok-paid-managed.md` |
| Security/key/data protection | `08-operations/04-security-key-and-data-protection.md` |
| Release/store/privacy | `07-release/*` |
| Public app setup: env/store/Firebase/services/accounts | `07-release/04-public-app-setup-checklist.md` |
| UI/theme work | `06-design/*` |

### QA

| Read | Purpose |
|---|---|
| `05-qa/01-qa-test-plan.md` | Test cases and strategy |
| `03-requirements/05-traceability-matrix.md` | FR/US/TC coverage |
| `07-release/01-release-production-readiness.md` | Release blockers/gates |
| `02-technical/01-technical-implementation-spec.md` | Integration/API behavior to test |

### Design / UX

| Read | Purpose |
|---|---|
| `04-product/02-personas-journey.md` | Personas and journey |
| `06-design/01-user-flow-screen-spec.md` | User flow + screen spec |
| `06-design/02-ui-wireframes.md` | Wireframe text |
| `06-design/03-theme-system.md` | Theme foundation/polish |
| `07-release/03-store-listing-design-assets.md` | Store screenshots, visual direction, assets |

### Release / Ops / Privacy

| Read | Purpose |
|---|---|
| `07-release/01-release-production-readiness.md` | Release gate, blockers, cost/security readiness |
| `07-release/02-privacy-policy-draft.md` | Privacy policy draft |
| `07-release/03-store-listing-design-assets.md` | Store listing and assets |
| `07-release/04-public-app-setup-checklist.md` | Accounts, env, store, Firebase/services setup |
| `08-operations/01-analytics-kpi-events.md` | KPI/events |
| `08-operations/03-ai-key-strategy-byok-paid-managed.md` | AI key, quota, BYOK/paid managed |
| `08-operations/04-security-key-and-data-protection.md` | Security/key/data protection baseline |

---

## 3. Consistent feature roadmap

| Milestone | Main scope | Source documents |
|---|---|---|
| M0 | Project setup, mobile/API scaffold, env, fixtures | `02-technical/02-implementation-plan-m1-m5.md` |
| M1 | Paste text → mock AI fixture → validate schema → result screen | `02-technical/02-implementation-plan-m1-m5.md`, `01-schema/01-ai-output-v1.ts` |
| M2 | Fastify backend proxy + real AI + schema validation + retry invalid output | `02-technical/01-technical-implementation-spec.md`, `02-technical/03-ai-output-requirements.md` |
| M3 | Camera/gallery → OCR → review/edit confirmed text | `02-technical/04-ai-ocr-integration.md`, `03-requirements/02-business-rules.md` |
| M4 | Save/history/detail/delete local data, no AI recall for saved lesson | `02-technical/05-data-model.md`, `02-technical/01-technical-implementation-spec.md` |
| M5 | Analytics, loading/error/empty states, privacy note, cost guard, beta readiness | `08-operations/01-analytics-kpi-events.md`, `07-release/01-release-production-readiness.md` |
| Post Phase 0 | Account/sync, subscription, full BYOK rollout, advanced review/practice | `04-product/06-roadmap-release-plan.md`, `08-operations/03-ai-key-strategy-byok-paid-managed.md` |

The theme system is UI foundation/polish; it does not block the M1–M4 core loop if the current task is not theme-related.

---

## 4. Directories

| Folder | Role |
|---|---|
| `01-schema/` | Canonical machine-readable AI schema |
| `02-technical/` | Architecture, API, AI/OCR integration, implementation plan |
| `03-requirements/` | FR, BR, US/AC, NFR, traceability |
| `04-product/` | Product, business, roadmap, scope |
| `05-qa/` | QA strategy and test cases |
| `06-design/` | UX flow, screen spec, wireframes, theme |
| `07-release/` | Production readiness, privacy, store assets |
| `08-operations/` | Analytics, risk, AI key strategy |
| `90-archive/` | Generated/large reference docs, not for coding-agent context |

---

## 5. Source of truth

When documentation conflicts:

1. `01-schema/01-ai-output-v1.ts` for everything related to AI output.
2. `02-technical/01-technical-implementation-spec.md` for technical decisions.
3. `02-technical/02-implementation-plan-m1-m5.md` for implementation order.
4. `03-requirements/01-functional-requirements.md` + `03-requirements/02-business-rules.md` for product behavior.
5. `06-design/*` for UX/copy/wireframe when not conflicting with core rules.

---

## 6. Absolute rules

- Do not send raw OCR text to AI before the user confirms.
- `confirmed_text` is the source of truth for AI analysis and saved lessons.
- AI output must pass through `validateAIOutput()` before render or save.
- Reopening a saved lesson must not call AI again.
- Mobile must not contain system OCR/AI provider keys.
- Do not store original images by default.
- Do not log full scanned text, images, or full AI output.
- Do not build payment/gamification/sync before the core loop works.

## Source: `docs/ba/product/product-brief.md`

# Product Brief — Scan & Learn English

## 1. Product Name

Working title:

```text
Scan & Learn English
```

Vietnamese name option:

```text
Chụp & Học Tiếng Anh
```

---

## 2. Product Vision

Build an app that helps Vietnamese speakers learn English from real-life content by capturing or uploading images containing English text. The app turns the text into an easy-to-understand lesson including:

- Vietnamese translation
- Sentence breakdown
- Important vocabulary
- Grammar in context
- Reusable sentence patterns
- Pronunciation guidance
- Short practice exercises

---

## 3. Problem to Solve

Beginners learning English often face these issues:

1. They see English in daily life but do not understand the meaning.
2. Translation apps only show meaning, not how to use the sentence.
3. They do not know which tense or structure the sentence uses.
4. They do not know which words to learn and which to skip.
5. They do not know correct pronunciation.
6. They have no way to save what they learned for review.

---

## 4. Product Opportunity

Existing apps such as Google Translate, Google Lens, and DeepL translate well, but they do not focus on turning real-world text into lessons for Vietnamese beginners.

Product opportunity:

> Combine OCR + Translation + AI English Tutor to create a personalized English learning experience from real content.

---

## 5. Target Users

### Primary Users

Vietnamese speakers who are just starting English or have weak foundations.

Characteristics:

- Not confident reading long English passages.
- Need explanations in Vietnamese.
- Need simple examples.
- Unfamiliar with complex grammar terminology.
- Want to learn from real situations.

### Secondary Users

- Students who need to understand English materials.
- Office workers who encounter English emails or notices.
- Travelers who need to understand menus, signs, and flyers.
- Self-learners who need fast sentence analysis tools.

---

## 6. Core Value

```text
Not just translating English into Vietnamese.
The app helps users understand, learn, practice, and remember from the exact English text they encounter in daily life.
```

---

## 7. Product Positioning

| App Category | Strengths | Weaknesses | Opportunity for This App |
|---|---|---|---|
| Google Translate | Fast translation, good scanning | Little grammar explanation | Focus on deeper learning |
| Google Lens | Good image scanning | Does not create lessons | Create lessons from images |
| DeepL | Natural translation | Not beginner-friendly for Vietnamese users | Explain in Vietnamese |
| Dictionary | Detailed word lookup | Does not explain full sentences | Context-based analysis |
| Traditional learning apps | Structured curriculum | Not personalized to real-world text | Learn from user-chosen content |

---

## 8. Phase 0 Product Goals

Phase 0 must validate 3 hypotheses:

1. Users need to scan real-world English text.
2. Users see value when the app explains sentences, vocabulary, and grammar in Vietnamese.
3. Users want to save lessons for review.

---

## 9. Out of Phase 0 Scope

Features not included in Phase 0:

- Live camera real-time translation.
- Advanced speaking score.
- Full grammar course.
- Community.
- Payment/subscription.
- Teacher marketplace.
- Web extension.
- Multi-language learning.
- Offline full AI analysis.

---

## 10. Product Success Criteria

Phase 0 succeeds if:

- Users can scan an image and receive results within an acceptable time.
- Users understand the translation and explanations.
- Users can learn at least 1 new word or 1 sentence pattern after each scan.
- Users return to view saved lessons.
- AI output or OCR error rates do not break the core experience.

## Source: `docs/ba/product/business-requirements.md`

# BRD — Business Requirements Document

## 1. Document Information

| Item | Value |
|---|---|
| Product | Scan & Learn English |
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

## Source: `docs/ba/product/phase0-prd.md`

# PRD — Product Requirements Document

## 1. Overview

**Scan & Learn English** is an English learning app for Vietnamese beginners. Users can capture or upload images containing English text; the app recognizes the text and generates an easy-to-understand lesson in Vietnamese.

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

## Source: `docs/ba/product/phase0-feature-scope.md`

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

## Source: `docs/ba/product/personas-journey.md`

# User Personas & User Journey

## 1. Primary Persona — English Beginner

| Attribute | Detail |
|---|---|
| Name | Minh |
| Age | 18–30 |
| English Level | A0–A1 |
| Goal | Understand basic English in daily life |
| Pain Point | Afraid of grammar, does not know where to start |
| Behavior | Uses Google Translate when encountering English, but does not retain it |
| Need | Explanations in Vietnamese, easy examples, not overly academic |

### Context

Minh sees an English flyer:

```text
We are offering a special discount for new customers.
```

Minh wants to know what this sentence means, what "are offering" is, how to pronounce "discount", and how to reuse this sentence pattern.

---

## 2. Secondary Persona — Student

| Attribute | Detail |
|---|---|
| Name | An |
| Age | 15–22 |
| English Level | A1–B1 |
| Goal | Understand reading passages, learn vocabulary, prepare for class |
| Pain Point | Too many new words, unclear sentence structures |
| Need | Sentence breakdown, grammar explanation, vocabulary saving |

---

## 3. Secondary Persona — Office Worker

| Attribute | Detail |
|---|---|
| Name | Lan |
| Age | 23–35 |
| English Level | A1–B1 |
| Goal | Understand English emails, documents, and notices |
| Pain Point | Can translate meaning but does not understand how to use the sentence |
| Need | Natural translation, domain-specific word explanation, reusable sentence patterns |

---

## 4. User Journey — Scan Real-World Text

### Stage 1: Encounter English Text

| Item | Detail |
|---|---|
| User action | Sees an English flyer/article/menu/email |
| User thought | "Mình không hiểu câu này lắm" |
| Pain point | Opening dictionary or translate requires many steps |
| Product opportunity | Scan once, learn immediately |

### Stage 2: Input Content into App

| Item | Detail |
|---|---|
| User action | Opens app, captures/uploads image |
| User thought | "Hy vọng app đọc đúng chữ" |
| Pain point | Blurry image, incorrect OCR |
| Product requirement | Image preview, OCR text editing |

### Stage 3: Confirm Text

| Item | Detail |
|---|---|
| User action | Reviews recognized text, edits if wrong |
| User thought | "Mình sửa lại chữ bị sai rồi phân tích" |
| Pain point | If text cannot be edited, AI analysis is wrong |
| Product requirement | Editable text area before analysis |

### Stage 4: Learn from Results

| Item | Detail |
|---|---|
| User action | Reads translation, sentence breakdown, vocabulary, grammar |
| User thought | "À, câu này dùng are + V-ing" |
| Pain point | Overly difficult explanations cause users to give up |
| Product requirement | Beginner-friendly explanations |

### Stage 5: Save and Review

| Item | Detail |
|---|---|
| User action | Saves lesson and reviews later |
| User thought | "Mình muốn lưu từ discount để học lại" |
| Pain point | After using translate, users forget |
| Product requirement | Save lessons, vocabulary list |

---

## 5. Emotional User Journey

| Step | Emotion | Risk | UX Response |
|---|---|---|---|
| Open app | Curious | Does not know where to start | Simple home, clear CTA |
| Upload image | Hopeful | Permission/image error | Clear guidance |
| OCR result | Unsure | Incorrect text | Easy editing |
| AI loading | Waiting | Long wait | Meaningful loading message |
| Result | Interested | Too much information | Clear sections, collapsible |
| Save lesson | Satisfied | Cannot find where to save | Show saved state + Lessons tab |

---

## 6. Key UX Insights

Learners starting from zero do not need many features upfront. They need 3 things:

1. Understand meaning quickly.
2. Know what structure the sentence uses.
3. Have simple examples to reuse.

Therefore, the app should prioritize clarity over completeness.

## Source: `docs/ba/design/user-flow-screen-spec.md`

# User Flow & Screen Specification

## 1. Main Navigation

Phase 0 proposes 5 tabs:

```text
Home | Scan | Lessons | Vocabulary | Profile
```

In a minimal MVP, only these may be needed:

```text
Home | Lessons | Profile
```

The Scan tab can be the primary CTA in the center.

---

## 2. Main Flow

```text
Home
→ Select input method
→ Camera / Image Picker / Dán text
→ OCR Processing
→ Review & Edit Text
→ AI Analysis Loading
→ Kết quả bài học
→ Lưu bài học
→ Lesson Detail
```

---

## 3. Screen: Home

### Purpose

Let the user start a scan or continue learning a previous lesson.

### Main Components

- App title / greeting.
- Primary CTA: Chụp ảnh học ngay.
- Secondary CTA: Upload ảnh.
- Third CTA: Paste text.
- Recent lessons.
- Quick tip for beginners.

### Example Layout

```text
Hôm nay bạn muốn học từ đâu?

[ Chụp ảnh ]
[ Upload ảnh ]
[ Paste text ]

Bài học gần đây
- Special Discount Flyer
- Restaurant Menu
- Email Notice
```

### Acceptance Criteria

- User sees the primary CTA as soon as they open the app.
- User can start the flow in at most 2 taps.
- If there are no lessons yet, show a friendly empty state.

---

## 4. Screen: Chụp ảnh / Upload ảnh

### Purpose

Receive image input from the camera or photo library.

### Components

- Camera view or image picker.
- Image preview.
- Retake/change image.
- Continue button.

### States

| State | UI |
|---|---|
| No permission | Yêu cầu cấp quyền camera/photo |
| Image selected | Preview ảnh + button Continue |
| Loading OCR | Loading overlay |
| OCR failed | Error + retry |

### Acceptance Criteria

- User can select or capture an image.
- User can change the image before OCR.
- App handles permission denied.

---

## 5. Screen: Review and Edit OCR

### Purpose

Let the user verify OCR text before analysis.

### Components

- Image thumbnail.
- Editable text area.
- Detected language hint.
- Character count.
- Analyze button.
- Retry OCR button.

### Example Layout

```text
Text app nhận diện được

[editable text area]
We are offering a special discount for new customers.
Please visit our store before Friday.

[ Phân tích & học ngay ]
```

### Validation

- Empty text: disable Analyze.
- Text too long: show warning.
- Text does not look like English: show warning but still allow continue if the user wants.

### Acceptance Criteria

- User can edit the text.
- Text after editing is used for AI analysis.
- User does not lose text when navigating back.

---

## 6. Screen: AI Analysis Loading

### Purpose

Inform the user that the app is creating a lesson.

### Components

- Loading indicator.
- Friendly progress message.
- Cancel/back option if needed.

### Suggested Messages

```text
Đang dịch sang tiếng Việt...
Đang tìm từ vựng quan trọng...
Đang phân tích ngữ pháp dễ hiểu...
Đang tạo bài luyện tập ngắn...
```

### Acceptance Criteria

- Loading does not make the user think the app has frozen.
- On timeout, user can retry.
- Input text is not lost on retry.

---

## 7. Screen: Lesson Result Overview

### Purpose

Display the lesson created from the input text.

### Main Sections

1. Original text.
2. Vietnamese translation.
3. Sentence analysis.
4. Vocabulary.
5. Grammar.
6. Pronunciation.
7. Practice.
8. Save lesson.

### Example Layout

```text
Special Discount Flyer

Bản gốc
We are offering a special discount for new customers.

Bản dịch
Chúng tôi đang cung cấp một chương trình giảm giá đặc biệt cho khách hàng mới.

[ Học từng câu ]
[ Từ vựng quan trọng ]
[ Ngữ pháp trong đoạn ]
[ Luyện phát âm ]
[ Quick Practice ]

[ Lưu bài học ]
```

### Acceptance Criteria

- User immediately understands the translation.
- User can expand/collapse sections.
- Save button shows the correct state.

---

## 8. Screen: Sentence Detail

### Purpose

Explain each sentence for beginners.

### Components

- Original sentence.
- Play audio.
- Vietnamese translation.
- Phrase breakdown table.
- Grammar used.
- Pattern.
- Similar examples.

### Example

```text
We are offering a special discount for new customers.

Dịch:
Chúng tôi đang cung cấp một chương trình giảm giá đặc biệt cho khách hàng mới.

Tách câu:
We = Chúng tôi
are offering = đang cung cấp
a special discount = một chương trình giảm giá đặc biệt
for new customers = cho khách hàng mới

Mẫu câu:
S + am/is/are + V-ing + Object
```

### Acceptance Criteria

- Each sentence has enough information to learn from.
- Explanation is not too long.
- Similar examples are included.

---

## 9. Screen: Vocabulary List

### Purpose

Display words and phrases worth learning from the lesson.

### Components

- Word/phrase.
- Vietnamese meaning.
- Word type.
- Pronunciation.
- CEFR level.
- Example.
- Save word button.

### Acceptance Criteria

- User understands word meaning.
- User can hear or see pronunciation.
- User can save a word if the feature is enabled.

---

## 10. Screen: Grammar Section

### Purpose

Teach grammar that appears in the text passage.

### Components

- Grammar name.
- Vietnamese name.
- Simple explanation.
- Pattern.
- Original example from input.
- New examples.

### Acceptance Criteria

- Grammar point is linked to the original sentence.
- Explanation is suitable for beginners.
- No more than 3 main grammar points per lesson.

---

## 11. Screen: Lesson History

### Purpose

Let the user review saved lessons.

### Components

- List lessons.
- Lesson title.
- Created date.
- Short preview.
- Number of words learned.
- Search/filter optional.

### Acceptance Criteria

- User sees saved lessons.
- User can open lesson detail.
- Clear empty state when there are no lessons.

---

## 12. Screen: Profile / Settings

### Phase 0 Scope

- Learning level: Beginner by default.
- App language: Vietnamese.
- TTS voice setting if available.
- Privacy note.
- Clear local data if needed.

---

## 13. Empty States and Error States

| Situation | Message |
|---|---|
| No lesson | Bạn chưa có bài học nào. Hãy chụp một đoạn tiếng Anh để bắt đầu. |
| OCR failed | App chưa nhận diện được chữ trong ảnh. Hãy thử ảnh rõ hơn hoặc nhập text thủ công. |
| AI failed | App chưa tạo được bài học. Vui lòng thử lại. |
| No vocabulary | Đoạn này khá đơn giản, app chưa tìm thấy từ vựng khó đáng học. |
| No grammar | Đoạn này không có cấu trúc ngữ pháp nổi bật. |

---

## 14. UX Priorities

Priority order when designing UI:

1. Easy to get started.
2. Easy to edit OCR text.
3. Easy to understand the translation.
4. Easy to learn sentence by sentence.
5. Do not overwhelm the user.

## Source: `docs/ba/requirements/functional-requirements.md`

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

## Source: `docs/ba/requirements/business-rules.md`

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
| BR-AI-003 | If AI output is invalid, system should retry or use fallback response. |
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

## Source: `docs/ba/technical/ai-output-requirements.md`

# AI Output Requirements

## 1. Goal

The AI service must turn English input into structured English-learning output that is easy for Vietnamese beginners to understand.

---

## 2. Role of AI

AI plays the role of:

```text
English teacher for Vietnamese beginners
```

AI does not only translate. AI must:

- Translate naturally.
- Split into sentences.
- Explain sentence structure.
- Select important vocabulary.
- Identify grammar.
- Suggest pronunciation.
- Create simple practice exercises.

---

## 3. AI Output Principles

1. Output must be valid JSON.
2. No markdown in JSON values unless the field allows it.
3. Do not use complex terminology without explanation.
4. All grammar/vocabulary should come from the input text.
5. Do not generate too much content that overwhelms learners.
6. Translation must be in Vietnamese.
7. Explanations must suit beginners.

---

## 4. Required JSON Schema — Conceptual Level

> **Source of truth is code, not this description.** The full machine-readable schema (including all
> nested fields, required/optional, defaults) is in `01-schema/01-ai-output-v1.ts` (Zod).
> When implementing or validating, use `validateAIOutput()` from that file. Valid examples:
> `01-schema/fixtures/valid-full.json`, `valid-minimal.json`; error example for retry testing:
> `invalid-missing-field.json`. The conceptual description below is for quick reading only.

```json
{
  "title": "string",
  "detected_language": "English",
  "level": "Beginner",
  "original_text": "string",
  "vietnamese_translation": "string",
  "summary": "string",
  "sentences": [],
  "grammar_points": [],
  "vocabulary": [],
  "pronunciation": {},
  "practice": [],
  "warnings": []
}
```

---

## 5. Full JSON Example

```json
{
  "title": "Special Discount Flyer",
  "detected_language": "English",
  "level": "Beginner",
  "original_text": "We are offering a special discount for new customers. Please visit our store before Friday.",
  "vietnamese_translation": "Chúng tôi đang cung cấp một chương trình giảm giá đặc biệt cho khách hàng mới. Vui lòng ghé cửa hàng của chúng tôi trước thứ Sáu.",
  "summary": "Đoạn này nói về một chương trình giảm giá đặc biệt dành cho khách hàng mới và yêu cầu khách ghé cửa hàng trước thứ Sáu.",
  "sentences": [
    {
      "id": "s1",
      "original": "We are offering a special discount for new customers.",
      "translation": "Chúng tôi đang cung cấp một chương trình giảm giá đặc biệt cho khách hàng mới.",
      "simple_meaning": "Cửa hàng đang có giảm giá cho khách hàng mới.",
      "breakdown": [
        {
          "text": "We",
          "meaning": "Chúng tôi",
          "role": "Subject",
          "simple_role_vi": "Chủ ngữ - người thực hiện hành động"
        },
        {
          "text": "are offering",
          "meaning": "đang cung cấp",
          "role": "Verb phrase",
          "simple_role_vi": "Cụm động từ - hành động đang diễn ra"
        },
        {
          "text": "a special discount",
          "meaning": "một chương trình giảm giá đặc biệt",
          "role": "Object",
          "simple_role_vi": "Tân ngữ - thứ được cung cấp"
        },
        {
          "text": "for new customers",
          "meaning": "cho khách hàng mới",
          "role": "Prepositional phrase",
          "simple_role_vi": "Cụm giới từ - nói rõ dành cho ai"
        }
      ],
      "patterns": [
        {
          "pattern": "S + am/is/are + V-ing + Object",
          "meaning_vi": "Ai đó đang làm gì",
          "example": "They are selling coffee.",
          "example_translation": "Họ đang bán cà phê."
        }
      ],
      "related_grammar_ids": ["g1"],
      "related_vocabulary_ids": ["v1", "v2", "v3"]
    }
  ],
  "grammar_points": [
    {
      "id": "g1",
      "name": "Present Continuous",
      "vietnamese_name": "Thì hiện tại tiếp diễn",
      "pattern": "S + am/is/are + V-ing",
      "found_in": "We are offering...",
      "explanation_vi": "Cấu trúc này dùng để nói ai đó đang làm gì hoặc một việc đang diễn ra trong hiện tại.",
      "beginner_tip": "Khi thấy am/is/are đi với động từ thêm -ing, thường đó là dấu hiệu của thì hiện tại tiếp diễn.",
      "examples": [
        {
          "en": "I am learning English.",
          "vi": "Tôi đang học tiếng Anh."
        },
        {
          "en": "They are opening a new store.",
          "vi": "Họ đang mở một cửa hàng mới."
        }
      ]
    }
  ],
  "vocabulary": [
    {
      "id": "v1",
      "word": "offer",
      "phrase_from_text": "are offering",
      "word_type": "verb",
      "meaning_vi": "cung cấp, đề nghị",
      "pronunciation_guide_vi": "ó-fờ",
      "ipa": "/ˈɔːfər/",
      "cefr_level": "A2",
      "why_important": "Từ này thường gặp trong quảng cáo, email, cửa hàng và dịch vụ.",
      "source_sentence": "We are offering a special discount for new customers.",
      "example": "We offer free tea.",
      "example_translation": "Chúng tôi cung cấp trà miễn phí."
    }
  ],
  "pronunciation": {
    "sentence_audio_texts": [
      "We are offering a special discount for new customers."
    ],
    "focus_words": [
      {
        "word": "discount",
        "pronunciation_guide_vi": "đis-kaunt",
        "tip_vi": "Nhấn âm đầu: DIS-count."
      }
    ]
  },
  "practice": [
    {
      "id": "p1",
      "type": "multiple_choice",
      "question": "\"discount\" nghĩa là gì?",
      "options": ["khách hàng", "giảm giá", "cửa hàng"],
      "answer": "giảm giá",
      "explanation_vi": "Discount nghĩa là giảm giá."
    }
  ],
  "warnings": []
}
```

---

## 6. Required Fields

| Field | Required | Note |
|---|---|---|
| title | Yes | May be auto-generated |
| detected_language | Yes | Phase 0 expected English |
| level | Yes | Default Beginner |
| original_text | Yes | Text after user confirm/edit |
| vietnamese_translation | Yes | Full translation |
| sentences | Yes | May be empty if input cannot be split, but should not be |
| grammar_points | Yes | May be empty array |
| vocabulary | Yes | May be empty array |
| pronunciation | Should | May be empty object |
| practice | Nice | May be empty array |
| warnings | Yes | Empty array if no warnings |

---

## 7. Prompt Template for AI

```text
You are an English teacher for Vietnamese beginners.

Phân tích đoạn tiếng Anh sau và chỉ trả về JSON hợp lệ.
Không thêm markdown, comment hoặc text ngoài JSON.

Trình độ user: người mới học / người Việt bản ngữ.

Tasks:
1. Translate the full text into natural Vietnamese.
2. Split the text into sentences.
3. For each sentence:
   - Provide Vietnamese translation.
   - Explain the simple meaning.
   - Break the sentence into meaningful chunks.
   - Identify simple roles such as Subject, Verb phrase, Object, Time, Place.
   - Provide useful sentence patterns if available.
4. Identify 1 to 3 important grammar points from the text.
5. Explain grammar in simple Vietnamese.
6. Extract important or uncommon vocabulary/phrases.
7. For each vocabulary item, provide:
   - Vietnamese meaning
   - word type
   - pronunciation guide for Vietnamese learners
   - IPA if possible
   - CEFR level if possible
   - example sentence
8. Provide pronunciation focus words when useful.
9. Optionally create 0-3 simple practice questions. Practice is Nice for Phase 0 and may be an empty array.

Rules:
- Keep explanations beginner-friendly.
- Không làm người học bị ngợp.
- Không tự bịa thông tin ngoài input.
- Vocabulary must come from the input text.
- Điểm ngữ pháp phải xuất hiện trong input text.
- Output phải khớp JSON schema đã thống nhất.

Text:
{{input_text}}
```

---

## 8. Validation Rules

Backend/app should validate:

- Output is valid JSON.
- `detected_language` exists.
- `level` exists.
- `original_text` exists.
- `vietnamese_translation` exists.
- `sentences` is an array.
- `vocabulary` is an array.
- `grammar_points` is an array.
- `warnings` is an array.
- Each sentence has `original` and `translation`.
- Each vocabulary item has `word` and `meaning_vi`.

---

## 9. AI Fallback Strategy

| Failure | Fallback |
|---|---|
| Invalid JSON | Retry with stricter prompt |
| Missing vocabulary | Render empty vocabulary state |
| Missing grammar | Render empty grammar state |
| AI timeout | Show retry, keep input |
| Translation poor | Allow regenerate in later phase |
| Too much content | Ask AI to simplify/shorten |

---

## 10. AI Output Quality Checklist

Before showing output, check:

- Is Vietnamese natural?
- Is explanation beginner-friendly?
- Are grammar points actually present in input?
- Are vocabulary items from input?
- Is output too long?
- Is any field missing?
- Does UI have safe fallback for empty arrays?

## Source: `docs/ba/technical/data-model.md`

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

## Source: `docs/ba/requirements/user-stories-acceptance.md`

# User Stories & Acceptance Criteria

## 1. Epic: English content input

### US-001 — Take photo

As a beginner English learner, I want to take a photo of English text so that I can learn from real-world content.

#### Acceptance criteria

```gherkin
Given I am on the Home or Scan screen
When I tap "Chụp ảnh"
Then the app opens the camera

Given I have taken a photo
When I confirm the photo
Then the app shows the image preview or starts OCR

Given camera permission is denied
When I tap "Chụp ảnh"
Then the app shows a clear permission message
And provides a way to open settings or choose another input method
```

---

### US-002 — Upload image

As a learner, I want to upload an image from my gallery so that I can analyze screenshots, flyers, or saved images.

#### Acceptance criteria

```gherkin
Given I am on the input screen
When I tap "Upload ảnh"
Then the app opens the image picker

Given I select a valid image
When selection is completed
Then the app displays the selected image preview

Given I select an unsupported file
Then the app shows an error message
```

---

### US-003 — Paste text

As a learner, I want to paste English text manually so that I can analyze text without an image.

#### Acceptance criteria

```gherkin
Given I am on the input screen
When I choose "Paste text"
Then the app shows a text input area

Given I paste valid text
When I tap "Analyze"
Then the app sends the text for AI analysis

Given the text area is empty
When I tap "Analyze"
Then the app prevents submission and shows validation message
```

---

## 2. Epic: OCR and text review

### US-004 — Extract text from image

As a learner, I want the app to extract text from my image so that I do not need to type manually.

#### Acceptance criteria

```gherkin
Given I selected an image with clear English text
When OCR processing completes
Then the app displays extracted text

Given the image has no readable text
When OCR processing completes
Then the app shows a "no text detected" message
And allows me to retry or paste text manually
```

---

### US-005 — Edit OCR text

As a learner, I want to edit extracted text before analysis so that OCR mistakes do not affect my lesson.

#### Acceptance criteria

```gherkin
Given OCR has extracted text
When I edit the text
Then the updated text is saved in the review screen

Given I tap "Analyze"
When the app sends data to AI
Then the app uses my edited text, not the raw OCR text
```

---

## 3. Epic: AI lesson results

### US-006 — View Vietnamese translation

As a beginner, I want to see the Vietnamese translation so that I can understand the meaning quickly.

#### Acceptance criteria

```gherkin
Given AI analysis is successful
When the result screen opens
Then I see the original text
And I see the Vietnamese translation

Given the input contains multiple sentences
Then each sentence also has its own Vietnamese translation
```

---

### US-007 — Learn sentence breakdown

As a learner, I want to see how each sentence is broken down so that I understand sentence structure.

#### Acceptance criteria

```gherkin
Given AI analysis is successful
When I open "Học từng câu"
Then I see each sentence separately
And each sentence includes translation and breakdown

Given a sentence has meaningful parts
Then each part shows English text and Vietnamese meaning
```

---

### US-008 — Learn grammar points

As a learner, I want the app to show grammar points from the text so that I understand why the sentence is written that way.

#### Acceptance criteria

```gherkin
Given the input contains a clear grammar pattern
When I open the Grammar section
Then I see grammar name, Vietnamese explanation, pattern, and examples

Given the input has no important grammar point
Then the app shows a friendly empty state instead of an error
```

---

### US-009 — Learn vocabulary

As a learner, I want to see important vocabulary so that I know which words to remember.

#### Acceptance criteria

```gherkin
Given AI analysis is successful
When I open Vocabulary section
Then I see important words or phrases from the input text
And each item has Vietnamese meaning

Given a vocabulary item has pronunciation data
Then the app shows pronunciation guide or play button
```

---

### US-010 — Listen to pronunciation

As a learner, I want to hear words and sentences so that I can learn how they sound.

#### Acceptance criteria

```gherkin
Given audio is available
When I tap the play button for a sentence
Then the app plays the sentence audio

Given audio is not available
Then the app still shows a pronunciation guide when possible
```

---

## 4. Epic: Save and review lessons

### US-011 — Save lesson

As a learner, I want to save a lesson so that I can review it later.

#### Acceptance criteria

```gherkin
Given I am on the result screen
When I tap "Lưu bài học"
Then the lesson is saved
And the button state changes to saved

Given the lesson is already saved
When I tap the saved button again
Then the app should not create a duplicate lesson
```

---

### US-012 — View saved lessons

As a learner, I want to see my saved lessons so that I can continue learning.

#### Acceptance criteria

```gherkin
Given I have saved lessons
When I open the Lessons tab
Then I see a list of saved lessons

Given I tap a lesson
Then the app opens the lesson detail
And no new AI analysis is required

Given I have no saved lessons
Then I see an empty state with a CTA to scan text
```

---

## 5. Epic: Practice

### US-013 — Complete short practice

As a learner, I want to answer quick questions so that I can remember what I learned.

#### Acceptance criteria

```gherkin
Given a lesson has practice questions
When I open Quick Practice
Then I see questions based on the lesson

Given I select an answer
Then the app shows whether it is correct
And shows the correct answer or explanation
```

---

## 6. Epic: Error recovery

### US-014 — Retry AI analysis

As a user, I want to retry when AI analysis fails so that I do not need to start over.

#### Acceptance criteria

```gherkin
Given AI analysis fails
When the error message is displayed
Then I can tap Retry
And my confirmed input text is preserved
```

---

### US-015 — Handle network errors

As a user, I want a clear message when the network fails so that I know what to do.

#### Acceptance criteria

```gherkin
Given there is no internet connection
When I try to analyze text
Then the app shows a network error message
And allows me to retry after reconnecting
```

## Source: `docs/ba/requirements/non-functional-requirements.md`

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

## Source: `docs/ba/qa/qa-test-plan.md`

# QA Test Plan

## 1. Test objectives

Ensure Phase 0 runs stably for the core flow:

```text
Input image/text → OCR/edit → AI analysis → result display → save lesson → review lesson
```

---

## 2. Test scope

### In scope

- Camera/photo upload.
- Paste text.
- OCR success/fail.
- Edit OCR text.
- AI analysis response handling.
- Result UI rendering.
- Grammar/vocabulary/sentence display.
- Pronunciation basic behavior.
- Save lesson and lesson history.
- Error states.
- Basic validation tracking events.

### Out of scope

- Payment.
- User subscription.
- Advanced speaking score.
- Community.
- Full offline mode.

---

## 3. Test types

| Test type | Purpose |
|---|---|
| Functional test | Verify features work as expected |
| UI test | Verify layout and states |
| Integration test | Verify OCR/AI/TTS/backend integration |
| Regression test | Ensure existing flow not broken |
| Error handling test | Verify retry and failure states |
| Performance test | Check OCR/AI waiting time |
| Privacy test | Check sensitive data handling basics |

---

## 4. Functional test cases

### TC-001: Take photo successfully

| Item | Detail |
|---|---|
| Preconditions | Camera permission granted |
| Steps | Open app → Tap "Chụp ảnh" → Take photo → Confirm |
| Expected result | Image preview is shown or OCR starts |
| Priority | P0 |

---

### TC-002: Camera permission denied

| Item | Detail |
|---|---|
| Preconditions | Camera permission denied |
| Steps | Tap "Chụp ảnh" |
| Expected result | App shows permission message and alternative input options |
| Priority | P0 |

---

### TC-003: Upload image successfully

| Item | Detail |
|---|---|
| Preconditions | Photo permission granted |
| Steps | Tap "Upload ảnh" → Select image |
| Expected result | Selected image preview is shown |
| Priority | P0 |

---

### TC-004: OCR succeeds with clear text image

| Item | Detail |
|---|---|
| Test data | Clear flyer image with English sentences |
| Steps | Upload image → Run OCR |
| Expected result | Extracted text appears in editable text area |
| Priority | P0 |

---

### TC-005: OCR fails with image containing no text

| Item | Detail |
|---|---|
| Test data | Image with no text |
| Steps | Upload image → Run OCR |
| Expected result | App shows no text detected message and retry/manual input options |
| Priority | P0 |

---

### TC-006: Edit OCR text before analysis

| Item | Detail |
|---|---|
| Steps | OCR image → Edit extracted text → Tap "Phân tích" |
| Expected result | AI receives edited text, not raw OCR text |
| Priority | P0 |

---

### TC-007: Paste text and analyze

| Item | Detail |
|---|---|
| Steps | Select "Dán text" → Enter English text → Tap "Phân tích" |
| Expected result | App creates learning result |
| Priority | P0 |

---

### TC-008: Validation when text is empty

| Item | Detail |
|---|---|
| Steps | Open paste text → Leave empty → Tap "Phân tích" |
| Expected result | App prevents submission and shows validation message |
| Priority | P0 |

---

### TC-009: Render AI result

| Item | Detail |
|---|---|
| Steps | Analyze valid English text |
| Expected result | Result screen shows original text, Vietnamese translation, sentence analysis, vocabulary, grammar |
| Priority | P0 |

---

### TC-010: Handle invalid AI JSON

| Item | Detail |
|---|---|
| Setup | Mock AI returns invalid JSON |
| Steps | Analyze text |
| Expected result | App/backend retries or shows friendly error without crash |
| Priority | P0 |

---

### TC-011: Save lesson

| Item | Detail |
|---|---|
| Steps | Open result → Tap "Lưu bài học" |
| Expected result | Lesson is saved and saved state is shown |
| Priority | P1 |

---

### TC-012: Open saved lesson

| Item | Detail |
|---|---|
| Preconditions | At least one saved lesson exists |
| Steps | Open Lessons → Tap lesson |
| Expected result | Lesson detail opens without new AI analysis |
| Priority | P1 |

---

### TC-013: Prevent duplicate save

| Item | Detail |
|---|---|
| Steps | Tap "Lưu bài học" multiple times in a row |
| Expected result | Only one lesson is created |
| Priority | P1 |

---

### TC-014: Play pronunciation audio

| Item | Detail |
|---|---|
| Preconditions | TTS/audio available |
| Steps | Tap play on sentence or word |
| Expected result | Audio plays successfully |
| Priority | P1 |

---

### TC-015: Answer practice question

| Item | Detail |
|---|---|
| Steps | Open Quick Practice → Select answer |
| Expected result | App shows correct/incorrect and explanation |
| Priority | P2 |

---

### TC-016: Replace selected image (FR-IN-005)

| Item | Detail |
|---|---|
| Preconditions | An image has been selected or captured |
| Steps | On preview screen → Tap "Đổi ảnh" → Select another image |
| Expected result | New image replaces old one; OCR/analyze uses new image, not old image |
| Priority | P0 |

---

### TC-017: OCR loading state (FR-OCR-002)

| Item | Detail |
|---|---|
| Steps | Select image → Trigger OCR |
| Expected result | Loading shown while OCR runs; cannot submit/OCR again while running; loading disappears on success/error |
| Priority | P0 |

---

### TC-018: Common image formats (FR-OCR-007)

| Item | Detail |
|---|---|
| Test data | Valid jpg, png, heic images; one non-image file or unsupported format |
| Steps | Upload each file in turn |
| Expected result | jpg/png/heic: OCR runs normally. Unsupported file: clear error, no crash |
| Priority | P0 |

---

### TC-019: AI timeout preserves input (FR-AI-006)

| Item | Detail |
|---|---|
| Setup | Mock AI returns timeout (or exceeds time threshold) |
| Steps | Enter/confirm text → Analyze → Wait for timeout |
| Expected result | App shows error + Retry button; `confirmed_text` remains intact, user does not need to re-enter; Retry calls again with same text |
| Priority | P0 |

---

### TC-020: Grammar point limit (FR-GR-005)

| Item | Detail |
|---|---|
| Test data | Input with many sentences containing >3 grammar structures |
| Steps | Analyze → Open Grammar section |
| Expected result | UI shows at most 3 grammar points (per `02-technical/01-technical-implementation-spec.md §14`), not overwhelming |
| Priority | P0 |

---

### TC-021: Vocabulary limit (FR-VOC-007)

| Item | Detail |
|---|---|
| Test data | Long input with many important vocabulary items (>5) |
| Steps | Analyze → Open Vocabulary section |
| Expected result | UI shows ≤5 items by default, with "xem thêm" to expand (per `02-technical/01-technical-implementation-spec.md §14`) |
| Priority | P0 |

---

### TC-022: Default level Beginner (FR-SET-001)

| Item | Detail |
|---|---|
| Preconditions | Fresh install / settings never changed |
| Steps | Open Profile/Settings |
| Expected result | Learning level defaults to Beginner; AI request sends `level: "Beginner"` |
| Priority | P1 |

---

### TC-023: Funnel events (FR-OPS-003)

| Item | Detail |
|---|---|
| Setup | Enable analytics capture (debug/mock sink) |
| Steps | Complete core flow: input → analyze → result → save |
| Expected result | Funnel events fire with correct names + minimal payload (per `08-operations/01-analytics-kpi-events.md` and `02-technical/01-technical-implementation-spec.md §13`); NO raw text/image/AI output in payload (FR-OPS-002) |
| Priority | P1 |

---

## 5. Edge cases

| Case | Expected behavior |
|---|---|
| Image is blurry | Show OCR low quality/no text message |
| Text contains mixed English/Vietnamese | Analyze English parts or warn user |
| Text is too long | Show length warning |
| Text has bullet points | Preserve structure as much as possible |
| Text has all caps | OCR/AI still works |
| AI returns empty vocabulary | Show friendly empty state |
| AI returns no grammar | Show friendly empty state |
| User exits during loading | Preserve draft if possible |
| Network lost during AI call | Show retry and keep text |
| App restarted after saved lesson | Lesson still exists |

---

## 6. Suggested test data

### Simple flyer

```text
We are offering a special discount for new customers.
Please visit our store before Friday.
```

### Menu

```text
Today's special: grilled chicken with rice.
Free drink for orders over $20.
```

### Sign

```text
Please keep the door closed.
Staff only.
```

### Email

```text
Your appointment has been confirmed.
Please arrive 10 minutes early.
```

### Short article excerpt

```text
Many people are learning English online because it is flexible and affordable.
```

---

## 7. QA exit criteria

Phase 0 test can pass if:

- All P0 test cases pass.
- No critical crash in core flow.
- AI invalid response does not crash app.
- Save/open lesson works.
- OCR fail has recovery path.
- Result UI displays all required sections correctly.

---

## 8. Integration test cases — AI/OCR

These tests verify core integration described in `02-technical/04-ai-ocr-integration.md`. Run from M2/M3 onward with mock provider first, then re-run with real provider before closed beta.

### INT-OCR-001: Upload clear-text image via multipart

| Item | Detail |
|---|---|
| Setup | Backend `/v1/ocr` running with mock or real OCR provider |
| Test data | Clear-text image, size <= 5 MB |
| Steps | Mobile/API test sends image via `multipart/form-data` |
| Expected result | Response `status=success`, has `extracted_text`, `quality.text_length_bucket`, original image not stored |
| Priority | P0 |

---

### INT-OCR-002: Upload image with no text

| Item | Detail |
|---|---|
| Test data | Image with no text |
| Steps | Send image to `/v1/ocr` |
| Expected result | Error response `OCR_NO_TEXT`; mobile shows retry or paste text fallback |
| Priority | P0 |

---

### INT-OCR-003: Reject oversized image

| Item | Detail |
|---|---|
| Test data | Image exceeding `MAX_IMAGE_BYTES` |
| Steps | Send image to `/v1/ocr` |
| Expected result | Error response `IMAGE_TOO_LARGE`; backend does not call OCR provider |
| Priority | P0 |

---

### INT-OCR-004: OCR low confidence warning

| Item | Detail |
|---|---|
| Setup | Mock OCR returns low confidence or real provider returns low confidence |
| Steps | Send blurry/low-contrast image |
| Expected result | Response includes warning; OCR review screen shows suggestion to capture more clearly but still allows user to edit text |
| Priority | P1 |

---

### INT-AI-001: Valid confirmed text

| Item | Detail |
|---|---|
| Setup | Backend `/v1/ai/analyze` running with mock or real AI provider |
| Steps | Send English `confirmed_text` <= 3,000 characters |
| Expected result | Response `status=success`, `schema_version=ai-output-v1`, data passes `AIOutputSchema` |
| Priority | P0 |

---

### INT-AI-002: Provider returns invalid JSON

| Item | Detail |
|---|---|
| Setup | Mock AI returns invalid JSON on first attempt |
| Steps | Send analyze request |
| Expected result | Backend retries exactly once with repair/strict prompt; request does not crash |
| Priority | P0 |

---

### INT-AI-003: Invalid after retry

| Item | Detail |
|---|---|
| Setup | Mock AI returns invalid output on both attempts |
| Steps | Send analyze request |
| Expected result | Error response `AI_INVALID_OUTPUT`; mobile shows friendly error + retry, preserves `confirmed_text` |
| Priority | P0 |

---

### INT-AI-004: AI timeout

| Item | Detail |
|---|---|
| Setup | Mock AI timeout or delay exceeds threshold |
| Steps | Send analyze request |
| Expected result | Response/UX timeout error; input not lost; retry uses same `confirmed_text` |
| Priority | P0 |

---

### INT-E2E-001: OCR edited text → AI

| Item | Detail |
|---|---|
| Steps | OCR image → Edit text in review → Confirm → Analyze |
| Expected result | AI request uses edited text, not `ocr_raw_text`; analytics does not contain raw text |
| Priority | P0 |

---

### INT-E2E-002: Saved lesson reopen

| Item | Detail |
|---|---|
| Preconditions | Saved lesson from valid AI output exists |
| Steps | Close/open app → Open lesson detail |
| Expected result | Lesson renders from local `ai_output_json`; does not call `/v1/ai/analyze` again |
| Priority | P0 |

## Source: `docs/ba/operations/analytics-kpi-events.md`

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

## Source: `docs/ba/product/roadmap-release-plan.md`

# Roadmap & Release Plan

## 1. Product Roadmap Overview

```text
Phase 0: MVP Scan & Learn
Phase 1: Review & Retention
Phase 2: Speaking Practice & Personal Tutor
Phase 3: Content Expansion & Monetization
```

---

## 2. Phase 0 — MVP Scan & Learn

### Goal

Prove core value: user scans English text and receives an easy-to-understand lesson in Vietnamese.

### Main Features

- Camera/gallery/paste text input.
- OCR.
- OCR review/edit.
- AI translation.
- Sentence breakdown.
- Grammar points.
- Vocabulary extraction.
- Basic pronunciation support.
- Save lesson.
- Lesson history.
- Basic analytics.

### Phase Exit Criteria

- Core flow complete.
- AI output stable per schema.
- User testing finds it easy to understand.
- Basic tracking works.

---

## 3. Phase 1 — Review & Retention

### Goal

Increase user return and retention.

### Features

- Vocabulary flashcards.
- Save vocabulary separately.
- Basic spaced repetition.
- Daily review.
- Streak.
- Quiz history.
- Favorite lessons.
- Search lessons/vocabulary.
- Level setting.

### Success Metrics

- Lesson reopen rate increases.
- Vocabulary review rate increases.
- D7 retention improves.

---

## 4. Phase 2 — Speaking Practice & Personal Tutor

### Goal

Help users practice speaking from sentences in the lesson.

### Features

- Listen and repeat.
- Record voice.
- Basic pronunciation feedback.
- Sentence shadowing.
- AI tutor Q&A based on lesson.
- Generate more examples.
- Explain again simpler.
- Roleplay mini conversation based on scanned content.

### Success Metrics

- Audio play rate.
- Speaking practice completion rate.
- Repeat session rate.

---

## 5. Phase 3 — Content Expansion & Monetization

### Goal

Expand input/content sources and build revenue model.

### Features

- PDF scan/import.
- Website/article import.
- Browser/share extension.
- Multi-page document analysis.
- Premium analysis.
- Personalized learning path.
- Subscription.
- Offline saved lessons.
- Advanced grammar course generated from user scans.

### Success Metrics

- Conversion to paid.
- Average lessons per user.
- Long-term retention.
- Cost per AI analysis.

---

## 6. Proposed MVP Release Milestones

### Milestone 1: Prototype

Scope:

- Paste text input.
- AI output mock or real API.
- Result screen.

Goal:

- Validate learning output UX before handling OCR complexity.

---

### Milestone 2: OCR MVP

Scope:

- Image upload.
- OCR.
- Edit extracted text.
- Send text to AI.

Goal:

- Complete scan → analysis flow.

---

### Milestone 3: Save Lesson

Scope:

- Save lesson.
- Lesson history.
- Open lesson detail.

Goal:

- Validate retention loop.

---

### Milestone 4: Polish Beta

Scope:

- Error states.
- Loading states.
- Analytics.
- AI schema validation.
- QA test pass.

Goal:

- Internal/TestFlight beta ready.

---

## 7. Release Checklist

Before releasing Phase 0 beta:

- [ ] Core flow works on real devices.
- [ ] Camera permission handled.
- [ ] Gallery permission handled.
- [ ] OCR works with clear images.
- [ ] User can edit OCR text.
- [ ] AI output schema validation works.
- [ ] Result UI handles empty vocabulary/grammar/practice.
- [ ] Save lesson works.
- [ ] Lesson history works.
- [ ] Network/OCR/AI errors have retry.
- [ ] Basic analytics events are tracked.
- [ ] Privacy note is available.
- [ ] QA P0 test cases pass.

---

## 8. Prioritization Framework

Use this order when cutting scope:

1. Paste text + AI result.
2. Image upload + OCR.
3. OCR edit.
4. Sentence/vocabulary/grammar result UI.
5. Save lesson.
6. Pronunciation.
7. Practice.
8. Advanced retention/gamification.

Do not build gamification before learning output is genuinely useful.

## Source: `docs/ba/operations/risks-assumptions-dependencies.md`

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
| Q-001 | Is login required in Phase 0? | Login not required | `19` section 2 |
| Q-002 | Save lessons locally or in cloud? | Local-first on device | `19` section 2, section 9 |
| Q-003 | Store original images? | Do not store original images by default | `19` section 2, section 12 |
| Q-004 | On-device or cloud OCR? | OCR via backend proxy to OCR provider | `19` section 2, section 7 |
| Q-005 | TTS in Phase 0? | Cloud TTS not required; use native TTS or pronunciation guide | `19` section 2 |
| Q-006 | Text length limit? | 3,000 characters | `19` section 11 |
| Q-007 | Allow user to regenerate AI result? | Off by default in Phase 0 | `20` section 10 |
| Q-008 | Report AI mistakes? | Minimum feedback/support channel required | `20` section 17 |

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

## Source: `docs/ba/technical/ai-agent-implementation-guide.md`

# AI Agent Implementation Guide

## 1. Purpose

This document is for AI coding agents or developers using AI to implement the app correctly.

Agent should read documents in this minimum order:

1. `README.md`
2. `04-product/04-phase0-prd.md`
3. `03-requirements/01-functional-requirements.md`
4. `03-requirements/02-business-rules.md`
5. `05-qa/01-qa-test-plan.md`
6. `02-technical/01-technical-implementation-spec.md`
7. `02-technical/02-implementation-plan-m1-m5.md`
8. `03-requirements/05-traceability-matrix.md`
9. `01-schema/01-ai-output-v1.ts`

Open additionally only when needed:

- `02-technical/03-ai-output-requirements.md` when prompt/output quality detail is needed.
- `02-technical/05-data-model.md` when entity/persistence detail beyond `02-technical/01-technical-implementation-spec.md §9` is needed.
- `03-requirements/03-user-stories-acceptance.md` when acceptance wording is needed.
- `07-release/01-release-production-readiness.md`, `07-release/02-privacy-policy-draft.md`, `07-release/03-store-listing-design-assets.md` before beta/store release.
- `02-technical/04-ai-ocr-integration.md` when implementing real OCR/AI providers in M2/M3.
- `06-design/03-theme-system.md` when doing UI foundation/polish; does not block Phase 0 core loop.

---

## 2. Implementation Principles

Do not build the app as a simple translation app. Build according to the core loop:

```text
Scan/Input → Confirm Text → Generate Lesson → Learn → Save → Review
```

---

## 3. Recommended Module Structure

```text
src/
  modules/
    input/
      CameraInput
      GalleryInput
      PasteTextInput
    ocr/
      OCRService
      OCRReviewScreen
    ai-analysis/
      AIAnalysisService
      AIOutputValidator
      PromptBuilder
    lesson/
      LessonResultScreen
      LessonDetailScreen
      LessonRepository
    vocabulary/
      VocabularySection
      VocabularyCard
    grammar/
      GrammarSection
      GrammarCard
    pronunciation/
      PronunciationService
      AudioPlayButton
    practice/
      PracticeSection
      PracticeQuestionCard
    analytics/
      AnalyticsService
    shared/
      components
      types
      utils
```

---

## 4. Recommended Development Order

### Step 1: Types & schema

Create types for:

- Lesson
- SentenceAnalysis
- VocabularyItem
- GrammarPoint
- PracticeQuestion
- AIOutput

Do this before UI.

### Step 2: Paste Text Prototype

Build:

- PasteTextScreen
- Analyze button
- Mock AI output
- Result screen

Purpose:

- Validate output rendering without OCR complexity yet.

### Step 3: AI Integration

Build:

- PromptBuilder
- AIAnalysisService
- AIOutputValidator
- Error handling

### Step 4: OCR Integration

Build:

- Image input
- OCR service
- OCR review/edit screen

### Step 5: Save Lesson

Build:

- Lesson repository
- Save button
- Lesson list
- Lesson detail

### Step 6: Pronunciation & Practice

Build:

- TTS/play audio
- Practice section

### Step 7: QA & Polish

Build:

- Empty states
- Loading states
- Error states
- Analytics events
- Regression tests

---

## 5. Validate AI Output

Do not write manual validators in app or backend.

The only source of truth for AI output schema is:

```text
docs/01-ba/01-schema/01-ai-output-v1.ts
```

Use directly:

```ts
import { AIOutputSchema, validateAIOutput, type AIOutput } from "./01-ai-output-v1";

const result = validateAIOutput(raw);
if (!result.valid) {
  // Backend: retry at most once then return AI_INVALID_OUTPUT.
  // Mobile: do not render/save, show friendly error.
}
```

Do not re-describe AI output fields in docs or separate code without importing from this schema.

---

## 6. Important Rules for Agent

### Do

- Keep UI beginner-friendly.
- Use Vietnamese labels and explanations.
- Render empty states instead of crashing.
- Keep OCR text editable.
- Store confirmed text as source of truth.
- Validate AI output with `validateAIOutput()`.
- Save full AI output for saved lessons.
- Track core funnel events.

### Do not

- Send OCR text to AI if user has not confirmed.
- Hardcode assumptions about AI response without validation.
- Display too many grammar points by default.
- Log full user text to analytics.
- Call AI again every time a saved lesson is opened.
- Build payment/gamification before core learning flow works.

---

## 7. UI Render Rules

Result screen should render sections in this order:

```text
1. Title
2. Original text
3. Vietnamese translation
4. Sentence analysis
5. Vocabulary
6. Grammar
7. Pronunciation
8. Practice
9. Save lesson
```

If section is empty:

- Vocabulary empty → show friendly message.
- Grammar empty → show friendly message.
- Practice empty → hide section or show “Coming soon”.

---

## 8. Definition of Done for Agent

A task is done only when:

- Requirement is implemented.
- Loading state exists.
- Error state exists.
- Empty state exists if applicable.
- Basic tests/manual test steps pass.
- No requirement is silently skipped.
- Code follows project structure.
- UI text is in Vietnamese for user-facing labels.

---

## 9. Recommended Prompt for AI Coding Agent

```text
You are implementing Phase 0 of Scan & Learn English.
Read the BA documentation first.
Focus only on Phase 0 MVP.

Core flow:
Input image/text → OCR/edit → AI structured analysis → result screen → save lesson.

Rules:
- Beginner Vietnamese learner first.
- OCR text must be editable before AI analysis.
- AI output must be validated before render.
- Saved lessons must open without re-calling AI.
- Implement loading, error, and empty states.
- Do not add out-of-scope features unless requested.

Start by importing/copying the canonical AI schema from `docs/01-ba/01-schema/01-ai-output-v1.ts`, then create mock AI output wiring and result screen.
Use `02-technical/01-technical-implementation-spec.md` for stack, API, persistence, env, and milestone decisions.
Use `07-release/01-release-production-readiness.md` before preparing beta/public release.
Use `02-technical/02-implementation-plan-m1-m5.md` to execute implementation in milestone order.
```

---

## 10. Recommended Prompt for QA Agent

```text
Act as senior QA for Scan & Learn English Phase 0.
Use the BA documentation and test plan.
Create test cases for:
- image input
- OCR success/fail
- edit OCR text
- paste text
- AI output rendering
- invalid AI output
- save lesson
- lesson history
- network failure
- empty states

Return test cases as a table with:
ID, title, precondition, steps, expected result, priority.
```

## Source: `docs/ba/design/ui-wireframes.md`

# Screen Wireframe Template

## 1. Purpose

This file provides low-fidelity text wireframes for the main Phase 0 screens. The goal is to help Designers and Developers visualize layout, components, and states before building the real UI.

Principles:

- Wireframes follow the flow and components in `06-design/01-user-flow-screen-spec.md`.
- Displayed fields map 1-1 to the schema in `02-technical/03-ai-output-requirements.md` and `02-technical/05-data-model.md` (annotated on the right).
- A single example is used throughout so screens stay consistent:

```text
We are offering a special discount for new customers.
Please visit our store before Friday.
```

- These are wireframes, not pixel specs. Vietnamese copy follows `06`; field/enum names stay in English.

---

## 2. Home

```text
┌─────────────────────────────┐
│ Scan & Learn        ⚙️       │
│                             │
│ Hôm nay bạn muốn học        │
│ từ đâu?                     │
│                             │
│ ┌─────────────────────────┐ │
│ │   📷  Chụp ảnh học ngay  │ │  ← primary CTA
│ └─────────────────────────┘ │
│ ┌───────────┐ ┌───────────┐ │
│ │ 🖼 Upload │ │ ✍️ Dán text│ │
│ └───────────┘ └───────────┘ │
│                             │
│ Bài học gần đây             │
│ ┌─────────────────────────┐ │
│ │ Special Discount Flyer  │ │
│ │ 2 phút trước · 6 từ mới │ │
│ ├─────────────────────────┤ │
│ │ Restaurant Menu         │ │
│ │ Hôm qua · 8 từ mới      │ │
│ └─────────────────────────┘ │
│                             │
│ 💡 Mẹo: chụp rõ chữ để OCR  │
│    chính xác hơn.           │
├─────────────────────────────┤
│  🏠 Home   📚 Lessons  👤   │
└─────────────────────────────┘
```

- 2 taps to scan from Home (NFR-USE-001): primary CTA is on the first screen.
- Empty state (no lessons yet): replace the "Bài học gần đây" block with `Bạn chưa có bài học nào. Hãy chụp một đoạn tiếng Anh để bắt đầu.`

---

## 3. Review & Edit OCR

The most important screen: the result here becomes `confirmed_text` — the source of truth sent to AI.

```text
┌─────────────────────────────┐
│ ←   Kiểm tra text           │
│                             │
│ ┌──────┐  Text app nhận     │
│ │ 🖼   │  diện được          │
│ │thumb │  (có thể sửa)       │
│ └──────┘                    │
│ ┌─────────────────────────┐ │
│ │ We are offering a       │ │
│ │ special discount for    │ │  ← editable text
│ │ new customers. Please   │ │
│ │ visit our store before  │ │
│ │ Friday._                │ │
│ └─────────────────────────┘ │
│ 🌐 Phát hiện: English       │
│ 92 / 3000 ký tự             │
│                             │
│ ⚠️ Text có vẻ không phải    │  ← shown only when suspicious
│    tiếng Anh. Vẫn tiếp tục? │
│                             │
│ ┌──────────┐ ┌────────────┐ │
│ │ ↻ OCR lại │ │ Phân tích →│ │
│ └──────────┘ └────────────┘ │
└─────────────────────────────┘
```

- `Phân tích` button is disabled when text is empty (BR-IN-002, FR-REV-001).
- AI runs only after the user taps `Phân tích` (BR-OCR-002).
- "Not English" warning still allows continue (BR-IN-006).

---

## 4. AI Analysis Loading

```text
┌─────────────────────────────┐
│                             │
│           ◐ ◓ ◑             │
│                             │
│   Đang tạo bài học cho bạn  │
│                             │
│   ✓ Đang dịch sang tiếng Việt
│   ⋯ Đang tìm từ vựng quan   │
│     trọng...                │
│   ○ Đang phân tích ngữ pháp │
│   ○ Đang tạo bài luyện tập  │
│                             │
│        [  Huỷ  ]            │
└─────────────────────────────┘
```

- On timeout → show `App chưa tạo được bài học. Vui lòng thử lại.` with `Thử lại` button, keep `confirmed_text` unchanged (US-014, BR-ERR-001).

---

## 5. Lesson Result Overview

```text
┌─────────────────────────────┐
│ ←  Special Discount Flyer 🔖│  🔖 = Lưu / Đã lưu
│                             │
│ 🌐 English · Beginner       │  ← detected_language · level
│                             │
│ Bản gốc                     │
│ We are offering a special   │  ← original_text
│ discount for new customers… │
│                             │
│ Bản dịch                    │
│ Chúng tôi đang cung cấp một │  ← vietnamese_translation
│ chương trình giảm giá đặc   │
│ biệt cho khách hàng mới…    │
│                             │
│ Khám phá bài học            │
│ ┌─────────────────────────┐ │
│ │ 📝 Học từng câu      (2)│ │  → sentences
│ │ 🔤 Từ vựng quan trọng(6)│ │  → vocabulary
│ │ 📐 Ngữ pháp trong đoạn(1)│ │  → grammar_points
│ │ 🔊 Luyện phát âm        │ │  → pronunciation
│ │ 🎯 Quick Practice    (3)│ │  → practice
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │     🔖  Lưu bài học      │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

- Each "Khám phá" row is an expand/collapse section with a count from array length; opening a section fires `result_section_opened`.

---

## 6. Sentence Detail

```text
┌─────────────────────────────┐
│ ←  Câu 1 / 2          🔊     │
│                             │
│ We are offering a special   │  ← original
│ discount for new customers. │
│                             │
│ Dịch                        │
│ Chúng tôi đang cung cấp một │  ← translation
│ chương trình giảm giá đặc   │
│ biệt cho khách hàng mới.    │
│                             │
│ Tách câu (theo cụm nghĩa)   │  ← breakdown
│ ┌─────────────────────────┐ │
│ │ We          │ Chúng tôi  │ │  text │ meaning
│ │ Chủ ngữ                  │ │  simple_role_vi
│ ├─────────────────────────┤ │
│ │ are offering│ đang cung  │ │
│ │ Động từ (đang diễn ra)   │ │
│ ├─────────────────────────┤ │
│ │ a special   │ một chương │ │
│ │ discount    │ trình g.giá│ │
│ │ Tân ngữ                  │ │
│ └─────────────────────────┘ │
│                             │
│ Mẫu câu                     │  ← patterns
│ S + am/is/are + V-ing + O   │
│                             │
│ Ví dụ tương tự              │
│ • They are making a plan.   │
│                             │
│   ‹ Câu trước   Câu sau ›   │
└─────────────────────────────┘
```

---

## 7. Vocabulary List & Word Card

```text
┌─────────────────────────────┐    ┌─────────────────────────────┐
│ ←  Từ vựng (6)              │    │ ←  offer              🔖 ☆   │
│                             │    │                             │
│ ┌─────────────────────────┐ │    │ offer   (n/v) · A2          │  word · word_type · cefr_level
│ │ offer        n/v   A2 🔊│ │    │ 🔊 /ˈɔːfər/   "ó-phờ"       │  ipa · pronunciation_guide_vi
│ │ đề nghị; ưu đãi          │ │    │                             │
│ ├─────────────────────────┤ │    │ Nghĩa                       │
│ │ discount     n     A2 🔊│ │    │ đề nghị; chương trình ưu đãi│  meaning_vi
│ │ giảm giá, chiết khấu     │ │    │                             │
│ ├─────────────────────────┤ │    │ Vì sao nên học              │
│ │ customer     n     A1 🔊│ │    │ Từ rất hay gặp trong mua    │  why_important
│ │ khách hàng               │ │    │ bán, quảng cáo.             │
│ └─────────────────────────┘ │    │                             │
│   … (tap để mở chi tiết)    │    │ Ví dụ                       │
│                             │    │ We are offering a discount. │  example
│ Đoạn này khá đơn giản —     │    │ Chúng tôi đang có ưu đãi.   │  example_translation
│ hiện chưa có từ khó. (empty)│    └─────────────────────────────┘
└─────────────────────────────┘
```

- Empty state when no difficult words: `Đoạn này khá đơn giản, app chưa tìm thấy từ vựng khó đáng học.`
- ☆/Save word button appears only when the flashcard feature is enabled (`is_saved` field on VocabularyItem).

---

## 8. Grammar Section

```text
┌─────────────────────────────┐
│ ←  Ngữ pháp (1)             │
│                             │
│ ┌─────────────────────────┐ │
│ │ Present Continuous       │ │  name
│ │ Thì hiện tại tiếp diễn   │ │  vietnamese_name
│ │                          │ │
│ │ Công thức                │ │
│ │ S + am/is/are + V-ing    │ │  pattern
│ │                          │ │
│ │ Giải thích               │ │
│ │ Dùng để nói ai đó đang   │ │  explanation_vi
│ │ làm gì ở hiện tại.       │ │
│ │                          │ │
│ │ 💡 Mẹo: thấy "am/is/are +│ │  beginner_tip
│ │ V-ing" là đang xảy ra.   │ │
│ │                          │ │
│ │ Trong đoạn của bạn       │ │
│ │ "We are offering…"       │ │  found_in
│ └─────────────────────────┘ │
│                             │
│ Đoạn này không có cấu trúc  │  ← empty state
│ ngữ pháp nổi bật.           │
└─────────────────────────────┘
```

- Maximum 3 grammar points per lesson (BR-GR-004).

---

## 9. Quick Practice

```text
┌─────────────────────────────┐    ┌─────────────────────────────┐
│ ←  Quick Practice   1 / 3   │    │ ←  Quick Practice   1 / 3   │
│ ▓▓▓▓░░░░░░                  │    │ ▓▓▓▓░░░░░░                  │
│                             │    │                             │
│ "discount" nghĩa là gì?     │    │ "discount" nghĩa là gì?     │  question
│                             │    │                             │
│ ○ khách hàng                │    │ ✗ khách hàng                │
│ ○ giảm giá                  │    │ ✓ giảm giá   ← Đúng!        │  answer
│ ○ cửa hàng                  │    │ ○ cửa hàng                  │
│ ○ thứ Sáu                   │    │ ○ thứ Sáu                   │  options
│                             │    │                             │
│                             │    │ 💬 "discount" = giảm giá,   │  explanation_vi
│                             │    │ chiết khấu.                 │
│ ┌─────────────────────────┐ │    │ ┌─────────────────────────┐ │
│ │       Kiểm tra           │ │    │ │      Câu tiếp theo →     │ │
│ └─────────────────────────┘ │    │ └─────────────────────────┘ │
└─────────────────────────────┘    └─────────────────────────────┘
```

- Left: unanswered state. Right: after selection, show correct/incorrect + explanation (US-013), fire `practice_answered`.

---

## 10. Lesson History

```text
┌─────────────────────────────┐
│ Bài học của tôi      🔍      │
│                             │
│ ┌─────────────────────────┐ │
│ │ Special Discount Flyer  │ │  title
│ │ "We are offering a…"    │ │  preview (confirmed_text)
│ │ 04/06 · 6 từ · 1 ngữpháp│ │  created_at · counts
│ ├─────────────────────────┤ │
│ │ Restaurant Menu         │ │
│ │ "Today's special…"      │ │
│ │ 03/06 · 8 từ · 2 ngữpháp│ │
│ └─────────────────────────┘ │
│                             │
│ (empty)                     │
│ Bạn chưa có bài học nào.    │
│ ┌─────────────────────────┐ │
│ │   📷 Scan đoạn đầu tiên  │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│  🏠 Home   📚 Lessons  👤   │
└─────────────────────────────┘
```

- Opening a saved lesson does not call AI again (BR-LES-004); fires `lesson_reopened`.

---

## 11. Empty & Error States

Consolidated copy for consistent reuse (aligned with `06` section Empty States and Error States):

| Situation | Message |
|---|---|
| No lesson | Bạn chưa có bài học nào. Hãy chụp một đoạn tiếng Anh để bắt đầu. |
| OCR failed | App chưa nhận diện được chữ trong ảnh. Hãy thử ảnh rõ hơn hoặc nhập text thủ công. |
| AI failed | App chưa tạo được bài học. Vui lòng thử lại. |
| No vocabulary | Đoạn này khá đơn giản, app chưa tìm thấy từ vựng khó đáng học. |
| No grammar | Đoạn này không có cấu trúc ngữ pháp nổi bật. |
| Network lost | Mất kết nối mạng. Vui lòng thử lại sau khi có mạng. |

---

## 12. Quick Wireframe → Document Map

| Wireframe | Screen in 06 | Main schema/field |
|---|---|---|
| Home | §3 | recent lessons |
| Review & Edit OCR | §5 | confirmed_text, detected_language |
| AI Analysis Loading | §6 | — |
| Lesson Result Overview | §7 | title, level, original_text, vietnamese_translation, sentences, vocabulary, grammar_points, practice |
| Sentence Detail | §8 | SentenceAnalysis, SentenceBreakdownChunk |
| Vocabulary | §9 | VocabularyItem (cefr_level, ipa, pronunciation_guide_vi) |
| Grammar | §10 | GrammarPoint |
| Quick Practice | — | PracticeQuestion |
| Lesson History | §11 | Lesson (title, created_at) |

## Source: `docs/ba/technical/technical-implementation-spec.md`

# Technical Implementation Spec — Phase 0

## 1. Purpose

This document locks in default technical decisions so developers or AI coding agents can start implementing **Scan & Learn English Phase 0** without re-asking foundational questions.

This document supplements:

- `04-product/04-phase0-prd.md`
- `03-requirements/01-functional-requirements.md`
- `02-technical/03-ai-output-requirements.md`
- `02-technical/05-data-model.md`
- `05-qa/01-qa-test-plan.md`
- `02-technical/06-ai-agent-implementation-guide.md`

If there is a conflict, prioritize in this order:

1. Technical decisions in this file.
2. PRD and Functional Requirements.
3. Business Rules.
4. Wireframes and UX copy.

---

## 2. Phase 0 Default Decisions

| Topic                 | Decision                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------- |
| App target             | Mobile app iOS and Android                                                          |
| Mobile stack           | React Native CLI + TypeScript                                                       |
| Navigation             | React Navigation                                                                    |
| State management       | Local component state first; Zustand only for shared state                          |
| Local storage          | SQLite via `react-native-quick-sqlite`; `react-native-keychain` for tokens/sensitive config if needed |
| Camera/gallery         | `react-native-image-picker` for Phase 0; no custom native camera                    |
| Backend                | Thin Node.js API proxy                                                              |
| API framework          | Fastify                                                                             |
| Auth Phase 0           | Login not required                                                                  |
| User identity          | Anonymous local user id generated on device                                         |
| Lesson storage Phase 0 | Local-first on device                                                               |
| Multi-device sync      | Out of scope for Phase 0                                                            |
| OCR                    | Called via backend proxy to OCR provider                                            |
| AI analysis            | Called via backend proxy to LLM provider with structured output                     |
| TTS                    | Native/device TTS or pronunciation guide; cloud TTS not required in Phase 0       |
| Image retention        | Do not store original images by default                                             |
| Analytics              | Do not log full scanned text or full AI output                                      |
| Feature flags          | Use simple config to toggle OCR, TTS, mock AI, real AI                              |

---

## 3. Architecture Overview

```text
Mobile App
  ├─ Input module
  ├─ OCR review module
  ├─ AI result renderer
  ├─ Lesson repository
  ├─ Analytics adapter
  └─ API client

Backend API Proxy
  ├─ OCR endpoint
  ├─ AI analysis endpoint
  ├─ TTS endpoint optional
  ├─ Provider adapters
  ├─ Schema validation
  └─ Request logging without sensitive content

External Providers
  ├─ OCR provider
  ├─ LLM provider
  └─ TTS provider optional
```

The mobile app is responsible for UI, local persistence, basic validation, and rendering. The backend proxy is responsible for protecting API keys, calling external providers, strict output validation, and normalizing errors.

---

## 4. Phase 0 Technical Scope

### In scope

- Paste text prototype.
- Camera/gallery image input.
- Temporary image upload for OCR.
- OCR text review and editing.
- AI structured lesson generation.
- Validate AI output before returning to mobile or before rendering.
- Render result sections per wireframe.
- Save lesson locally.
- Lesson history and lesson detail.
- Retry OCR/AI.
- Basic analytics events.
- Privacy note and delete local data.

### Out of scope

- Required account/login.
- Cloud lesson sync.
- Subscription/payment.
- Full offline OCR/AI.
- Pronunciation scoring.
- Full admin dashboard.
- Multi-language output beyond Vietnamese.
- Multi-page PDF or long documents.

---

## 5. Recommended Directory Structure

```text
apps/
  mobile/
    ios/
    android/
    src/
      app/
        App.tsx
        navigation/
      modules/
        input/
        ocr/
        ai-analysis/
        lesson/
        vocabulary/
        grammar/
        pronunciation/
        practice/
        analytics/
      shared/
        api/
        components/
        config/
        db/
        errors/
        types/
        utils/

  api/
    src/
      routes/
        health.ts
        ocr.ts
        aiAnalysis.ts
        tts.ts
      providers/
        ocr/
        ai/
        tts/
      schemas/
      services/
      config/
      observability/
```

If not using a monorepo, keep the same module boundaries in one repo:

```text
mobile/
api/
docs/
```

---

## 6. Mobile Module Contract

### `input`

Responsibilities:

- Take photo.
- Pick image from gallery.
- Manual text entry/paste.
- Validate empty input and text that is too long.

Must not:

- Call AI directly.
- Analyze grammar/vocabulary on its own.

### `ocr`

Responsibilities:

- Send image to backend OCR endpoint.
- Show loading/error state.
- Show editable OCR text.
- Record `ocr_raw_text`.
- Create `confirmed_text` only after user taps confirm.

### `ai-analysis`

Responsibilities:

- Send `confirmed_text` to backend AI endpoint.
- Validate response shape on client with schema compatible with backend.
- Render fallback when section is empty.
- Do not render raw invalid response.

### `lesson`

Responsibilities:

- Map AI output to `Lesson`.
- Save and read local lesson.
- Open saved lesson without calling AI again.
- Prevent double-save.

### `analytics`

Responsibilities:

- Track funnel events.
- Do not send full user text, image, or AI output.
- Use anonymous id.

---

## 7. API Contract

Base URL is configured via env:

```text
API_BASE_URL=https://api.example.com
```

### `GET /health`

Response:

```json
{
  "ok": true,
  "service": "scan-learn-api",
  "version": "0.1.0"
}
```

### `POST /v1/ocr`

Request uses `multipart/form-data` to avoid base64 overhead with large images.

```text
POST /v1/ocr
Content-Type: multipart/form-data

fields:
  request_id: uuid
  source_type: camera | gallery
  platform: ios | android
  app_version: 0.1.0
  anonymous_user_id: local-user-id
  image_width: 1280
  image_height: 960
  image: binary file, jpeg/png/heic where supported
```

Base64 JSON upload is only for small prototype/internal tests. Closed beta/public beta must use `multipart/form-data` or equivalent streaming upload.

Response success:

```json
{
  "request_id": "uuid",
  "status": "success",
  "provider": "configured-ocr-provider",
  "ocr_raw_text": "We are offering a special discount...",
  "extracted_text": "We are offering a special discount...",
  "confidence": 0.92,
  "quality": {
    "text_length": 58,
    "text_length_bucket": "1-100",
    "line_count": 1,
    "has_english_signal": true,
    "low_confidence": false
  },
  "warnings": []
}
```

Response no text:

```json
{
  "request_id": "uuid",
  "status": "failed",
  "error": {
    "code": "OCR_NO_TEXT",
    "message": "No readable text was detected."
  },
  "warnings": ["Try a clearer image or paste text manually."]
}
```

Rules:

- Backend does not store original images by default.
- Backend may compress images or reject images that are too large.
- Backend must reject images exceeding `MAX_IMAGE_BYTES`.
- Mobile must let user paste text if OCR fails.
- Mobile displays `extracted_text` in the review editor. `ocr_raw_text` is for debug/internal review only; do not send it directly to AI.
- `quality` is non-sensitive metadata for UI warnings, QA, and analytics buckets; it does not contain raw text.

### `POST /v1/ai/analyze`

Request:

```json
{
  "request_id": "uuid",
  "confirmed_text": "We are offering a special discount for new customers.",
  "level": "Beginner",
  "native_language": "Vietnamese",
  "source_type": "paste_text",
  "prompt_version": "lesson-analysis-v1",
  "client_context": {
    "platform": "android",
    "app_version": "0.1.0",
    "anonymous_user_id": "local-user-id"
  }
}
```

Response success:

```json
{
  "request_id": "uuid",
  "status": "success",
  "model": "configured-llm-model",
  "schema_version": "ai-output-v1",
  "prompt_version": "lesson-analysis-v1",
  "usage": {
    "input_tokens": 350,
    "output_tokens": 1200
  },
  "data": {
    "title": "Special Discount Flyer",
    "detected_language": "English",
    "level": "Beginner",
    "original_text": "We are offering a special discount for new customers.",
    "vietnamese_translation": "Chúng tôi đang cung cấp một chương trình giảm giá đặc biệt cho khách hàng mới.",
    "summary": "Đoạn này nói về một ưu đãi giảm giá cho khách hàng mới.",
    "sentences": [],
    "grammar_points": [],
    "vocabulary": [],
    "pronunciation": {},
    "practice": [],
    "warnings": []
  }
}
```

Response invalid provider output:

```json
{
  "request_id": "uuid",
  "status": "failed",
  "error": {
    "code": "AI_INVALID_OUTPUT",
    "message": "AI response did not match the required schema."
  },
  "retryable": true
}
```

Rules:

- Backend must validate `confirmed_text` length before calling AI.
- Backend must validate AI output schema before returning success.
- Backend retries at most once when provider returns invalid JSON or missing required fields.
- If still invalid, return `AI_INVALID_OUTPUT`.
- Do not log full `confirmed_text` in production logs.
- `schema_version` belongs in the response envelope; `data` is the canonical AI output object and must pass `AIOutputSchema`.

### API response type conventions

Phase 0 routes use a consistent envelope:

```ts
type ApiSuccess<T> = {
  request_id: string;
  status: "success";
} & T;

type ApiError = {
  request_id: string;
  status: "failed";
  error: {
    code: string;
    message: string;
  };
  retryable?: boolean;
  warnings?: string[];
};

type OCRSuccess = ApiSuccess<{
  provider: string;
  ocr_raw_text: string;
  extracted_text: string;
  confidence?: number;
  quality: {
    text_length: number;
    text_length_bucket: "1-100" | "101-500" | "501-1000" | "1001-2000" | "2001-3000" | "3000+";
    line_count: number;
    has_english_signal: boolean;
    low_confidence: boolean;
  };
  warnings: string[];
}>;

type AIAnalyzeSuccess = ApiSuccess<{
  model: string;
  schema_version: "ai-output-v1";
  prompt_version: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  data: AIOutput;
}>;
```

### `POST /v1/tts`

This endpoint is optional in Phase 0. If cloud TTS is not available, mobile uses native TTS or pronunciation guide.

Request:

```json
{
  "request_id": "uuid",
  "text": "discount",
  "voice": "en-US",
  "speed": 0.9
}
```

Response:

```json
{
  "request_id": "uuid",
  "status": "success",
  "audio_url": "https://temporary-signed-url.example/audio.mp3",
  "expires_in_seconds": 3600
}
```

---

## 8. Standard Error Codes

| Code | Layer | Retryable | Mobile behavior |
|---|---|---|---|
| `VALIDATION_EMPTY_TEXT` | Mobile/API | No | Show empty input error |
| `VALIDATION_TEXT_TOO_LONG` | Mobile/API | No | Ask user to shorten text |
| `IMAGE_TOO_LARGE` | API | No | Compress image or choose another |
| `OCR_NO_TEXT` | API/OCR | Yes | Offer retry or paste text |
| `OCR_PROVIDER_ERROR` | OCR | Yes | Offer retry |
| `AI_TIMEOUT` | AI | Yes | Offer retry, keep `confirmed_text` |
| `AI_INVALID_OUTPUT` | AI | Yes | Offer retry or show friendly error |
| `AI_PROVIDER_ERROR` | AI | Yes | Offer retry |
| `NETWORK_ERROR` | Mobile | Yes | Offer retry when network is available |
| `LOCAL_DB_ERROR` | Mobile | Maybe | Show save/open lesson error |

---

## 9. Data Persistence

### Local-first

Phase 0 stores lessons on device.

Minimum SQLite tables:

```text
lessons
  id text primary key
  anonymous_user_id text not null
  lesson_input_hash text not null
  title text not null
  source_type text not null
  ocr_raw_text text
  confirmed_text text not null
  vietnamese_translation text not null
  summary text
  level text not null
  ai_output_json text not null
  is_saved integer not null
  created_at text not null
  updated_at text not null

app_settings
  key text primary key
  value text not null
  updated_at text not null
```

No need to split `SentenceAnalysis`, `VocabularyItem`, `GrammarPoint` into separate tables in Phase 0 if advanced search/filter is not needed yet. Store full `ai_output_json` and derive UI when rendering.

Duplicate-save prevention rule:

- `lesson_input_hash = sha256(normalized confirmed_text + level + prompt_version + schema_version)`.
- `normalized confirmed_text` is trimmed text with light whitespace normalization; do not log raw values.
- When user taps save multiple times or saves the same input/version again, repository must reuse existing lesson or reject duplicate with `saved` state; do not create a new row.

### When to split tables

Split into separate tables in Phase 1 when needed for:

- Vocabulary search.
- Flashcards.
- Spaced repetition review.
- Cross-lesson grammar analytics.
- Cloud sync.

---

## 10. AI Schema Versioning

Schema must have a version:

```text
ai-output-v1
```

In API response, `schema_version` is in the `/v1/ai/analyze` response envelope, not inside `data`. The `data` object must validate directly with `AIOutputSchema`.

Backend and mobile use the same schema logic. Source of truth is `docs/01-ba/01-schema/01-ai-output-v1.ts`; do not redefine fields from descriptive docs. If using TypeScript, prefer:

```text
Zod schema → inferred TypeScript type → runtime validation
```

Required fields per canonical schema:

- `title`
- `detected_language`
- `level`
- `original_text`
- `vietnamese_translation`
- `sentences`
- `grammar_points`
- `vocabulary`
- `warnings`

Recommended fields:

- `summary`
- `pronunciation`
- `practice`

Rules:

- `sentences`, `grammar_points`, `vocabulary`, `practice`, `warnings` are always arrays.
- `pronunciation` is always an object; may be empty.
- `original_text` in AI output must match `confirmed_text` or differ only insignificantly due to whitespace trim.
- `detected_language` in Phase 0 is expected to be `English`.

---

## 11. Feature Flags and Env

Mobile env:

```text
API_BASE_URL=
USE_MOCK_AI=false
USE_MOCK_OCR=false
ENABLE_TTS=true
ENABLE_PRACTICE=true
MAX_TEXT_LENGTH=3000
```

API env:

```text
NODE_ENV=development
PORT=3000
AI_PROVIDER=
AI_API_KEY=
AI_MODEL=
OCR_PROVIDER=
OCR_API_KEY=
MAX_TEXT_LENGTH=3000
MAX_IMAGE_BYTES=5242880
LOG_SENSITIVE_CONTENT=false
```

Rules:

- Do not commit `.env`.
- Phase 0 locks `MAX_TEXT_LENGTH=3000` characters for mobile and API. If changing, update `.env.example`, validators, QA tests, and related business rules.
- Mobile env is read via `react-native-config` or equivalent build config.
- Do not expose provider API keys in mobile env.
- Mobile only knows backend URL, not OCR/AI keys.

Native setup notes:

- iOS requires running CocoaPods after adding native dependencies.
- Android requires checking Gradle config after adding native dependencies.
- Camera/photo permission must be declared in `Info.plist` and `AndroidManifest.xml`.
- Release build needs separate signing config for iOS and Android.

Camera strategy:

- Phase 0 uses `react-native-image-picker` to open native camera UI or photo library.
- Do not write custom native camera module in Phase 0.
- Do not use `react-native-camera` because the library is deprecated.
- Only consider `react-native-vision-camera` in Phase 1+ if custom camera preview, crop overlay, live OCR, frame processor, or real-time framing guidance is needed.
- OCR in Phase 0 runs after user takes/picks image; not live on camera preview.

---

## 12. Privacy and Logging

Do not log:

- Full scanned image.
- Full OCR text.
- Full confirmed text.
- Full AI output.

May log:

- `request_id`
- anonymous user id
- event name
- provider name
- model name
- status
- error code
- duration
- token usage
- character count
- app version
- platform

Image handling:

- Mobile sends image to API via `multipart/form-data` in closed beta/public beta.
- Base64 only for small prototype/internal tests if simplification is needed.
- API processes image in memory or short-lived temp file.
- API deletes temp file after OCR.
- Do not store `original_image_url` in Phase 0 unless user/PO decides otherwise.

---

## 13. Analytics Implementation

Mobile tracks events in `08-operations/01-analytics-kpi-events.md`.

Minimum required payload:

```json
{
  "event_name": "ai_analysis_completed",
  "anonymous_user_id": "local-user-id",
  "timestamp": "2026-06-04T14:00:00.000Z",
  "platform": "ios",
  "app_version": "0.1.0",
  "properties": {
    "source_type": "paste_text",
    "status": "success",
    "duration_ms": 8400,
    "text_length_bucket": "501-1000"
  }
}
```

Text length bucket:

```text
1-100
101-500
501-1000
1001-2000
2001-3000
3000+
```

Do not send raw text in event properties.

---

## 14. UI Implementation Rules

Lesson result renders in this order:

1. Title.
2. Original text.
3. Vietnamese translation.
4. Summary.
5. Sentence analysis.
6. Vocabulary.
7. Grammar.
8. Pronunciation.
9. Practice.
10. Save action.

Rules:

- Empty sections must render empty state; no crash.
- Vocabulary shows at most 5 items initially; expand if more.
- Grammar shows at most 3 points.
- AI loading must preserve `confirmed_text`.
- Back from loading requires confirmation if request is in progress.
- Saved lesson detail does not call AI again.

---

## 15. Test Strategy

### Unit test

Required for:

- AI output schema validator.
- Lesson mapper.
- Text length validator.
- Error code mapper.
- Local lesson repository.

### Integration test

Required for:

- `/v1/ocr` mock provider success/fail.
- `/v1/ai/analyze` mock provider valid/invalid output.
- Retry invalid AI output.
- No sensitive logging mode.

### Mobile UI test

P0 priority:

- Paste text → mock AI → result screen.
- OCR failed → paste fallback.
- Edit OCR → analyze uses edited text.
- Save lesson → history → detail.
- Invalid AI output → friendly error.

### Manual QA

Per `05-qa/01-qa-test-plan.md`, minimum pass:

- TC-001 through TC-010 for P0.
- TC-011 through TC-013 if save lesson is enabled in beta.

---

## 16. Technical Milestones

### M1 — Local UI prototype

Deliverable:

- React Native app runs on iOS simulator and Android emulator.
- Paste text screen.
- Mock AI output.
- Result renderer.
- AI schema validator.

Exit criteria:

- Renders full result and result with missing optional sections.
- No real OCR/backend required.

### M2 — Backend proxy and real AI

Deliverable:

- Fastify API.
- `/health`.
- `/v1/ai/analyze`.
- AI provider adapter.
- Zod validation.

Exit criteria:

- AI output valid schema >= 95% with sample test suite.
- Invalid output does not crash mobile.

### M3 — OCR flow

Deliverable:

- Camera/gallery input.
- `/v1/ocr`.
- OCR review/edit.

Exit criteria:

- 20 sample images pass internal OCR flow.
- User can edit OCR text before AI analysis.

### M4 — Save/history beta

Deliverable:

- SQLite lesson repository.
- Save lesson.
- History.
- Lesson detail.
- Delete local data.

Exit criteria:

- Saved lessons persist after app restart.
- Detail does not call AI again.

### M5 — Beta polish

Deliverable:

- Analytics.
- Error states.
- Loading states.
- Privacy note.
- QA P0 pass.

Exit criteria:

- Release checklist in `04-product/06-roadmap-release-plan.md` passes.

---

## 17. Decisions That May Still Change

The following decisions may change before significant coding:

| Topic | Default | May change to |
|---|---|---|
| Backend framework | Fastify | NestJS, Supabase Edge Functions |
| OCR | Cloud OCR via proxy | On-device OCR if team accepts native setup |
| Local DB | `react-native-quick-sqlite` | `react-native-sqlite-storage`, Realm, WatermelonDB |
| State management | Local state + Zustand | Redux Toolkit |
| TTS | Native TTS | Cloud TTS cached |
| Auth | No login | Supabase/Firebase Auth |

If changed, update this file before implementation to avoid doc drift.

---

## 18. Definition of Ready for Development

Coding can start when:

- App repo has chosen React Native CLI + TypeScript or alternative stack is documented.
- `.env.example` has sufficient mobile and API variables.
- AI output schema v1 exists as runtime validator.
- Valid mock AI output is available.
- At least 5 sample input texts exist to test result renderer.
- First OCR/AI provider decision exists or mock provider is ready for M1.

---

## 19. Updated Implementation Prompt

```text
You are implementing Scan & Learn English Phase 0.

Read these docs first:
1. docs/01-ba/04-product/04-phase0-prd.md
2. docs/01-ba/03-requirements/01-functional-requirements.md
3. docs/01-ba/02-technical/03-ai-output-requirements.md
4. docs/01-ba/02-technical/05-data-model.md
5. docs/01-ba/05-qa/01-qa-test-plan.md
6. docs/01-ba/02-technical/06-ai-agent-implementation-guide.md
7. docs/01-ba/02-technical/01-technical-implementation-spec.md

Default technical decisions:
- React Native CLI + TypeScript.
- Local-first lesson storage using SQLite.
- No required login in Phase 0.
- Backend API proxy protects OCR/AI keys.
- Do not store original images by default.
- Validate AI output before rendering or saving.
- Saved lesson detail must not call AI again.

Start with M1:
Paste text screen → mock AI output → schema validation → result screen.
```

## Source: `docs/ba/release/release-production-readiness.md`

# Release & Production Readiness — Phase 0

## 1. Purpose

This document defines the conditions for **Scan & Learn English Phase 0** to ship as internal beta, closed beta, or public beta.

This document does not replace the PRD, QA plan, or Technical Implementation Spec. It answers:

```text
Before giving the app to real users, what still needs to be checked and prepared?
```

Also read when preparing beta/public:

- `04-public-app-setup-checklist.md` for account, env, store, Firebase/services setup.
- `../08-operations/04-security-key-and-data-protection.md` for security/key/data baseline.

This document is for:

- Product Owner
- Tech Lead
- Mobile Developer
- Backend Developer
- QA
- DevOps
- Legal/Privacy reviewer
- AI coding agent

---

## 2. Release levels

Phase 0 has 3 release levels:

| Level | Purpose | Audience | Conditions |
|---|---|---|---|
| Internal build | Verify core flow | Internal team | M1/M2 working, mock or real AI |
| Closed beta | Test with limited users | 20–100 testers | OCR/AI/save stable, privacy note present, QA P0 pass |
| Public beta | Users outside team | Real users | Store metadata, privacy/legal, monitoring, rollback, cost guard pass |

Do not launch public beta if only internal build has passed.

---

## 3. Release decision

Default decision:

```text
Phase 0 ships first as closed beta.
```

Reasons:

- App processes images/text that may contain personal data.
- AI output may be incorrect.
- OCR quality needs testing with real images.
- AI/OCR costs need measurement before scaling.
- UX for absolute beginners needs feedback from real users.

Public beta opens only after closed beta has enough operational data and serious issues are resolved.

---

## 4. Release owner and responsibilities

| Role | Responsibility |
|---|---|
| Product Owner | Finalize release scope, store copy, beta criteria |
| Tech Lead | Finalize architecture, provider, rate limit, rollback |
| Mobile Developer | Build iOS/Android, permission flow, crash reporting |
| Backend Developer | API proxy, logging, provider config, monitoring |
| QA | Test plan, regression, device matrix, release sign-off |
| Legal/Privacy reviewer | Privacy policy, terms, data safety claims |
| Design owner | App icon, splash, visual QA, store screenshots |

If one person holds multiple roles, review each responsibility separately.

---

## 5. Release blockers

Do not ship beta if any of these blockers remain:

- App crash in core flow.
- Invalid AI output can crash UI.
- App sends OCR raw text to AI before user confirms.
- Saved lesson detail calls AI again on every open.
- OCR/AI API keys in mobile client.
- No retry path when AI/OCR fails.
- No privacy note in app.
- No policy for deleting local lessons.
- Logging sends full scanned text or full AI output.
- No minimum crash/error reporting.
- No control over AI/OCR request costs.
- Store metadata overpromises AI capability or claims absolute accuracy.

---

## 6. App Store / Play Store readiness

### Required metadata

| Item | Content to prepare |
|---|---|
| App name | Scan & Learn English or finalized name |
| Subtitle / short description | Clearly state app helps learn English from images/text |
| Full description | Describe core flow, beginner audience, AI limitations |
| Category | Education |
| Age rating | Suitable for general education; verify per store form |
| Keywords | English learning, OCR, vocabulary, grammar, Vietnamese learners |
| Support URL | Support page or support email |
| Privacy Policy URL | Required before public beta |
| Marketing URL | Optional Phase 0 |
| App icon | 1024x1024 and platform variants |
| Screenshots | iPhone, Android phone; tablet optional |

### Store copy principles

Should say:

- Learn English from real-world content.
- Take photo or paste text.
- Get translation, vocabulary, grammar, and simple examples.
- For Vietnamese beginners.

Should not say:

- AI is always accurate.
- Fully replaces a teacher.
- Guarantees fluency in a specific timeframe.
- App reads and understands all complex documents.

### Permission copy

Camera:

```text
Ứng dụng cần dùng camera để bạn chụp đoạn tiếng Anh và tạo bài học từ nội dung đó.
```

Photo library:

```text
Ứng dụng cần quyền chọn ảnh để bạn tải ảnh có tiếng Anh lên và trích xuất nội dung học.
```

Microphone:

```text
Phase 0 không cần microphone vì chưa có pronunciation scoring.
```

If speaking practice is added later, microphone permission needs its own copy.

---

## 7. Privacy policy checklist

Privacy Policy must clearly state:

- App processes images or text provided by users.
- Images/text may be sent to backend and OCR/AI providers to create lessons.
- App does not store original images by default in Phase 0.
- App stores lessons on device if user saves lesson.
- App does not sell personal data.
- Analytics does not contain full scanned text.
- User can delete saved lessons on device.
- If using anonymous id, explain purpose: debugging, analytics, abuse prevention.
- If backend logs requests, logs do not contain full content.
- Provide contact channel for support/data deletion requests.

Do not write a generic Privacy Policy if the app actually sends text to OCR/AI providers.

---

## 8. Terms and disclaimer

App should have a short disclaimer in onboarding or settings:

```text
Kết quả phân tích được tạo bởi AI và có thể chưa chính xác hoàn toàn. Hãy dùng như công cụ hỗ trợ học tập, không phải nguồn đánh giá tiếng Anh chính thức.
```

Terms or in-app note should state:

- AI output may be wrong.
- Users should not upload overly sensitive content.
- App does not provide official certification or proficiency assessment.
- App is not responsible if user uses translation/explanation in legal, medical, financial, or important academic contexts.

---

## 9. Provider readiness

Before closed beta, first providers must be finalized:

| Provider | Decision needed | Exit criteria |
|---|---|---|
| OCR | Provider name, pricing, quota, supported image formats | 20 sample images pass core OCR flow |
| AI | Model name, structured output mode, pricing, rate limit | Schema valid >= 95% after retry |
| TTS | Native TTS or cloud TTS | If audio enabled, play success on iOS/Android |
| Analytics | Tool or internal event sink | Core funnel events captured |
| Crash reporting | Tool or platform built-in | Crash visible to team |

If providers not finalized, ship internal build only with mock provider.

---

## 10. Cost readiness

Public beta requires cost guard.

### Cost metrics

Track at minimum:

- AI request count.
- OCR request count.
- AI input/output token usage.
- AI error/retry count.
- OCR error/retry count.
- Average cost per lesson.
- Cost per active beta user.

### Guardrails

| Guardrail | Default |
|---|---|
| Max text length | 3,000 characters |
| Max image size | 5 MB before backend rejects |
| AI retry | Max 1 retry for invalid output |
| OCR retry | User-triggered retry, no infinite auto retry |
| Saved lesson reopen | No AI re-call |
| Regenerate AI result | Off by default Phase 0 |
| Daily request cap | Configurable per anonymous user |

### Cost stop condition

Pause public acquisition if:

- Average cost per generated lesson exceeds team threshold.
- AI/OCR retry rate rises abnormally.
- One anonymous user creates abnormal requests in short time.
- Provider quota nearly exhausted without fallback.

---

## 11. Security readiness

Checklist:

- [ ] No OCR/AI API keys in mobile app.
- [ ] Backend uses HTTPS.
- [ ] Backend validates request size.
- [ ] Backend validates text length.
- [ ] Backend has rate limit per anonymous id/IP/available device signal.
- [ ] Backend does not log sensitive content when `LOG_SENSITIVE_CONTENT=false`.
- [ ] `.env` not committed.
- [ ] `.env.example` does not contain real secrets.
- [ ] Error response does not leak provider secret or stack trace.
- [ ] CORS/API access policy matches deployment.
- [ ] Detailed security checklist in `../08-operations/04-security-key-and-data-protection.md` passed per release level.

---

## 12. Observability readiness

### Backend logs

Each request logs at minimum:

```json
{
  "request_id": "uuid",
  "route": "/v1/ai/analyze",
  "status": "success",
  "duration_ms": 8200,
  "provider": "configured-provider",
  "model": "configured-model",
  "error_code": null,
  "text_length_bucket": "501-1000",
  "timestamp": "2026-06-04T14:00:00.000Z"
}
```

Do not log raw text or full AI output.

### Minimum dashboards

- API success/error rate.
- AI invalid output rate.
- OCR no-text rate.
- Average AI latency.
- Average OCR latency.
- Token usage.
- Crash-free sessions.
- Funnel completion: input selected → OCR completed → AI completed → lesson saved.

### Minimum alerts

- High AI error rate.
- High OCR error rate.
- High API latency.
- Backend 5xx increase.
- Abnormal cost/token usage increase.
- Crash-free sessions drop sharply.

---

## 13. QA release gate

### Internal build gate

Pass:

- App launches on iOS simulator.
- App launches on Android emulator.
- Paste text → mock AI → result screen.
- Result screen handles empty vocabulary/grammar/practice.
- Invalid AI mock does not crash app.

### Closed beta gate

Pass:

- QA P0 test cases TC-001 through TC-010.
- Save lesson P1 test cases TC-011 through TC-013 if save enabled.
- 20 sample images tested.
- Network failure path tested.
- Camera/gallery permission denied path tested.
- Privacy note visible.
- Delete local lesson/data works.

### Public beta gate

Pass:

- Closed beta gate.
- Crash-free sessions meets team threshold.
- AI output schema valid >= 95% after retry.
- No P0/P1 open bugs.
- Store metadata ready.
- Privacy Policy URL ready.
- Support channel ready.
- Monitoring dashboard ready.
- Rollback plan ready.

---

## 14. Device matrix

Minimum testing:

| Platform | Device type | Required |
|---|---|---|
| iOS | Recent iPhone simulator | Yes |
| iOS | 1 real iPhone | Yes before closed beta |
| Android | Recent Android emulator | Yes |
| Android | 1 real Android device | Yes before closed beta |
| Small screen | iPhone SE-like or small Android | Yes before public beta |
| Low network | Simulated slow/failed network | Yes |

Camera/OCR should be tested on real devices because simulators do not fully reflect camera quality and permission behavior.

---

## 15. Accessibility readiness

Checklist:

- [ ] Text readable on small screen.
- [ ] Dynamic font size does not break result screen.
- [ ] Buttons have adequate tap target.
- [ ] Audio buttons have accessible labels.
- [ ] Correct/incorrect practice state does not rely only on color.
- [ ] Error messages are readable and actionable.
- [ ] Loading state communicates progress without blocking retry forever.

---

## 16. Design asset readiness

Before public beta need:

- App icon.
- Splash screen.
- Basic color palette.
- Typography scale.
- Button/input/card components.
- Empty state style.
- Error state style.
- Store screenshots.
- Screenshot captions in Vietnamese.

Wireframe text in `06-design/02-ui-wireframes.md` is sufficient for implementation prototype, but public beta needs visual QA before store submission.

---

## 17. Support readiness

Minimum needed:

- Support email.
- In-app link or settings item: "Gửi phản hồi".
- Bug report template: device, app version, step, screenshot optional.
- How user reports incorrect AI.
- How user requests data deletion or asks about privacy.

Suggested feedback categories:

```text
OCR sai
AI dịch sai
Giải thích khó hiểu
App lỗi/crash
Góp ý UX
Khác
```

---

## 18. Rollback and incident plan

### Mobile rollback

Mobile app store rollback is not instant, so feature flags needed:

- Disable real AI.
- Disable OCR.
- Disable TTS.
- Disable practice.
- Force maintenance message if backend severely fails.

### Backend rollback

Requirements:

- Deploy versioned backend.
- Can rollback to previous version.
- Provider config in env/config, not hardcoded.
- Health check available.

### Incident severity

| Severity | Example | Action |
|---|---|---|
| S0 | Leak sensitive content, API key exposed | Disable affected service, rotate key, investigate |
| S1 | Core AI/OCR down | Disable feature or show fallback, notify testers |
| S2 | High invalid output rate | Switch model/prompt, reduce traffic |
| S3 | Minor UI bug | Fix next build |

---

## 19. Beta success metrics

Closed beta should measure:

- Scan/input started.
- OCR success rate.
- AI analysis success rate.
- Time to first lesson.
- Lesson save rate.
- Lesson reopen rate.
- AI retry/error rate.
- OCR no-text rate.
- User feedback count.
- Crash-free sessions.

Beta meets requirements if:

- Core flow completion is stable.
- Users understand how to use without long instructions.
- AI output is at least useful enough for beginners.
- Cost/request within team threshold.
- No serious privacy/security issues.

---

## 20. Release checklist

### Internal build

- [ ] App starts.
- [ ] Paste text works.
- [ ] Mock AI result renders.
- [ ] AI validator works.
- [ ] Empty states render.
- [ ] No crash in basic navigation.

### Closed beta

- [ ] Camera input works.
- [ ] Gallery input works.
- [ ] OCR provider configured.
- [ ] AI provider configured.
- [ ] API keys only on backend.
- [ ] OCR review/edit works.
- [ ] AI result validates before render.
- [ ] Save lesson works.
- [ ] Lesson history works.
- [ ] Delete local data works.
- [ ] QA P0 pass.
- [ ] Privacy note available.
- [ ] Crash reporting enabled.
- [ ] Basic analytics enabled.
- [ ] Support email ready.

### Public beta

- [ ] Closed beta checklist pass.
- [ ] Store metadata ready.
- [ ] Store screenshots ready.
- [ ] App icon/splash ready.
- [ ] Privacy Policy URL ready.
- [ ] Disclaimer ready.
- [ ] Provider costs measured.
- [ ] Rate limit enabled.
- [ ] Monitoring dashboard ready.
- [ ] Alerting ready.
- [ ] Rollback plan documented.
- [ ] No P0/P1 open bugs.
- [ ] Release owner signs off.

---

## 21. Final ship decision template

```text
Release candidate:
Build version:
Target release level: Internal / Closed beta / Public beta
Date:

QA status:
- P0 pass:
- P1 pass:
- Known issues:

Provider status:
- OCR:
- AI:
- TTS:

Privacy/legal status:
- Privacy Policy:
- Disclaimer:
- Store data safety/privacy labels:

Ops status:
- Monitoring:
- Crash reporting:
- Rate limit:
- Rollback:

Decision:
- Ship / Do not ship

Approver:
Notes:
```

---

## 22. Definition of Ship Ready

Phase 0 is ship-ready for public beta when:

- Core flow works on iOS and Android.
- User can create lesson from image or paste text.
- Invalid AI output does not crash app.
- User can save, reopen, and delete lesson.
- API keys not in mobile app.
- Privacy Policy and disclaimer ready.
- Store metadata does not overpromise.
- Monitoring and crash reporting working.
- Rate limit and cost guard in place.
- Rollback/feature flag for provider failures.
- QA P0/P1 pass or known issues accepted in writing.

## Source: `docs/ba/technical/implementation-plan-m1-m5.md`

# Implementation Plan — Phase 0 M1-M5

## 1. Purpose

This document turns the BA/spec set into a concrete implementation plan for **Scan & Learn English Phase 0**.

This plan uses the stack locked in `02-technical/01-technical-implementation-spec.md`:

- React Native CLI + TypeScript for mobile.
- Fastify + TypeScript for backend API proxy.
- SQLite local-first for saved lessons via `react-native-quick-sqlite`.
- Backend protects OCR/AI provider keys.
- No Expo.

When implementing M2/M3, use `02-technical/04-ai-ocr-integration.md` as the detailed source for provider abstraction, quality gates, retry/fallback, and eval suite.

---

## 2. Implementation Principles

1. Build core learning result before connecting real OCR.
2. AI output must always validate with runtime schema.
3. Do not render or save invalid AI output.
4. Do not put OCR/AI API keys in the mobile app.
5. Saved lesson detail does not call AI again.
6. Each milestone must have a demo and clear test gate.
7. Do not add gamification, payment, account, or sync in Phase 0.

---

## 3. Target Repo Structure

```text
apps/
  mobile/
    ios/
    android/
    src/
      app/
        App.tsx
        navigation/
      modules/
        input/
        ocr/
        ai-analysis/
        lesson/
        vocabulary/
        grammar/
        pronunciation/
        practice/
        analytics/
      shared/
        api/
        components/
        config/
        db/
        errors/
        fixtures/
        schemas/
        types/
        utils/
    __tests__/
    .env.example

  api/
    src/
      routes/
      providers/
      schemas/
      services/
      config/
      observability/
    test/
    .env.example

docs/
```

If the team does not want a monorepo, split into 2 repos, but module boundaries and contracts stay the same.

---

## 4. M0 — Project Setup

### Goal

Create repo foundation so mobile and API can develop in parallel.

### Work

- Scaffold React Native CLI app with TypeScript.
- Scaffold Fastify API with TypeScript.
- Add formatter/linter.
- Add `.env.example` for mobile and API.
- Add shared convention for request id, error code, schema version.
- Create mock fixtures for valid and invalid AI output.

### Recommended mobile dependencies

```text
@react-navigation/native
@react-navigation/native-stack
react-native-screens
react-native-safe-area-context
react-native-config
react-native-quick-sqlite
react-native-keychain
zustand
zod
uuid
```

Camera/gallery dependencies are added in M3 to avoid native complexity too early.

### Recommended API dependencies

```text
fastify
zod
dotenv
uuid
pino
```

### Exit criteria

- Mobile app opens placeholder screen on iOS simulator and Android emulator.
- API `/health` runs locally.
- Test runner works for mobile logic and API.

---

## 5. M1 — Local UI Prototype

### Goal

Validate learning experience before connecting real OCR/AI.

### Scope

- Paste text screen.
- Mock AI analysis service.
- AI output schema validator.
- Lesson result screen.
- Basic empty/error/loading states.

### Key files/modules

```text
src/modules/input/
src/modules/ai-analysis/
src/modules/lesson/
src/shared/fixtures/
src/shared/schemas/
src/shared/components/
```

### Work

1. Copy/import `AIOutputSchema`, `AIOutput`, and `validateAIOutput()` from `docs/01-ba/01-schema/01-ai-output-v1.ts` into app shared schema. Do not redefine fields from descriptive docs.
2. Copy/import valid and invalid fixtures from `docs/01-ba/01-schema/fixtures/`.
3. Create `MockAIAnalysisService`.
4. Create Paste Text screen with empty and max length validation.
5. Create Loading screen/state.
6. Create Result screen rendering:
   - title
   - original text
   - Vietnamese translation
   - summary
   - sentence analysis
   - vocabulary
   - grammar
   - pronunciation guide
   - practice
7. Create empty state for empty vocabulary/grammar/practice.
8. Create error state when schema is invalid.

### Test gate

- Unit test `AIOutputSchema` with valid/invalid fixtures.
- Unit test text length validator.
- UI smoke test: paste text -> mock result.
- UI smoke test: invalid mock -> friendly error, no crash.

### Exit criteria

- Demo paste text -> lesson result without backend.
- Result screen works when optional sections are empty.
- No crash with invalid AI output.

---

## 6. M2 — Backend Proxy and Real AI

### Goal

Connect real backend AI after UI rendering is stable.

### Scope

- Fastify API.
- `/health`.
- `/v1/ai/analyze`.
- AI provider adapter.
- Prompt builder.
- Backend Zod validation.
- Retry invalid output at most once.
- Error code mapping.

### Key files/modules

```text
LingoBites-Server/src/routes/health.ts
LingoBites-Server/src/routes/aiAnalysis.ts
LingoBites-Server/src/providers/ai/
LingoBites-Server/src/schemas/aiOutputSchema.ts
LingoBites-Server/src/services/promptBuilder.ts
LingoBites-Server/src/services/aiAnalysisService.ts
LingoBites-Server/src/observability/logger.ts
src/shared/api/
src/modules/ai-analysis/
```

### Work

1. Implement `/health`.
2. Port `AIOutputSchema` to API or create shared package if using monorepo.
3. Implement prompt builder from `02-technical/03-ai-output-requirements.md`.
4. Implement AI provider interface:

```text
analyzeLesson(input) -> raw provider response
```

5. Implement `AIAnalysisService`:
   - validate input length
   - call provider
   - parse JSON
   - validate schema
   - retry once if invalid
   - return normalized response
6. Implement API client in mobile.
7. Add feature flag `USE_MOCK_AI`.
8. Do not log raw confirmed text.

### Test gate

- API integration test valid provider output.
- API integration test invalid provider output -> retry.
- API integration test invalid after retry -> `AI_INVALID_OUTPUT`.
- Mobile can switch mock/real AI by env.

### Exit criteria

- Real AI produces output that renders on mobile.
- Schema valid >= 95% with sample text suite after retry.
- Invalid provider response does not crash app.

---

## 7. M3 — OCR Flow

### Goal

Complete scan/upload -> OCR -> review/edit -> AI analysis.

### Scope

- Camera input.
- Gallery input.
- Image preview.
- `/v1/ocr`.
- OCR provider adapter.
- OCR review/edit screen.
- Retry OCR.
- Paste fallback.

### Mobile dependencies to add

```text
react-native-image-picker
react-native-permissions
```

Phase 0 uses `react-native-image-picker` to open native camera UI/photo library. No custom native camera and no `react-native-vision-camera` in Phase 0. If live OCR, crop overlay, or custom camera preview is needed later, consider `react-native-vision-camera` in Phase 1+.

### Key files/modules

```text
src/modules/input/
src/modules/ocr/
LingoBites-Server/src/routes/ocr.ts
LingoBites-Server/src/providers/ocr/
LingoBites-Server/src/services/ocrService.ts
```

### Work

1. Add permission copy to native config:
   - `ios/Info.plist`
   - `android/app/src/main/AndroidManifest.xml`
2. Implement image picker/camera flow with `react-native-image-picker`.
3. Implement image preview and replace image.
4. Implement `/v1/ocr` with `multipart/form-data`; use base64 only for internal prototype if needed.
5. Implement OCR provider interface:

```text
extractText(image) -> extracted_text, confidence, warnings
```

6. Implement OCR no-text/error mapping.
7. Implement OCR review screen with editable text.
8. Ensure AI receives `confirmed_text`, not `ocr_raw_text`.

### Test gate

- Permission denied path.
- Gallery image success.
- OCR success with clear image.
- OCR no text -> paste fallback.
- Edit OCR text -> AI request uses edited text.

### Exit criteria

- 20 sample images pass internal OCR flow.
- User always has a chance to edit text before AI analysis.

---

## 8. M4 — Save/History/Detail

### Goal

Create minimum retention loop: user saves and reopens lessons.

### Scope

- SQLite setup.
- Lesson repository.
- Save lesson.
- Lesson history.
- Lesson detail.
- Delete lesson/local data.
- Double-save prevention.

### Key files/modules

```text
src/shared/db/
src/modules/lesson/
src/app/navigation/
```

### Work

1. Create SQLite migration for `lessons` and `app_settings`.
2. Implement `LessonRepository`.
3. Map AI output + source metadata into `Lesson`.
4. Save full `ai_output_json`.
5. Implement save button state:
   - unsaved
   - saving
   - saved
   - error
6. Implement history list.
7. Implement lesson detail from local DB.
8. Implement delete lesson.
9. Implement clear local data in settings.

### Test gate

- Save lesson persists after app restart.
- Tap save multiple times creates only one lesson.
- Open saved lesson does not call AI.
- Delete lesson removes it from history.

### Exit criteria

- User can save, reopen, and delete lessons locally.
- Lesson history is usable with empty state.

---

## 9. M5 — Beta Polish

### Goal

Bring app to closed beta readiness.

### Scope

- Analytics.
- Crash/error reporting.
- Privacy note.
- Support/feedback entry.
- Loading/error polish.
- Accessibility pass.
- Release checklist.

### Key files/modules

```text
src/modules/analytics/
src/modules/settings/
src/shared/errors/
LingoBites-Server/src/observability/
docs/01-ba/07-release/01-release-production-readiness.md
```

### Work

1. Implement analytics adapter.
2. Track core funnel events from `08-operations/01-analytics-kpi-events.md`.
3. Ensure analytics payload never includes raw text.
4. Add crash/error reporting tool selected by team.
5. Add privacy note screen/section.
6. Add support feedback entry.
7. Polish loading messages and retry states.
8. Run accessibility checklist.
9. Run closed beta release checklist.

### Test gate

- Analytics events fire for core funnel.
- No full text in analytics payload.
- Privacy note visible.
- Network fail shows retry and preserves input.
- QA P0 pass.

### Exit criteria

- Closed beta checklist in `07-release/01-release-production-readiness.md` passes.
- No known P0/P1 blocker remains.

---

## 10. Provider Decisions to Lock Before M2/M3

| Decision | Lock before | Notes |
|---|---|---|
| AI provider/model | M2 | Must support structured JSON or be stable enough with prompt + validation |
| OCR provider | M3 | Prefer provider with good quality on real-world images |
| Analytics tool | M5 | May use adapter to swap later |
| Crash reporting | M5 | Required before closed beta |
| Backend hosting | M2 | Needs HTTPS public endpoint for real mobile |

M1 does not need real providers.
AI/OCR providers must be evaluated per scorecard in `02-technical/04-ai-ocr-integration.md` before closed beta.

---

## 11. Recommended Execution Order

```text
M0 setup
→ M1 local UI prototype
→ M2 real AI through backend
→ M3 OCR flow
→ M4 local save/history
→ M5 beta polish
→ closed beta
→ public beta readiness review
```

Do not swap M3 before M1 unless the goal is a standalone OCR proof-of-concept. For this product, result screen quality and schema are the foundation for a polished ship.

---

## 12. Definition of Done for Entire Phase 0

Phase 0 implementation is complete when:

- App runs on iOS and Android via React Native CLI.
- User can paste text and create a lesson.
- User can scan/upload image, review OCR text, and create a lesson.
- AI output is validated before render/save.
- User can save, reopen, and delete lessons.
- Saved lesson detail does not call AI again.
- API keys live only on backend.
- Core funnel analytics works.
- Privacy note and support path are in the app.
- QA P0 pass.
- Closed beta checklist pass.

---

## 13. Prompt for Coding Agent

```text
You are implementing Scan & Learn English Phase 0.

Use React Native CLI + TypeScript, not Expo.
Use Fastify + TypeScript for the backend API proxy.
Follow docs/01-ba/02-technical/01-technical-implementation-spec.md and docs/01-ba/02-technical/02-implementation-plan-m1-m5.md.

Start with M0 and M1 only:
1. Scaffold React Native CLI mobile app.
2. Scaffold Fastify API.
3. Copy/import canonical AI output Zod schema from `docs/01-ba/01-schema/01-ai-output-v1.ts`.
4. Copy/import valid and invalid AI fixtures from `docs/01-ba/01-schema/fixtures/`.
5. Build paste text screen.
6. Build mock AI service.
7. Build lesson result screen.
8. Add tests for schema validation and text length validation.

Do not implement OCR, real AI, save/history, auth, subscription, or gamification until M1 passes.
```

## Source: `docs/ba/requirements/traceability-matrix.md`

# Traceability Matrix — Phase 0

## 1. Purpose

This table links **FR → US → TC → Module/Screen → Status** to prevent **shipping incomplete features**.

Core product gate: if any product `Must` FR in section 2 does not have Status = ✅, the Phase 0 core loop is **not complete**.

The theme system is a separate UI foundation/polish checklist in section 3. Theme must not block the M1–M4 core loop unless the current task is UI/theme refactor.

- FR source: `03-requirements/01-functional-requirements.md`
- US source: `03-requirements/03-user-stories-acceptance.md`
- TC source: `05-qa/01-qa-test-plan.md`
- Module: per `02-technical/06-ai-agent-implementation-guide.md` section 3 and `02-technical/01-technical-implementation-spec.md` sections 5–6.

Status legend: ☐ not started · ◐ in progress · ✅ done & test pass.
TC `—` means **no test case yet** for that FR (see section 4).

---

## 2. Matrix

### Input

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-IN-001 | Take photo with camera | Must | US-001 | TC-001, TC-002 | input/CameraInput | ☐ |
| FR-IN-002 | Upload image from gallery | Must | US-002 | TC-003 | input/GalleryInput | ☐ |
| FR-IN-003 | Paste/enter text manually | Must | US-003 | TC-007 | input/PasteTextInput | ☐ |
| FR-IN-004 | Image preview before OCR | Must | US-001, US-002 | TC-001, TC-003 | input | ☐ |
| FR-IN-005 | Replace selected image | Must | US-002 | TC-016 | input | ☐ |
| FR-IN-006 | Validate empty text | Must | US-003 | TC-008 | input | ☐ |
| FR-IN-007 | Warn when text exceeds max length | Should | — | Edge (text too long) | input | ☐ |

### OCR

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-OCR-001 | Extract text from image | Must | US-004 | TC-004 | ocr/OCRService | ☐ |
| FR-OCR-002 | Display OCR loading state | Must | US-004 | TC-017 | ocr | ☐ |
| FR-OCR-003 | Display extracted text | Must | US-004 | TC-004 | ocr | ☐ |
| FR-OCR-004 | Retry OCR | Should | US-004 | TC-005 | ocr | ☐ |
| FR-OCR-005 | Notify when no text detected | Must | US-004 | TC-005 | ocr | ☐ |
| FR-OCR-006 | Preserve line breaks reasonably | Should | — | Edge (bullet points) | ocr | ☐ |
| FR-OCR-007 | Support common image formats | Must | US-002 | TC-018 | ocr | ☐ |

### OCR text review

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-REV-001 | Edit extracted text | Must | US-005 | TC-006 | ocr/OCRReviewScreen | ☐ |
| FR-REV-002 | Use edited text as AI input | Must | US-005 | TC-006 | review | ☐ |
| FR-REV-003 | Do not send to AI before user confirms | Must | US-005 | TC-006 | review | ☐ |
| FR-REV-004 | Display character count | Should | — | — | review | ☐ |
| FR-REV-005 | Warn if text may not be English | Nice | — | Edge (mixed EN/VI) | review | ☐ |

### AI analysis

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-AI-001 | Send confirmed text to AI | Must | US-003, US-006 | TC-007, TC-009 | ai-analysis | ☐ |
| FR-AI-002 | AI returns structured output | Must | US-006 | TC-009 | ai-analysis | ☐ |
| FR-AI-003 | Validate AI schema before render | Must | US-014 | TC-010 | ai-analysis/AIOutputValidator | ☐ |
| FR-AI-004 | Retry when output invalid | Should | US-014 | TC-010 | ai-analysis | ☐ |
| FR-AI-005 | Friendly loading messages | Should | — | — | ai-analysis | ☐ |
| FR-AI-006 | Handle AI timeout, preserve input | Must | US-014, US-015 | TC-019, Edge (network lost) | ai-analysis | ☐ |

### Translation

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-TR-001 | Full Vietnamese translation | Must | US-006 | TC-009 | lesson/result | ☐ |
| FR-TR-002 | Translation per sentence | Must | US-006 | TC-009 | lesson | ☐ |
| FR-TR-003 | Natural, beginner-friendly translation | Must | US-006 | Manual QA | lesson | ☐ |
| FR-TR-004 | Literal phrase translation | Should | — | — | lesson | ☐ |

### Sentence analysis

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-SA-001 | Split into sentences | Must | US-007 | TC-009 | lesson | ☐ |
| FR-SA-002 | Display original sentence + translation | Must | US-007 | TC-009 | lesson | ☐ |
| FR-SA-003 | Break down sentence into parts | Must | US-007 | TC-009 | lesson | ☐ |
| FR-SA-004 | Simple role for each part | Should | US-007 | — | lesson | ☐ |
| FR-SA-005 | Display pattern when available | Should | US-007 | — | lesson | ☐ |
| FR-SA-006 | Similar example sentences | Should | US-007 | — | lesson | ☐ |

### Grammar

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-GR-001 | Identify grammar points | Must | US-008 | TC-009 | grammar | ☐ |
| FR-GR-002 | Explain grammar in Vietnamese | Must | US-008 | TC-009 | grammar | ☐ |
| FR-GR-003 | Pattern/formula | Must | US-008 | — | grammar | ☐ |
| FR-GR-004 | Example sentences | Should | US-008 | — | grammar | ☐ |
| FR-GR-005 | Limit number of grammar points | Must | US-008 | TC-020, Edge (no grammar → empty) | grammar | ☐ |

### Vocabulary

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-VOC-001 | Extract important vocabulary | Must | US-009 | TC-009 | vocabulary | ☐ |
| FR-VOC-002 | Vietnamese meaning per word | Must | US-009 | TC-009 | vocabulary | ☐ |
| FR-VOC-003 | Word type | Should | US-009 | — | vocabulary | ☐ |
| FR-VOC-004 | Pronunciation guide | Should | US-009, US-010 | — | vocabulary | ☐ |
| FR-VOC-005 | Example sentence | Should | US-009 | — | vocabulary | ☐ |
| FR-VOC-006 | Avoid overly common words | Must | US-009 | Manual QA | vocabulary | ☐ |
| FR-VOC-007 | Limit vocabulary count per lesson | Must | US-009 | TC-021 | vocabulary | ☐ |

### Pronunciation

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-PRO-001 | Pronunciation support for vocabulary | Should | US-010 | TC-014 | pronunciation | ☐ |
| FR-PRO-002 | Pronunciation support for sentences | Should | US-010 | TC-014 | pronunciation | ☐ |
| FR-PRO-003 | Play audio if TTS available | Should | US-010 | TC-014 | pronunciation | ☐ |
| FR-PRO-004 | Vietnamese-friendly pronunciation guide | Should | US-010 | — | pronunciation | ☐ |
| FR-PRO-005 | IPA for advanced learners | Nice | US-010 | — | pronunciation | ☐ |

### Lesson & history

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-LES-001 | Create lesson after each successful AI analysis | Must | US-011 | TC-009 | lesson/LessonRepository | ☐ |
| FR-LES-002 | Save lesson (prevent duplicates) | Should | US-011 | TC-011, TC-013 | lesson | ☐ |
| FR-LES-003 | Open saved lesson | Should | US-012 | TC-012 | history | ☐ |
| FR-LES-004 | Display lesson title | Must | US-012 | TC-012 | history | ☐ |
| FR-LES-005 | Display created date | Should | US-012 | TC-012 | history | ☐ |
| FR-LES-006 | Persist AI result, no re-analyze on open | Should | US-012 | TC-012 | lesson | ☐ |

### Practice

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-PRAC-001 | Generate practice questions from lesson | Nice | US-013 | TC-015 | practice | ☐ |
| FR-PRAC-002 | Support multiple choice | Nice | US-013 | TC-015 | practice | ☐ |
| FR-PRAC-003 | Show correct answer after selection | Nice | US-013 | TC-015 | practice | ☐ |
| FR-PRAC-004 | Questions from lesson vocabulary/grammar | Nice | US-013 | TC-015 | practice | ☐ |

### Settings

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-SET-001 | Default level = Beginner | Must | — | TC-022 | settings | ☐ |
| FR-SET-002 | Allow changing learning level | Nice | — | — | settings | ☐ |
| FR-SET-003 | Configure TTS voice/speed | Nice | — | — | settings | ☐ |
| FR-SET-004 | Display privacy note for uploaded content | Should | — | — | settings | ☐ |

### Ops & analytics

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-OPS-001 | Log OCR/AI status for debugging | Should | — | Integration test (`02-technical/01-technical-implementation-spec.md §15`) | api/observability | ☐ |
| FR-OPS-002 | Do not log sensitive content unless anonymized | Must | — | Privacy test (13 §3) | analytics, api | ☐ |
| FR-OPS-003 | Track basic funnel events | Must | — | TC-023 | analytics | ☐ |
| FR-OPS-004 | Feature flag for AI/TTS provider | Should | — | — | shared/config | ☐ |

## 3. UI foundation / polish — Theme system (`06-design/03-theme-system.md`)

Theme is a cross-cutting technical requirement to reduce hard-coded UI and improve design consistency. It does not count toward the Phase 0 M1–M4 core product gate. Use as a gate only when implementing theme iteration or M5 polish.

| FR | Description | Pri | US | TC | Module | Status |
|---|---|---|---|---|---|---|
| FR-THEME-001 | Centralized theme object via Provider | Foundation | US-018 | TC-027 | theme/ThemeProvider | ☐ |
| FR-THEME-002 | Screens read styles from tokens, no hard-coding | Foundation | US-018 | TC-028 | theme, screens | ☐ |
| FR-THEME-003 | Reusable components AppText/AppButton/AppCard/AppScreen | Foundation | US-018 | TC-027 | components | ☐ |
| FR-THEME-004 | Register multiple themes (default/dark/pastel-kids) | Polish | US-016 | TC-027 | theme/themeRegistry | ☐ |
| FR-THEME-005 | Runtime theme switch via ThemePicker | Should | US-016 | TC-024 | components/ThemePicker | ☐ |
| FR-THEME-006 | Persist & restore theme | Should | US-017 | TC-025 | theme/themeStorage | ☐ |
| FR-THEME-007 | useAppTheme outside Provider → throw | Should | US-018 | TC-026 | theme/useAppTheme | ☐ |
| FR-THEME-008 | Each theme fully implements AppTheme (TS no error) | Foundation | US-016 | TC-027 | theme/themes | ☐ |
| FR-THEME-009 | Use semantic tokens, not raw palette | Foundation | US-018 | TC-028 | theme, screens | ☐ |
| FR-THEME-010 | Add new theme without modifying screens | Should | US-016 | TC-027 | theme | ☐ |
| FR-THEME-011 | (Deferred) Icon/asset/font resolver per theme | Deferred | — | — | theme | ☐ |

---

## 4. Test gaps (Must group addressed)

### Must — ✅ TESTS ADDED (TC-016..TC-023 in `05-qa/01-qa-test-plan.md`)

| FR | TC | Content |
|---|---|---|
| FR-IN-005 | TC-016 | Replace image → new image replaces old |
| FR-OCR-002 | TC-017 | OCR loading; prevent double-submit |
| FR-OCR-007 | TC-018 | Valid jpg/png/heic; unsupported file → clear error |
| FR-AI-006 | TC-019 | Mock AI timeout → retry → confirmed_text preserved |
| FR-GR-005 | TC-020 | Many grammar points → UI shows max 3 |
| FR-VOC-007 | TC-021 | Many words → UI defaults to ≤5, with "xem thêm" |
| FR-SET-001 | TC-022 | Fresh install → default level Beginner |
| FR-OPS-003 | TC-023 | Funnel events correct name + payload, no raw content |

> 2 remaining `Must` FRs verified by other methods (no new functional TC needed):
> FR-OPS-002 (no sensitive logging) → privacy test `05-qa/01-qa-test-plan.md §3` + integration `02-technical/01-technical-implementation-spec.md §15`;
> FR-VOC-006 (avoid common words) → Manual QA of AI quality with sample input `13 §6`.

### Should/Nice — add if time permits

FR-IN-007, FR-OCR-006, FR-AI-005, FR-REV-004, FR-REV-005, FR-TR-004, FR-SA-004/005/006, FR-GR-003/004, FR-VOC-003/004/005, FR-PRO-004/005, FR-SET-004, FR-OPS-001/004.

> Many `Should` FRs depend on AI quality (FR-TR-003, FR-VOC-006) → verify via **Manual QA + sample input** in `13 §6`, no automated TC needed.

---

## 5. Coverage summary

- Total FR (Phase 0 product, `07`): **71** (Must: 33 · Should: 30 · Nice: 8).
- Theme FR (UI foundation/polish, `26`): **11** (Foundation: 4 · Polish: 1 · Should: 5 · Deferred: 1).
- US: 18 (US-001..015 product + US-016..018 theme) · TC: **28** (TC-001..023 product + TC-024..028 theme).
- Product `Must` FRs without dedicated functional test: **0** (Phase 0: 8 supplemental TCs, 2 FRs verified via privacy/manual — see §4).

Update the Status column during build. When all product `Must` FRs = ✅ and TC-001..023 P0/P1 pass → aligns with core Definition of Done in `17 §8` and release gate in `20`. TC-024..028 are for theme iteration/M5 polish and do not block the M1–M4 core loop.

## Source: `docs/ba/technical/ai-ocr-integration.md`

# AI & OCR Integration Deep Dive — Phase 0

## 1. Purpose

AI and OCR are the technical core of **Scan & Learn English**. This document goes deep on integration so the pipeline is stable, easy to debug, cost-controlled, and produces learning output good enough for Vietnamese beginners.

This document supplements:

- `03-requirements/02-business-rules.md`
- `02-technical/03-ai-output-requirements.md`
- `05-qa/01-qa-test-plan.md`
- `02-technical/01-technical-implementation-spec.md`
- `02-technical/02-implementation-plan-m1-m5.md`
- `01-schema/01-ai-output-v1.ts`

The most important principle:

```text
OCR creates draft text → user confirm → AI analyzes confirmed_text only → schema validate → UI render/save.
```

Do not skip the user OCR confirm step.

---

## 2. End-to-End Pipeline

```text
Image/text input
  → input validation
  → image preprocessing
  → OCR provider
  → OCR normalization
  → OCR quality assessment
  → OCR review/edit screen
  → confirmed_text
  → AI request builder
  → AI provider
  → JSON parse
  → schema validation
  → content quality checks
  → lesson mapper
  → result UI
  → local save
```

Each step must have:

- clear input
- clear output
- clear error code
- log metadata without raw content
- corresponding test fixture

---

## 3. OCR Integration Architecture

### OCR provider interface

Backend exposes only one internal interface; routes must not depend on a specific provider:

```ts
type OCRInput = {
  requestId: string;
  imageBuffer: Buffer;
  mimeType: "image/jpeg" | "image/png" | "image/heic";
  sourceType: "camera" | "gallery";
  imageWidth?: number;
  imageHeight?: number;
};

type OCRTextBlock = {
  text: string;
  confidence?: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

type OCRResult = {
  provider: string;
  rawText: string;
  normalizedText: string;
  confidence?: number;
  blocks: OCRTextBlock[];
  warnings: string[];
};

interface OCRProvider {
  extractText(input: OCRInput): Promise<OCRResult>;
}
```

Phase 0 UI only needs `normalizedText`, `confidence`, `warnings`. `blocks` is kept in backend response or debug mode for future text-region highlighting if needed.

### OCR route normalized response

```json
{
  "request_id": "uuid",
  "status": "success",
  "provider": "configured-ocr-provider",
  "ocr_raw_text": "SPECIAL\\nDISCOUNT",
  "extracted_text": "SPECIAL DISCOUNT",
  "confidence": 0.91,
  "quality": {
    "text_length": 16,
    "text_length_bucket": "1-100",
    "line_count": 2,
    "has_english_signal": true,
    "low_confidence": false
  },
  "warnings": []
}
```

Mobile displays `extracted_text` in the OCR review editor. For internal debug, `ocr_raw_text` may be shown, but do not send raw OCR directly to AI.

---

## 4. Image Preprocessing

Preprocessing goal is to improve OCR success without distorting images or losing text.

### Camera capture strategy

Phase 0 does not need a custom native camera.

Decisions:

- Use `react-native-image-picker` to open native camera UI and photo library.
- OCR runs after image is taken/selected and user sees preview.
- Do not run OCR live on camera preview in Phase 0.
- Do not use `react-native-camera` because it is deprecated.
- Do not use `react-native-vision-camera` in Phase 0 to reduce native complexity.

Only switch to `react-native-vision-camera` in Phase 1+ if needed for:

- custom in-app camera preview
- crop/scan frame overlay
- live OCR/frame processor
- real-time framing guidance
- deep control of focus, exposure, zoom

### Mobile preprocessing

Mobile should:

- Resize image if long edge > 2,000 px.
- Compress JPEG reasonably so processed file <= 5 MB.
- Keep correct orientation.
- Keep color or grayscale per provider; do not over-threshold.
- Send `image_width`, `image_height`, `mime_type`, `source_type`.

Mobile should not:

- Auto-crop without confirmation UI.
- Apply strong filters that lose accents/small text.
- Store original image long-term.

### Backend preprocessing

Backend should:

- Validate real MIME, not only trust header.
- Reject files exceeding `MAX_IMAGE_BYTES`.
- Normalize orientation if provider needs it.
- Create short-lived temp file if provider SDK needs file path.
- Delete temp file after request.

Backend should not:

- Store original images by default.
- Log binary image or OCR raw text.

---

## 5. OCR Quality Assessment

OCR is not only success/fail. Quality must be classified so UX can choose messages.

| Signal | Rule | Action |
|---|---|---|
| Empty text | `normalizedText.trim().length === 0` | `OCR_NO_TEXT`, offer retry/paste |
| Too short | 1-2 characters | Warning, let user edit or paste |
| Low confidence | provider confidence < 0.65 if available | Warning blurry/hard-to-read image |
| Too long | text > 3,000 characters | Warn to shorten or require trimming |
| Not English signal | few Latin letters or much Vietnamese | Warning but still allow analyze if user wants |
| Many line breaks | many short lines | Preserve line breaks in editor |

Suggested quality object:

```ts
type OCRQuality = {
  textLength: number;
  textLengthBucket: TextLengthBucket;
  lineCount: number;
  hasEnglishSignal: boolean;
  lowConfidence: boolean;
  tooLong: boolean;
  warnings: string[];
};
```

---

## 6. OCR Normalization Rules

Normalization must be light-handed so user content is not wrongly changed.

Should do:

- Convert CRLF to LF.
- Trim start/end.
- Collapse more than 3 consecutive blank lines to 1 blank line.
- Normalize smart quotes if provider returns odd characters.
- Keep bullets/line breaks if text has menu/sign/email structure.

Should not do:

- Auto-fix spelling with AI before user confirm.
- Auto-translate or paraphrase OCR text.
- Bulk-remove punctuation.
- Drop lines if meaning could change.

Rule:

```text
ocr_raw_text = provider output near-original
extracted_text = lightly normalized for user review
confirmed_text = text user confirms/edits, source of truth for AI
```

---

## 7. OCR Error Taxonomy

| Error code | Cause | Retry | UX |
|---|---|---|---|
| `OCR_NO_TEXT` | No text recognized | Yes | Try clearer image or enter text |
| `OCR_LOW_QUALITY_IMAGE` | Blurry/dark/low contrast image | Yes | Suggest retake |
| `OCR_UNSUPPORTED_IMAGE_TYPE` | MIME not supported | No | Choose JPG/PNG/HEIC image |
| `IMAGE_TOO_LARGE` | File too large | No | Compress/choose another image |
| `OCR_PROVIDER_TIMEOUT` | Provider timeout | Yes | Retry |
| `OCR_PROVIDER_ERROR` | General provider error | Yes | Retry |

Mobile copy must be friendly and always offer paste text fallback.

---

## 8. AI Integration Architecture

### AI provider interface

```ts
type AIAnalysisInput = {
  requestId: string;
  confirmedText: string;
  level: "Beginner" | "Elementary" | "Intermediate";
  nativeLanguage: "Vietnamese";
  sourceType: "camera" | "gallery" | "paste_text";
  promptVersion: "lesson-analysis-v1";
  schemaVersion: "ai-output-v1";
};

type AIProviderResult = {
  provider: string;
  model: string;
  rawText: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
};

interface AIProvider {
  analyze(input: AIAnalysisInput): Promise<AIProviderResult>;
}
```

`AIProvider` only calls the model. `AIAnalysisService` is responsible for parse, validate, retry, normalize, and error mapping.

### AI analysis service flow

```text
validate confirmed_text
  → build prompt
  → call provider
  → parse JSON
  → validate AIOutputSchema
  → check original_text ~= confirmed_text
  → check output limits
  → return normalized data
```

Do not put prompt logic or provider-specific parsing in route controllers.

---

## 9. Prompt Strategy

Prompt must be versioned:

```text
lesson-analysis-v1
```

Prompt must include:

- role: English teacher for Vietnamese beginners
- target user: Vietnamese beginner
- source text
- strict output instruction
- schema summary
- constraints:
  - no markdown outside JSON
  - grammar/vocabulary must come from input
  - max grammar points: 3
  - default vocabulary target: 5-8 items, max 12
  - simple Vietnamese explanation
  - practice questions based only on lesson

Prompt should not:

- Ask AI to silently fix OCR.
- Request too many sections outside schema.
- Tell AI to invent knowledge not in input.

---

## 10. Structured Output and Validation

Schema source of truth is:

```text
docs/01-ba/01-schema/01-ai-output-v1.ts
```

Backend must:

1. Parse provider response into object.
2. Validate with `AIOutputSchema`.
3. Apply defaults via Zod if valid.
4. Verify `original_text.trim() === confirmed_text.trim()` or differ only by light whitespace.
5. Retry at most once if parse/validate fails.
6. Return `AI_INVALID_OUTPUT` if still fails.

Mobile must:

1. Re-validate response before render.
2. Render empty state for empty arrays.
3. Not crash if optional field is missing because schema already normalizes.

---

## 11. AI Content Quality Checks

Valid schema is not enough. Content must be checked before ship.

### Automatic checks

| Check | Rule | Failure handling |
|---|---|---|
| Original text match | `data.original_text` matches `confirmed_text` after trim | Retry or fail |
| Grammar count | `grammar_points.length <= 3` | Trim UI or ask model retry |
| Vocabulary count | `vocabulary.length <= 12` | Trim UI or ask model retry |
| Vocabulary source | `word` or `phrase_from_text` should appear in input | Warning/manual QA |
| Language | translation/explanation in Vietnamese | Warning/manual QA |
| Practice count | 0-3 questions Phase 0 | Trim UI |

### Manual QA checks

- Translation is natural.
- Explanation is not overly academic.
- Grammar point actually appears in input.
- Vocabulary is not all overly common words.
- Pronunciation guide does not cause serious misunderstanding.

---

## 12. Retry and Fallback Strategy

### OCR

| Failure | Retry strategy | Fallback |
|---|---|---|
| No text | User-triggered retry | Paste text |
| Low confidence | User-triggered retry | Edit OCR text |
| Provider timeout | Retry button | Paste text |
| Unsupported image | No retry same file | Choose another image |

### AI

| Failure | Retry strategy | Fallback |
|---|---|---|
| Invalid JSON | Backend auto retry once with stricter repair prompt | Friendly error + retry |
| Schema missing field | Backend auto retry once | Friendly error + retry |
| Timeout | No infinite auto retry | Preserve confirmed text |
| Provider down | Retry later | Keep input and saved draft if available |
| Content too long | No provider call | Ask user shorten text |

Rule:

```text
Auto retry only for provider/format errors that user cannot fix.
User-triggered retry for OCR quality and network-like failures.
```

---

## 13. Provider Selection Criteria

Do not choose provider only because demo looks good. Choose by scorecard.

### OCR scorecard

| Criterion | Weight | Notes |
|---|---:|---|
| Accuracy on real-world images | 35% | menu, signs, flyer, screenshot, email |
| Latency | 15% | P50/P95 per NFR |
| Cost | 15% | cost per OCR request |
| Language/text layout support | 10% | English, mixed symbols, line breaks |
| API stability | 10% | timeout/error behavior |
| Privacy/data retention terms | 10% | do not use data for training without consent |
| SDK/API simplicity | 5% | easy backend integration |

### AI scorecard

| Criterion | Weight | Notes |
|---|---:|---|
| Schema validity | 25% | valid >= 95% after retry |
| Vietnamese explanation quality | 25% | beginner-friendly |
| Grammar/vocab faithfulness | 20% | do not invent beyond input |
| Latency | 10% | P50/P95 per NFR |
| Cost | 10% | cost per generated lesson |
| Safety/privacy terms | 5% | data handling |
| Observability/usage data | 5% | token usage, error info |

First provider must pass minimum scorecard before closed beta.

---

## 14. Evaluation Suite

### OCR sample set

Need at least 30 images before closed beta:

| Group | Sample count | Examples |
|---|---:|---|
| Flyer/discount | 5 | poster, promotions |
| Menu/restaurant | 5 | menu, price board |
| Signage | 5 | staff only, open/closed |
| Screenshot | 5 | email, app text |
| Long paragraph | 5 | short article excerpt |
| Hard cases | 5 | slight blur, tilt, weak lighting |

Metrics:

- OCR success rate.
- Manual character error rate on samples with ground truth.
- No-text false negative.
- Average latency.
- User edit distance if tested with beta users.

### AI sample set

Need at least 30 texts before closed beta:

| Group | Sample count | Goal |
|---|---:|---|
| Short sign | 5 | short text, little grammar |
| Marketing/flyer | 5 | practical vocabulary |
| Menu/service | 5 | noun phrases |
| Email/notice | 5 | polite requests |
| Paragraph | 5 | multi-sentence |
| Edge/mixed text | 5 | mixed EN/VI, bullet, noisy OCR |

Metrics:

- Schema valid rate.
- Retry rate.
- Grammar faithfulness.
- Vocabulary source correctness.
- Beginner clarity score.
- Cost per lesson.
- Latency P50/P95.

---

## 15. Observability for AI/OCR

Minimum log metadata:

```json
{
  "request_id": "uuid",
  "operation": "ai_analysis",
  "provider": "provider-name",
  "model": "model-name",
  "status": "success",
  "duration_ms": 12400,
  "error_code": null,
  "text_length_bucket": "501-1000",
  "schema_version": "ai-output-v1",
  "prompt_version": "lesson-analysis-v1",
  "retry_count": 0,
  "timestamp": "2026-06-04T14:00:00.000Z"
}
```

Do not log:

- raw image
- full OCR text
- confirmed text
- full AI output

Internal debug may use fixtures or consent/anonymized samples.

---

## 16. Caching and Idempotency

### Request id

Mobile creates `request_id` for OCR/AI requests. Backend logs by `request_id`.

### Lesson hash

To avoid duplicate AI calls in the same session:

```text
lesson_input_hash = sha256(normalized confirmed_text + level + prompt_version + schema_version)
```

Phase 0 may cache in-memory or local-only. No global backend cache needed if privacy is not yet reviewed.

### Saved lesson

Saved lesson always uses local `ai_output_json`. Reopening lesson does not call AI.

---

## 17. Security and Privacy Controls

AI/OCR integration must have:

- Provider keys only on backend.
- HTTPS required.
- Request size limit.
- Text length limit.
- Rate limit.
- No raw content logs.
- Temp image cleanup.
- Privacy note before or on first camera/upload use.
- Support path for user questions/delete local data.

If provider has option to not use data for training, enable it when available.

---

## 18. Implementation Order for Integration

Do not connect OCR and AI at the same time.

```text
1. Mock AI result screen
2. Real AI with typed text only
3. OCR provider with manual review
4. OCR → confirmed_text → AI
5. Save/reopen result
6. Analytics + quality metrics
```

Reasons:

- If result UI is not stable, real OCR/AI only makes debugging harder.
- If AI schema is not stable, real OCR does not improve the product.
- If OCR has no review, AI analyzes wrong text and users lose trust.

---

## 19. Integration Test Cases to Add

| ID | Test | Expected |
|---|---|---|
| INT-OCR-001 | Upload clear-text image via multipart | OCR success, has extracted_text |
| INT-OCR-002 | Upload image with no text | `OCR_NO_TEXT`, paste fallback available |
| INT-OCR-003 | Upload image > 5 MB | `IMAGE_TOO_LARGE` |
| INT-OCR-004 | OCR low confidence | Warning shown on review screen |
| INT-AI-001 | Valid confirmed_text | AI success, schema valid |
| INT-AI-002 | Provider returns invalid JSON | backend retries once |
| INT-AI-003 | Invalid after retry | `AI_INVALID_OUTPUT` |
| INT-AI-004 | AI timeout | keeps confirmed_text, offers retry |
| INT-E2E-001 | OCR edited text → AI | AI receives edited text |
| INT-E2E-002 | Saved lesson reopen | Does not call AI again |

These tests should be added to `05-qa/01-qa-test-plan.md` or technical test suite when starting M2/M3.

---

## 20. Definition of Integration Ready

AI/OCR integration is ready for closed beta when:

- `/v1/ocr` uses multipart upload and rejects oversized images.
- OCR result has quality assessment and warnings.
- OCR review is required before AI.
- `/v1/ai/analyze` validates with `AIOutputSchema`.
- Backend retries invalid AI output at most once.
- Mobile re-validates before render.
- Confirmed text is not lost after AI/OCR/network errors.
- Logs do not contain raw content.
- Sample OCR set and AI set have been run.
- AI/OCR latency, error, retry, cost metrics are measured.

## Source: `docs/ba/release/privacy-policy-draft.md`

# Privacy Policy Draft — Phase 0

## 1. Purpose

This document is a draft Privacy Policy for **Scan & Learn English Phase 0**. Content must be reviewed by legal/privacy reviewer before public beta or store submission.

Principles:

- Clearly state the app processes images/text to create lessons.
- Do not be vague about AI/OCR providers.
- Do not overpromise.
- Do not publish final legal content without review.

---

## 2. Vietnamese draft (user-facing)

```text
Chính sách quyền riêng tư

Cập nhật lần cuối: [ngày cập nhật]

Scan & Learn English giúp người dùng học tiếng Anh bằng cách chụp ảnh, chọn ảnh hoặc nhập văn bản tiếng Anh, sau đó tạo bài học gồm bản dịch, từ vựng, ngữ pháp và gợi ý học tập.

1. Dữ liệu chúng tôi xử lý

Khi bạn sử dụng ứng dụng, chúng tôi có thể xử lý:
- Ảnh bạn chụp hoặc chọn để trích xuất chữ bằng OCR.
- Văn bản tiếng Anh được trích xuất từ ảnh hoặc do bạn nhập/dán.
- Văn bản bạn xác nhận hoặc chỉnh sửa trước khi tạo bài học.
- Kết quả bài học được tạo bởi AI.
- Dữ liệu kỹ thuật như loại thiết bị, phiên bản ứng dụng, thời gian xử lý, trạng thái lỗi và mã lỗi.

2. Cách dữ liệu được sử dụng

Dữ liệu được sử dụng để:
- Trích xuất chữ từ ảnh.
- Tạo bài học tiếng Anh bằng AI.
- Hiển thị, lưu và mở lại bài học trên thiết bị của bạn.
- Cải thiện độ ổn định, chất lượng OCR/AI và trải nghiệm người dùng.
- Phát hiện lỗi kỹ thuật và kiểm soát chi phí dịch vụ.

3. Xử lý ảnh và văn bản

Trong Phase 0, ứng dụng không lưu ảnh gốc mặc định. Ảnh có thể được gửi tạm thời đến backend để xử lý OCR và sau đó bị xóa khỏi bộ nhớ tạm hoặc file tạm.

Văn bản đã xác nhận có thể được gửi đến backend và nhà cung cấp AI để tạo bài học. Không nên gửi nội dung quá nhạy cảm như giấy tờ cá nhân, mật khẩu, thông tin tài chính, y tế hoặc pháp lý.

4. Lưu bài học

Nếu bạn lưu bài học, dữ liệu bài học được lưu cục bộ trên thiết bị của bạn. Bạn có thể xóa bài học đã lưu hoặc xóa dữ liệu cục bộ trong ứng dụng nếu tính năng này được bật.

5. Dữ liệu analytics và log

Ứng dụng có thể ghi nhận metadata để đo chất lượng và độ ổn định, ví dụ:
- Trạng thái thành công/thất bại của OCR hoặc AI.
- Thời gian xử lý.
- Mã lỗi.
- Phiên bản ứng dụng.
- Nền tảng iOS/Android.
- Nhóm độ dài văn bản, không phải toàn bộ nội dung văn bản.

Chúng tôi không chủ động log toàn bộ ảnh, văn bản người dùng hoặc toàn bộ kết quả AI trong analytics production.

6. Nhà cung cấp dịch vụ

Ứng dụng có thể sử dụng nhà cung cấp OCR, AI, analytics, crash reporting hoặc hosting để vận hành dịch vụ. Các nhà cung cấp này chỉ được dùng để xử lý chức năng cần thiết của ứng dụng.

Trước public beta, danh sách nhà cung cấp cụ thể sẽ được cập nhật tại đây:
- OCR provider: [tên provider]
- AI provider/model: [tên provider/model]
- Analytics/crash reporting: [tên công cụ]
- Backend hosting: [tên dịch vụ]

7. API key và bảo mật

API key của nhà cung cấp OCR/AI không được lưu trong ứng dụng mobile. Các request OCR/AI đi qua backend proxy qua HTTPS.

8. Quyền của bạn

Bạn có thể:
- Không cấp quyền camera/photo và dùng nhập text thủ công nếu khả dụng.
- Xóa bài học đã lưu trên thiết bị.
- Liên hệ để hỏi về quyền riêng tư hoặc yêu cầu hỗ trợ.

9. Trẻ em và nội dung nhạy cảm

Ứng dụng hướng đến mục đích học tập. Người dùng không nên tải lên nội dung nhạy cảm hoặc thông tin cá nhân của người khác nếu không có quyền.

10. Liên hệ

Nếu bạn có câu hỏi về quyền riêng tư, liên hệ:
[support email]
```

---

## 3. Short in-app privacy note

Suggested copy for Settings or first OCR use:

```text
Ảnh hoặc văn bản bạn chọn có thể được gửi tới hệ thống OCR/AI để tạo bài học. Ứng dụng không lưu ảnh gốc mặc định và không gửi nội dung đầy đủ vào analytics. Không nên upload nội dung quá nhạy cảm.
```

---

## 4. AI disclaimer

Suggested copy:

```text
Kết quả phân tích được tạo bởi AI và có thể chưa chính xác hoàn toàn. Hãy dùng như công cụ hỗ trợ học tập, không phải nguồn đánh giá tiếng Anh chính thức.
```

---

## 5. Store data safety checklist

Before store submission, confirm:

| Data category | Processed? | Notes |
|---|---|---|
| User-provided photos | Yes | Sent temporarily for OCR; original images not stored by default |
| User-provided text | Yes | Sent to AI to create lesson |
| Saved lessons | Yes | Local-first on device in Phase 0 |
| Analytics metadata | Yes | Does not contain raw text/images |
| Crash logs | Possibly | Does not contain raw content |
| Account data | Not by default | Phase 0 does not require login |

---

## 6. Items to finalize before public beta

- Support email/URL.
- Specific OCR/AI providers.
- Analytics/crash reporting tool.
- Backend hosting.
- Data retention policy for backend logs.
- How users delete local data in app.
- Legal review of final version.

## Source: `docs/ba/release/store-listing-design-assets.md`

# Store Listing & Design Assets — Phase 0

> **Who is this for?** Release owner, design owner, product, mobile dev preparing closed beta / public beta.
>
> **Read alongside:** `01-release-production-readiness.md` (ship conditions), `04-public-app-setup-checklist.md` (account/store setup), `02-privacy-policy-draft.md` (privacy URL), `../06-design/02-ui-wireframes.md` (screens), `../06-design/03-theme-system.md` (UI tokens), `../03-requirements/01-functional-requirements.md` (Phase 0 feature scope).

---

## 1. Purpose & scope

This document is the **source of truth** for:

- Store metadata (App Store + Google Play)
- Screenshot + caption plan
- App icon, splash, feature graphic
- Visual direction and minimum design tokens
- Permission copy, AI disclaimer, age rating

**Does not replace** wireframes in `../06-design/02-ui-wireframes.md`. Wireframes describe screen layout; this document describes **how to present the app on the store** and **assets to export**.

### Phase 0 — only claim what the app actually has

| In Phase 0 | Not available / deferred — **do not** list on store |
|---|---|
| Take photo, pick image, paste text | Login / accounts |
| OCR → user edits → confirm → AI | Multi-device sync |
| Lesson: translation, sentences, vocabulary, grammar | Pronunciation scoring / microphone |
| Pronunciation tips + TTS (if enabled) | Gamification, streak, leaderboard |
| Quick Practice (if in output) | Payment / subscription |
| Save lesson locally, review | Saved flashcards (if feature flag off) |
| Delete local data | Fully offline learning (network required for OCR/AI) |

All store copy must match core loop:

```text
Scan/Input → Confirm Text → Generate Lesson → Learn → Save → Review
```

---

## 2. Store positioning

### 2.1 App name

| Field | Content | Limit | Notes |
|---|---|---|---|
| App name (both stores) | `Scan & Learn English` | **30 characters** | Currently **21 characters** — valid |
| Vietnamese name (in description) | Quét tiếng Anh, học dễ hiểu bằng tiếng Việt. | — | Use in long description, not as app name |

**Do not rename** after uploading production build to store (rename requires new version + review).

### 2.2 Tagline / value proposition

**One-line (internal use, pitch, feature graphic):**

```text
Chụp một đoạn tiếng Anh ngoài đời và nhận bài học gồm bản dịch, từ vựng, ngữ pháp và gợi ý phát âm bằng tiếng Việt.
```

### 2.3 Subtitle & short description (by platform)

Apple **Subtitle** and Google **Short description** are different fields — **do not copy-paste** between them.

| Platform | Field | Vietnamese draft | Length |
|---|---|---|---|
| **App Store** | Subtitle | `Học tiếng Anh từ ảnh & text` | 27 / **30** characters |
| **Google Play** | Short description | `Biến ảnh hoặc đoạn tiếng Anh thành bài học dễ hiểu bằng tiếng Việt.` | 62 / **80** characters |

**App Store — backup subtitle (if emphasizing confirm):**

```text
Ảnh & text → bài học tiếng Việt
```

(30 characters — emphasizes user can edit text before AI)

### 2.4 Category & audience

| Item | Value |
|---|---|
| Primary category | **Education** |
| Audience | Vietnamese **beginners** learning English |
| Primary listing language | **Vietnamese** (recommended) |
| Secondary listing language (optional) | English |

---

## 3. Store metadata — full field table

### 3.1 App Store Connect (iOS)

| Field | Required | Limit | Notes |
|---|---|---|---|
| App Name | Yes | 30 characters | `Scan & Learn English` |
| Subtitle | Yes | 30 characters | See §2.3 |
| Description | Yes | 4,000 characters | Plain text, no HTML |
| Keywords | Yes | **100 bytes** | Comma-separated, **no space after comma** |
| Promotional Text | No | 170 characters | Editable without new build |
| What's New | Yes (each version) | 4,000 characters | Release notes |
| Support URL | Yes | 255 characters | HTTPS |
| Privacy Policy URL | Yes (public beta) | 255 characters | HTTPS — see `02-privacy-policy-draft.md` |
| Marketing URL | No | 255 characters | Optional Phase 0 |
| Copyright | Yes | — | `© 2026 [Legal name]` |
| Age Rating | Yes | Questionnaire | See §13 |
| App icon | Yes | **1024 × 1024** PNG/JPEG | No alpha, no rounded corners in file |

**Keywords draft (≤ 100 bytes, do not repeat app name):**

```text
english,vocabulary,grammar,ocr,lesson,scan,translate,beginner,vietnamese,learn
```

(91 bytes — add separate Vietnamese locale keywords if creating `vi` listing)

**Promotional Text draft (can change during beta):**

```text
Beta: chụp hoặc dán đoạn tiếng Anh — app tạo bài học tiếng Việt gồm dịch, từ vựng và ngữ pháp. Kết quả AI có thể chưa hoàn hảo.
```

(≈130 / 170 characters)

### 3.2 Google Play Console (Android)

| Field | Required | Limit | Notes |
|---|---|---|---|
| App name | Yes | **30 characters** | Same as iOS |
| Short description | Yes | **80 characters** | See §2.3 |
| Full description | Yes | 4,000 characters | May use bullet `•` |
| Graphic assets — Icon | Yes | **512 × 512** PNG 32-bit + alpha | Play auto-masks rounded corners |
| Graphic assets — Feature graphic | Yes | **1024 × 500** PNG/JPEG 24-bit | No alpha |
| Phone screenshots | Yes (public) | 2–8 images | See §5 |
| Privacy Policy URL | Yes | — | HTTPS |
| Category | Yes | Education | |
| Tags (if available) | Per form | — | No keyword spam |
| Contact email | Yes | — | Working support email |
| Data safety | Yes | Form | Match `04-public-app-setup-checklist.md` §6.6 |

---

## 4. Store description — full draft

### 4.1 Long description (both stores, minor format adjustments)

**Vietnamese version — recommended as primary listing:**

```text
Scan & Learn English giúp người Việt mới học tiếng Anh học từ nội dung đời thật — sách, menu, biển báo, email, hoặc đoạn text bạn copy.

CÁCH DÙNG
1. Chụp ảnh, chọn ảnh từ thư viện, hoặc dán văn bản tiếng Anh.
2. Kiểm tra và sửa text trước khi phân tích (bạn luôn là người quyết định nội dung gửi đi).
3. Nhận bài học tiếng Việt dễ hiểu.

TRONG MỖI BÀI HỌC
• Bản dịch tiếng Việt tự nhiên.
• Giải thích từng câu và tách cụm nghĩa.
• Từ vựng quan trọng kèm nghĩa và ví dụ.
• Điểm ngữ pháp chính — giải thích ngắn, không quá tải.
• Gợi ý phát âm và nghe thử (khi thiết bị hỗ trợ).
• Bài luyện tập ngắn (khi có trong bài học).

DÀNH CHO AI NÀO?
Ứng dụng ưu tiên người mới học: giải thích ngắn gọn, rõ ràng, tránh thuật ngữ khó.

LƯU & XEM LẠI
Lưu bài học trên thiết bị để ôn lại. Mở bài đã lưu không cần phân tích lại.

LƯU Ý QUAN TRỌNG
Kết quả được hỗ trợ bởi AI và OCR, có thể chưa chính xác hoàn toàn. Hãy dùng như công cụ hỗ trợ học tập, không phải nguồn đánh giá tiếng Anh chính thức. Không nên upload giấy tờ cá nhân, thông tin nhạy cảm.

YÊU CẦU
Cần kết nối mạng để nhận diện chữ (OCR) và tạo bài học (AI).
```

(≈1,100 characters — sufficient, no need to reach 4,000)

### 4.2 English description (optional secondary locale)

```text
Scan & Learn English turns real-world English text into beginner-friendly Vietnamese lessons.

Take a photo, pick an image, or paste text. Review and edit the text before analysis. Get translation, sentence breakdown, vocabulary, grammar notes, pronunciation tips, and short practice when available.

Built for Vietnamese beginners. AI-assisted results may not be fully accurate — use as a learning aid, not an official assessment tool. Internet required for OCR and lesson generation.
```

### 4.3 What's New — first beta template

```text
Phiên bản beta đầu tiên:
• Chụp/chọn ảnh hoặc dán text tiếng Anh
• Sửa text trước khi tạo bài học
• Bản dịch, từ vựng, ngữ pháp, luyện tập
• Lưu và xem lại bài học trên thiết bị

Góp ý: [support email]
```

---

## 5. Copy not to use (overpromise)

Do not use in **any** store field, screenshot caption, or feature graphic:

| Forbidden | Reason |
|---|---|
| "Dịch chính xác 100%" | AI/OCR may be wrong — release blocker (`01-release-production-readiness.md` §5) |
| "Thay thế giáo viên" | Not product goal |
| "Học giỏi tiếng Anh trong X ngày" | Unprovable time commitment |
| "Quét mọi tài liệu" | OCR limited by image quality |
| "Phân tích ngữ pháp hoàn hảo" | AI may miss/err |
| "Không bao giờ sai" | Violates disclaimer |
| "Offline hoàn toàn" | Phase 0 needs network for OCR/AI |
| "Bảo mật tuyệt đối" | Overpromises beyond reality |
| Direct competitor app name comparison | Store policy violation |

**Emphasize:** user confirms text, learn from real content, Vietnamese explanations for beginners, AI as support.

---

## 6. Screenshot plan — details

### 6.1 Requirements by release stage

| Stage | iOS | Android | Notes |
|---|---|---|---|
| Internal build | Not needed | Not needed | Internal testing only |
| Closed beta | TestFlight: full listing not required | Internal/Closed: minimum metadata | May use near-final mock |
| **Public beta** | **Required** screenshot + icon 1024 | **Required** ≥2 phone screenshots + icon 512 + feature graphic 1024×500 | Per checklist §16 |

### 6.2 Technical sizes (2026)

#### App Store (iPhone-only — recommended Phase 0)

| Asset | Size | Required | Notes |
|---|---|---|---|
| iPhone screenshot (master) | **1320 × 2868** px portrait | **Yes** | Display class 6.9" — Apple scales down for smaller devices |
| iPhone screenshot (alt accepted) | 1290 × 2796 px | Optional | Some tools export this size |
| Count | 1–10 images | Minimum **6** for this project | PNG or JPEG, RGB |
| iPad screenshot | 2064 × 2752 px | **No** if phone-only app | Only if shipping universal iPad |

**Reference:** [Apple — Upload screenshots](https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots)

#### Google Play (phone)

| Asset | Size | Required | Notes |
|---|---|---|---|
| Phone screenshot | **1080 × 1920** px portrait (recommended) | **Yes** (≥2) | Min 320 px, max 3840 px per side; aspect ≤ 2:1 |
| Feature graphic | **1024 × 500** px | **Yes** | JPEG/PNG 24-bit, no alpha |
| Hi-res icon | **512 × 512** px | **Yes** | PNG 32-bit + alpha |
| Screenshot count | 2–8 | Minimum **6** for this project | Max 8 MB/image |

**Reference:** [Google Play — Preview assets](https://support.google.com/googleplay/android-developer/answer/9866151)

### 6.3 Set of 6 screenshots — screen mapping

Use **same sample content** as wireframe (`../06-design/02-ui-wireframes.md`):

```text
We are offering a special discount for new customers.
Please visit our store before Friday.
```

| # | Screen (wireframe §) | Conversion goal | Caption overlay (Vietnamese) | FR reference |
|---|---|---|---|---|
| 1 | Home (§2) | Show 3 input methods: capture / upload / paste | `Chụp hoặc dán đoạn tiếng Anh` | FR-IN-001..003 |
| 2 | Review OCR (§3) | Emphasize **user edits text before AI** — differentiator | `Sửa text trước khi phân tích` | FR-REV-001..003 |
| 3 | Lesson overview — translation (§5) | Clear Vietnamese translation, not pure translator app | `Hiểu nghĩa bằng tiếng Việt` | FR-TR-001 |
| 4 | Sentence detail (§6) | Learn sentence by sentence, phrase breakdown | `Học từng câu dễ hiểu` | FR-SA-001..003 |
| 5 | Vocabulary or Grammar (§7–8) | App is more than translation — vocab + grammar | `Ghi nhớ từ vựng và ngữ pháp` | FR-VOC-001, FR-GR-001 |
| 6 | Lesson history (§10) | Save locally, review without re-calling AI | `Lưu bài học để xem lại` | FR-LES-002..006 |

**Screenshot 5 — choose one (prefer vocabulary if lesson has words):**

- **Vocabulary** tab when `vocabulary.length > 0`
- **Grammar** tab when vocab empty but `grammar_points.length > 0`

**Do not use** empty state screenshot as main image (unless illustrating empty handling — not recommended for listing).

**Optional screenshots 7–8 (if maximizing 8 on Play):**

| # | Screen | Caption |
|---|---|---|
| 7 | Quick Practice (§9) | `Luyện tập nhanh sau bài học` |
| 8 | Loading AI (§4) or Pronunciation | `AI tạo bài học có cấu trúc` / `Nghe gợi ý phát âm` |

### 6.4 Screenshot design rules

| Rule | Detail |
|---|---|
| Theme | Use **`default`** (light) theme for entire screenshot set — consistent |
| Device frame | **Optional** — Apple accepts full-bleed UI; Play recommends app UI only, avoid frame + extra marketing text |
| Caption overlay | Max **6–8 words** Vietnamese; readable at thumbnail size; sufficient contrast |
| Status bar | Clean: full battery, 9:41 (iOS convention) or 10:00, signal/Wi‑Fi — avoid low battery |
| In-app language | Vietnamese UI; learning content in English — matches product |
| Sensitive data | No ID cards, invoices, real personal emails |
| Beta badge | May add small "Beta" label on caption — do not cover main UI |

### 6.5 Screenshot production workflow

```text
1. Seed app with fixture valid-full.json OR staging build with fixed sample lesson
2. Set theme = default; disable debug banner
3. iOS Simulator iPhone 16 Pro Max (6.9") → Cmd+S or xcrun simctl io booted screenshot
4. Android Emulator 1080×1920 or real device → adb exec-out screencap
5. (Optional) Add caption via Figma template 1320×2868 / 1080×1920
6. Export PNG RGB; verify file < 8 MB (Play)
7. Review at small thumbnail (~30% zoom) — is text still readable?
8. Name files per §15; upload to Connect + Play Console
```

**Fastlane (optional after M5):** `snapshot` / `screengrab` — defer if no CI yet.

---

## 7. Feature graphic (Google Play only)

| Attribute | Value |
|---|---|
| Size | **1024 × 500** px (must be exact) |
| Format | PNG or JPEG 24-bit, **no alpha** |
| Content | Logo/icon + short tagline; **no** overpromise |
| Safe text | Keep copy in center area — may be cropped on some layouts |

**Suggested layout:**

```text
[Left 40%] Large app icon
[Right 60%] Scan & Learn English
           Học tiếng Anh từ ảnh & text thật
           (small subline) Dịch · Từ vựng · Ngữ pháp
```

**Colors:** use `colors.primary` and `colors.background` from `default` theme (`../06-design/03-theme-system.md`) — do not hard-code random hex in final export; record hex used in Figma.

---

## 8. Visual direction (in-app + marketing)

### 8.1 Brand personality

| Do | Don't |
|---|---|
| Clear, calm, beginner-friendly | Loud gradients, excessive gamification |
| Feel of "structured lesson" | Look like pure translator (Google Translate) |
| Learning content is center | Distracting illustrations |
| AI/OCR warning via text + icon | Color-only red/green without explanation |

### 8.2 Theme system link

All UI in screenshots and app **must** use tokens from `AppTheme` — see `../06-design/03-theme-system.md`.

**Do not** use outdated tokens like `color.success` / `color.warning` if not in `AppTheme`. Use current semantic tokens:

| Purpose | `AppTheme` token |
|---|---|
| App background | `colors.background` |
| Card/section | `colors.surface` |
| Primary text | `colors.text.primary` |
| Secondary text | `colors.text.secondary` / `colors.text.muted` |
| Primary CTA | `colors.primary` / `colors.primaryPressed` |
| Border | `colors.border` |
| Error | `colors.danger` |
| Screen title | `typography.size.xl` + `weight.bold` |
| Section title | `typography.size.lg` + `weight.semibold` |
| Learning body | `typography.size.md` |
| Caption | `typography.size.sm` |
| Spacing | `spacing.xs` … `spacing.xxl` |
| Card radius | `radius.md` / `radius.lg` |

### 8.3 Component states (required in app before screenshots)

| Component | Required states | Screenshot notes |
|---|---|---|
| Primary button (`AppButton`) | default, pressed, disabled, loading | Screenshot 2: `Phân tích` button enabled |
| Text input | default, focused, error, disabled | Screenshot 2: focused editor |
| Image picker card | empty, selected, loading, error | Screenshot 1: empty + recent lessons |
| OCR editor | editable, validating, too long warning | Screenshot 2: editable + char count |
| Result section | collapsed, expanded, empty, error | Screenshots 3–5: expanded with content |
| Save button | unsaved, saving, saved, error | Screenshot 3 or 6: saved state |
| Practice option | idle, selected, correct, incorrect | Optional screenshot 7 |
| Audio button | idle, playing, unavailable | Optional — do not claim if TTS disabled |

---

## 9. App icon

### 9.1 Creative concept

Icon must read at **29×29 pt** (Settings) and stand out on home screen.

**Communicate:**

- Scan / text / learning English
- Simple, 1–2 main motifs

**Suggested direction:**

```text
Scan frame (L-corner or viewfinder) around "EN" text or minimal text line;
primary color accent; surface/background fill.
```

### 9.2 Technical spec

| Platform | File | Size | Format |
|---|---|---|---|
| App Store | App Store Icon | **1024 × 1024** | PNG/JPEG, **no alpha**, no rounded corners in file |
| Google Play | Hi-res icon | **512 × 512** | PNG 32-bit **with alpha** |
| Android adaptive | Foreground + Background | 1024 × 1024 safe zone 66% | Vector/XML or PNG layer |
| iOS in-app | `AppIcon.appiconset` | Xcode generate from 1024 master | — |

### 9.3 Avoid

- Generic AI robot icon
- Too much small text (unreadable when scaled down)
- Copying Google Lens / Translate
- "100%" / "Free" text on icon

### 9.4 Icon checklist

- [ ] Clear on white and dark backgrounds (home screen wallpaper)
- [ ] No trademark violation (EN flag, other brand logos)
- [ ] Export `@1x` master 1024; downscale test at 64 px
- [ ] Android adaptive: verify circle/squircle mask does not clip motif

---

## 10. Splash screen

Phase 0 — minimal splash, no long marketing.

| Attribute | Value |
|---|---|
| Layout | App icon centered, `colors.background` background |
| Tagline | **None** — avoid text flash |
| Display time | Only during app cold start; hide when React Native root renders |
| iOS | `LaunchScreen.storyboard` — static, no animation |
| Android | `launch_screen.xml` / theme `windowBackground` |
| Dark mode | If shipping dark theme: splash matches selected theme's `colors.background` (or default) |

**Do not** artificially hold splash (no navigation delay).

---

## 11. Permission & system copy

Copy shown when OS requests permission — **must match** `Info.plist` (iOS) and `AndroidManifest` + rationale (Android 13+).

### Camera

```text
Ứng dụng cần dùng camera để bạn chụp đoạn tiếng Anh và tạo bài học từ nội dung đó.
```

| Platform | Key |
|---|---|
| iOS | `NSCameraUsageDescription` |
| Android | `android.permission.CAMERA` |

### Photo library

```text
Ứng dụng cần quyền chọn ảnh để bạn tải ảnh có tiếng Anh lên và trích xuất nội dung học.
```

| Platform | Key |
|---|---|
| iOS | `NSPhotoLibraryUsageDescription` (or `NSPhotoLibraryAddUsageDescription` if save only) |
| Android 13+ | `READ_MEDIA_IMAGES` |
| Android ≤12 | `READ_EXTERNAL_STORAGE` (if targeting older) |

### Microphone — Phase 0

```text
Không yêu cầu — chưa có pronunciation scoring.
```

Do not add microphone key to manifest if feature not present.

---

## 12. In-app disclaimer (sync with store)

Show in **first onboarding** or **Settings → About** (required before public beta):

```text
Kết quả phân tích được tạo bởi AI và có thể chưa chính xác hoàn toàn. Hãy dùng như công cụ hỗ trợ học tập, không phải nguồn đánh giá tiếng Anh chính thức.
```

This copy **must be consistent** with end of long description and `01-release-production-readiness.md` §8.

---

## 13. Age rating — declaration guide

Phase 0 — education app, **no** violence, gambling, dating content.

| Question (summary) | Phase 0 declaration |
|---|---|
| User-generated content | **Yes** — user captures/enters text; no public social feed |
| Medical / gambling / horror | **No** |
| Unrestricted web access | **No** (app API only) |
| Made for Kids (COPPA) | **No** unless product targets <13 and data policy changes |

**Expected result:** 4+ (Apple) / Everyone or equivalent (Google) — **reconfirm** after completing actual questionnaire on each console.

---

## 14. Localization

| Locale | Priority | Content to localize |
|---|---|---|
| `vi` (Vietnamese) | **P0** | Full description, screenshot captions, Vietnamese UI screenshots |
| `en-US` | P1 | Description + keywords (optional) |

**Rules:**

- Each App Store locale has its own **100-byte** keyword set
- Screenshots may be shared if UI is already Vietnamese; localize caption overlay if adding EN locale
- Privacy Policy: Vietnamese version required at minimum (`02-privacy-policy-draft.md`)

---

## 15. Asset folder structure (recommended)

```text
docs/01-ba/07-release/assets/store/
  icon/
    icon-master-1024.png          # iOS App Store master
    icon-play-512.png             # Play hi-res
    android-adaptive-foreground.png
    android-adaptive-background.png
  screenshots/
    ios-6.9/
      01-home-1320x2868.png
      02-ocr-review-1320x2868.png
      ...
    android-phone/
      01-home-1080x1920.png
      ...
  marketing/
    feature-graphic-1024x500.png
  source/
    figma-store-assets.fig        # source design file
```

**Naming:** `{platform}-{index}-{screen-slug}-{width}x{height}.png`

---

## 16. QA checklist — store assets

Before public beta submission:

### Copy & legal

- [ ] App name ≤ 30 characters
- [ ] Apple Subtitle ≤ 30 characters
- [ ] Google Short description ≤ 80 characters
- [ ] Keywords ≤ 100 bytes (iOS), no app name duplication
- [ ] Long description includes AI disclaimer
- [ ] No claims from §5
- [ ] Privacy Policy URL live (HTTPS)
- [ ] Support email/URL working
- [ ] In-app disclaimer present

### Images

- [ ] Icon 1024×1024 (iOS) and 512×512 (Play) from same master design
- [ ] Feature graphic exactly 1024×500 (Play)
- [ ] ≥ 6 screenshots matching screens in §6.3
- [ ] iOS master 1320×2868 (or size accepted by Connect)
- [ ] Android 1080×1920, each file < 8 MB
- [ ] Captions readable at thumbnail size
- [ ] No real personal data exposed
- [ ] UI matches build being submitted (not old build screenshots)

### Technical

- [ ] Screenshots from **production** flavor build, not staging API in demo (unless clearly marked beta)
- [ ] Default theme, no debug overlay
- [ ] Saved lesson screenshot does not show AI loading (correct BR — no AI re-call)

---

## 17. Beta launch checklist (summary)

### Closed beta (minimum)

- [ ] Temporary icon OK (placeholder OK if internal)
- [ ] Privacy Policy URL draft live
- [ ] Support email working
- [ ] Store description draft (not final yet)
- [ ] Screenshot plan has mock or wireframe aligned with team

### Public beta (required)

- [ ] All §16 items pass
- [ ] Final app icon 1024 + 512
- [ ] Splash iOS + Android
- [ ] 6+ screenshots iOS + Android
- [ ] Play feature graphic
- [ ] Age rating questionnaire complete
- [ ] Data Safety / Apple Privacy Nutrition matches actual app
- [ ] Visual QA on iPhone SE / small screen + Android 5.5" — text not broken
- [ ] `01-release-production-readiness.md` release blockers = 0
- [ ] `04-public-app-setup-checklist.md` §18 pre-flight public beta pass

---

## 18. Traceability

| Artifact | Owner | Reviewer | Related FR / BR |
|---|---|---|---|
| Store copy final | Product | Legal/Privacy | BR-AI-004, release blocker §5 |
| Screenshots | Design | Product | FR-IN, FR-REV, FR-TR, FR-LES |
| App icon | Design | Product + Dev | — |
| Feature graphic | Design | Product | — |
| Permission copy | Mobile Dev | Product | FR-IN-001..002 |
| Theme in screenshots | Mobile Dev | Design | FR-THEME-001..009 |

Update status in `../03-requirements/05-traceability-matrix.md` when each artifact is complete.

---

## 19. External references

| Document | URL |
|---|---|
| Apple — Screenshots | https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots |
| Apple — Product page | https://developer.apple.com/app-store/product-page/ |
| Google Play — Preview assets | https://support.google.com/googleplay/android-developer/answer/9866151 |
| Google Play — Store listing | https://support.google.com/googleplay/android-developer/answer/9859152 |

*Store screenshot sizes change by year — if upload rejected, recheck Apple/Google links before fixing assets.*

## Source: `docs/ba/design/theme-system.md`

# Theme System & Theme-driven Architecture

## 1. Purpose

This document specifies the **theme system** for `this repo`: a centralized architecture layer for all presentation (colors, fonts, spacing, radius, shadow, component styles) so screens and feature components **do not hard-code** styles.

This is UI foundation/polish, not a standalone product feature, and it does not block the M1–M4 core loop. Use it as a gate only when the current task is theme iteration or M5 polish.

Goals:

- Separate style from business logic; screens render only through tokens.
- Change the global theme through a single Provider; add or remove themes via checklist without editing screens.
- Let AI/dev build UI consistently using **semantic tokens**.

Source inspiration: `theme-driven-architecture-guide.md` (adapted to the repo's actual state). Detailed technical spec: `docs/90-90-superpowers/specs/2026-06-05-theme-driven-architecture-design.md`.

---

## 2. Scope

### In scope (theme iteration)

- `colors`, `typography` (system font), `spacing`, `radius`, `shadow`, `components` tokens.
- Theme Provider + `useAppTheme` hook + theme registry.
- 3 themes: `default` (light, keep current blue identity), `dark`, `pastel-kids`.
- Reusable components: `AppText`, `AppButton`, `AppCard`, `AppScreen`, `ThemePicker`.
- Runtime theme switching + persist selection via AsyncStorage.
- Refactor 2 existing screens (`PasteTextScreen`, `LessonResultView`) to use the theme.

### Out of scope (deferred — same batch as real assets)

- `AppIcon`, `AppImage`, `icons`/`assets`/`fonts` tokens, custom font (.ttf) + native linking.
- Themes other than the 3 above.
- Theming for screens not yet built (Scan, Result, Profile per `06`).

---

## 3. Architecture

```text
Design Tokens (base)
→ Semantic Theme (AppTheme)
→ Theme Registry
→ Theme Provider (context + persistence)
→ useAppTheme hook
→ Reusable UI Components
→ Screens
```

Screens read only through: `theme.colors`, `theme.typography`, `theme.spacing`, `theme.radius`, `theme.shadow`, `theme.components`.

Directory structure (`src/`):

```text
theme/
  types.ts          # AppTheme type + ThemeId
  tokens.ts         # shared base scale
  themes/
    default.ts      # id 'default'
    dark.ts         # id 'dark'
    pastelKids.ts   # id 'pastel-kids'
  themeRegistry.ts  # map ThemeId -> AppTheme, defaultThemeId
  themeStorage.ts   # getSavedThemeId()/saveThemeId() via AsyncStorage
  ThemeProvider.tsx # context, state, load on mount, save on change
  useAppTheme.ts    # hook, throws if used outside Provider
  index.ts
components/
  AppText.tsx
  AppButton.tsx
  AppCard.tsx
  AppScreen.tsx
  ThemePicker.tsx
```

---

## 4. Token model (`AppTheme`)

```ts
type ThemeId = 'default' | 'dark' | 'pastel-kids';

type AppTheme = {
  id: ThemeId;
  name: string;
  colors: {
    background: string;
    surface: string;
    border: string;
    primary: string;
    primaryPressed: string;
    danger: string;
    text: { primary: string; secondary: string; inverse: string; muted: string };
  };
  typography: {
    fontFamily: { primary?: string; display?: string }; // system font in this iteration
    size: { xs; sm; md; lg; xl; xxl };                   // number
    weight: { regular: '400'; medium: '600'; bold: '700' | '800' };
  };
  spacing: { xs; sm; md; lg; xl; xxl };  // number
  radius: { sm; md; lg; xl; pill };      // number
  shadow: { soft; medium; strong };      // ViewStyle (shadow* + elevation)
  components: {
    button: {
      primary:   { background; text; height; radius };
      secondary: { background; text; border; height; radius };
    };
    card:  { background; radius; padding; shadow };  // shadow: keyof AppTheme['shadow']
    input: { background; text; placeholder; border; radius };
  };
};
```

Convention: use **semantic tokens** (`colors.text.primary`), not raw palette names in screens.

---

## 5. UI Foundation / Polish Requirements (FR)

| ID | Requirement | Priority |
|---|---|---|
| FR-THEME-001 | System shall expose a centralized theme object (colors, typography, spacing, radius, shadow, component tokens) via a single Theme Provider | Foundation |
| FR-THEME-002 | Screens and feature components shall read styling from theme tokens, not hard-code colors/fonts/spacing | Foundation |
| FR-THEME-003 | System shall provide reusable themed components: AppText, AppButton, AppCard, AppScreen | Foundation |
| FR-THEME-004 | System shall register multiple themes (default, dark, pastel-kids) via theme registry | Polish |
| FR-THEME-005 | User can switch theme at runtime via ThemePicker, applied globally immediately | Should |
| FR-THEME-006 | System shall persist the selected theme and restore it when the app reopens | Should |
| FR-THEME-007 | `useAppTheme()` called outside Theme Provider shall throw a clear error | Should |
| FR-THEME-008 | Each theme shall fully implement the `AppTheme` type with no TypeScript errors | Foundation |
| FR-THEME-009 | Screens shall use semantic tokens (colors.text.primary), not raw palette names | Foundation |
| FR-THEME-010 | System shall allow adding a new theme without editing screens | Should |
| FR-THEME-011 | (Deferred) Icon/asset/font resolver per theme (AppIcon, AppImage, custom font) | Deferred |

---

## 6. Business / Design Rules (BR)

| ID | Rule |
|---|---|
| BR-THEME-001 | Do not hard-code colors/fonts in screens or feature components. |
| BR-THEME-002 | Use `useAppTheme()` for colors, spacing, radius, typography, shadow, and component tokens. |
| BR-THEME-003 | Use `AppText`/`AppButton`/`AppCard`/`AppScreen` instead of raw `Text`/`Pressable`/`View`/`SafeAreaView` when possible. |
| BR-THEME-004 | If a token is missing, add it to `AppTheme` and update **all** themes; do not use one-off styles that break the design system. |
| BR-THEME-005 | Each new theme must implement `AppTheme` correctly with no TypeScript errors. |
| BR-THEME-006 | Prefer semantic tokens and component tokens (button, card, input); do not use raw palette names. |
| BR-THEME-007 | The `default` theme must keep the current identity (blue tone) so UX does not break during refactor. |
| BR-THEME-008 | This iteration uses system font; custom font and icon/asset binaries are deferred until real assets are available. |
| BR-THEME-009 | Theme changes must apply globally immediately without restarting the app. |

---

## 7. User Stories & Acceptance Criteria

### US-016 — Switch app theme

As a user, I want to switch the app theme so that I can use a look I prefer.

```gherkin
Given the app is open
When I select a theme in the ThemePicker
Then all screens immediately use that theme's colors, spacing, and styles
And no app restart is required
```

### US-017 — Theme is remembered

As a user, I want the app to remember my chosen theme so that it stays after I reopen the app.

```gherkin
Given I selected a non-default theme
When I close and reopen the app
Then the app restores my previously selected theme

Given no theme was ever selected
When I open the app
Then the app uses the default theme
```

### US-018 — Unified style source for dev/AI

As a developer or AI coding agent, I want a single theme source and reusable components so that I can build UI consistently without hard-coded styles.

```gherkin
Given I build or edit a screen
When I need colors, spacing, typography, or component styles
Then I read them from useAppTheme() or use App* components
And I do not introduce hard-coded color/font values
```

---

## 8. QA Test Cases

| ID | Title | Expected |
|---|---|---|
| TC-024 | Runtime theme switch | Select a different theme in ThemePicker → all screens change colors/spacing immediately, no restart |
| TC-025 | Theme persistence | Select theme → reload app (mock AsyncStorage) → theme is restored; never selected → default |
| TC-026 | Provider guard | Call `useAppTheme()` outside Theme Provider → throws a clear error |
| TC-027 | Render all themes | Render default/dark/pastel-kids without errors; AppButton primary/secondary match `components.button`; AppText matches typography/colors |
| TC-028 | No hard-coded styles | Review/lint: `PasteTextScreen` and `LessonResultView` have no hard-coded color/font values, only tokens/App* |

---

## 9. Technical Impact & Dependencies

- **New dependency:** `@react-native-async-storage/async-storage` (native). After adding: `npm install`, `cd ios && pod install`, rebuild app. (RN CLI, not Expo.)
- **Refactor:** Wrap `App.tsx` with `<AppThemeProvider>`; migrate `PasteTextScreen` + `LessonResultView` to App* + `useAppTheme`, remove hard-coded `StyleSheet`; add `ThemePicker` to the input screen.
- **No impact** on API/backend, AI output schema, or OCR/AI flow.

---

## 10. Checklist for Adding a New Theme

- [ ] Create `theme/themes/<name>.ts` fully implementing `AppTheme`.
- [ ] Include `colors` / `typography` / `spacing` / `radius` / `shadow` / `components`.
- [ ] Add new `ThemeId` and register in `themeRegistry.ts`.
- [ ] Show in `ThemePicker`.
- [ ] Verify `PasteTextScreen` and `LessonResultView` render correctly (TC-027).
- [ ] (When assets are available) add `icons`/`assets`/`fonts` for the theme.

---

## 11. Definition of Done (theme system iteration)

- Theme Provider + registry + `useAppTheme` working; 3 themes fully implement `AppTheme` with no TypeScript errors.
- 2 existing screens have no hard-coded styles (TC-028).
- Runtime theme switch + persistence working (TC-024, TC-025).
- TC-024..028 pass.

This Definition of Done applies only when implementing the theme iteration. Phase 0 core loop still follows `03-requirements/05-traceability-matrix.md` section 2 and is not blocked by theme if theme is not in the current task.

