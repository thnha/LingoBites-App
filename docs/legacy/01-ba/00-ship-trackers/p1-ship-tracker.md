# P1 Ship Tracker — Review & Retention (MT-Practice)

> Quy trình: [`00-DOC-CONVENTION.md`](../00-DOC-CONVENTION.md) §6 · Workflow: [`09-phase-n-workflow-and-release-governance.md`](../02-technical/09-phase-n-workflow-and-release-governance.md)

**Product phase:** P1 · **Module track:** MT-Practice · **Trạng thái:** ◐ Core slice implemented, behind feature flag

Roadmap: [06-roadmap-release-plan.md](../04-product/06-roadmap-release-plan.md) §3

---

## 1. Mục tiêu P1 (tóm tắt)

Tăng retention với 3 tính năng lõi: **Flashcards** (lưu từ vựng riêng), **Spaced Repetition cơ bản** (lịch ôn tập), **Daily Review** (hàng đợi ôn hằng ngày).

**Phụ thuộc P0:** lessons đã lưu (`ai_output_json`), core loop ổn định.

---

## 2. Milestone / module status

| ID | Scope | Trạng thái | PR / Merge SHA | Brief / plan |
|---|---|---|---|---|
| — | PRD P1 | ✅ | N/A | `04-product/07-phase1-prd.md` |
| VIB-138 | SRS data layer | ✅ | [#5](https://github.com/thnha/LingoBites-App/pull/5) `b062365` | Schema, migrations, repositories |
| — | Flashcard save UI | ✅ | [#8](https://github.com/thnha/LingoBites-App/pull/8) `c82b4d2` | Save/unsave from lesson |
| VIB-140 | Flashcard List + FlipCard | ✅ | [#6](https://github.com/thnha/LingoBites-App/pull/6) `109b471` | List screen, flip component |
| VIB-141 | Daily Review Session | ✅ | [#7](https://github.com/thnha/LingoBites-App/pull/7) `1775eb0` | Session flow, rating control |
| VIB-146 | WCAG AA contrast fix | ✅ | [#9](https://github.com/thnha/LingoBites-App/pull/9) `bdb72ca` | Dark theme compliance |
| VIB-147 | Clean up review test renderers | ✅ | [#10](https://github.com/thnha/LingoBites-App/pull/10) `a51dee4` | Test cleanup |

### Core Features (Lát cắt lõi P1)

✅ **Completed and merged:**
- Flashcards — save vocabulary items from lessons ([#8](https://github.com/thnha/LingoBites-App/pull/8) `c82b4d2`)
- Flashcard list, detail view, flip card UI ([#6](https://github.com/thnha/LingoBites-App/pull/6) `109b471`)
- SRS scheduling — data layer, review scheduler ([#5](https://github.com/thnha/LingoBites-App/pull/5) `b062365`)
- Daily Review session — snapshot, rating, completion ([#7](https://github.com/thnha/LingoBites-App/pull/7) `1775eb0`)
- Unsave confirmation for cards with history
- Resume after crash (session persistence)
- WCAG AA contrast compliance ([#9](https://github.com/thnha/LingoBites-App/pull/9) `bdb72ca`)

☐ **Not yet started (out of P1 core slice scope):**
- Streak tracking
- Quiz history
- Favorite lessons
- Search functionality
- Level setting (learning level configuration)
- Mini-games (flagged separately: `miniGame*` flags)

---

## 3. FR / QA gate (P1)

| Metric | Target | Hiện tại | File |
|---|---|---|---|
| FR Must P1 | 12/12 | ✅ All implemented | Traceability § Phase 1 |
| Feature flags | Default-off until QA | `reviewSystem: false` | [08-feature-registry](../02-technical/08-feature-registry-release-config.md) |
| TC Must P1 | TBD | ◐ Implementation tests pass | Test files in `src/__tests__/*` |

---

## 4. Release

P1 modules ship **behind `reviewSystem` feature flag** (default `false` in `src/release/configs/close-beta-1.json`).

### Current Flag State

**close-beta-1.json** (P0 release):
```json
"reviewSystem": false
```

**Other P1+ flags** (also default-off, separate features):
- `miniGame*` flags: `false`
- `situationLearning`: `false`
- `dialogueGenerator`: `false`
- `phraseExtractor`: `false`
- `situationPractice`: `false`

**Status:** P1 core features are code-complete and merged to `main`, but flag remains `false` — does **not** block P0 closed beta as designed.

---

## 5. Canonical (created/updated)

- [x] `04-product/07-phase1-prd.md` — PRD from BA session [VIB-115](https://github.com/thnha/LingoBites-App/issues/115)
- [x] Design artifacts from Design session [VIB-125](https://github.com/thnha/LingoBites-App/issues/125):
  - User flows (Mermaid diagrams)
  - Wireframes
  - UI specifications (3 new components: `FlipCard`, `RatingControl`, `Banner`)
  - HTML handoff files
  - Content copy deck
  - Error message matrix
  - Accessibility checklist (WCAG AA verified)
- [x] Implementation complete — merged PRs #5-#10 to `main`
- [x] Phase 1 section in `05-traceability-matrix.md` (this update)
- [ ] TC section Phase 1 in `05-qa/01-qa-test-plan.md` *(implementation tests exist in `__tests__` directories; formal TC section TBD)*
- [ ] Entry in `DECISIONS.md` if navigation structure changed *(no nav change — Daily Review entry via Home widget, not 4th tab)*

---

## 6. Key Decisions (from BA/Design sessions)

| ID | Decision | Rationale | Owner |
|---|---|---|---|
| D1 | Daily Review entry point: **Home widget** (not 4th tab) | Preserves P0 3-tab navigation | TranHoangNha (VIB-126) |
| D2 | Lesson delete with active flashcards: **RESTRICT** (block delete) | Safety — requires unsave first | TranHoangNha (VIB-126) |
| D3 | SRS algorithm: **Fixed interval** (not SM-2) | Simplest "basic SRS" | TranHoangNha (VIB-126) |
| D4 | Daily queue cap: **Soft cap with carry-over** | Prevents overwhelming sessions | TranHoangNha (VIB-126) |
| D5 | First-save disclosure: **Blocking dialog with cancel** | Local-only data warning | TranHoangNha (VIB-130) |

---

## 7. Open Items

### Risks
- **R2** (from BA session): New review/schedule tables on same migration layer that had SQLite syntax fix (`6e1f830`) — needs Mobile Tech Lead review before production flag flip
- **DR-02** (from Design session): Confirm 2-outcome rating shape (`'remembered' | 'forgot'`) matches actual migration schema

### Questions
- **Q5** (from BA Gate 1): Push notification/reminder for Daily Review — not in core slice scope, deferred

### Out of Scope (explicitly)
- Streak, quiz history, favorite lessons, search, level setting — roadmap P1 items deferred to future sessions
- Grammar point / sentence pattern flashcards — P1 only supports vocabulary
- Multi-device sync, backup, login — local-first only
- Push notifications — not in core slice
