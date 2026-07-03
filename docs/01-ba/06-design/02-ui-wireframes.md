# Screen Wireframe Template

## 1. Purpose

This file provides low-fidelity text wireframes for the main Phase 0 screens. The goal is to help Designers and Developers visualize layout, components, and states before building the real UI.

Principles:

- Wireframes follow the flow and components in `06-design/01-user-flow-screen-spec.md`.
- Displayed fields map 1-1 to **`01-schema/01-ai-output-v1.ts`** (canonical). Reference only: `02-technical/03-ai-output-requirements.md`, `02-technical/05-data-model.md`.
- **Phase 0 lesson result** = single scroll per `01-technical-implementation-spec.md` §14 — not hub navigation to separate screens (§6–9 are **inline section** layout references).
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

## 5. Lesson Result (single scroll — Phase 0)

One scrollable screen. Section order matches `01-technical-implementation-spec.md` §14.

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
│ Tóm tắt                     │
│ Đoạn này nói về ưu đãi giảm │  ← summary (empty → friendly msg)
│ giá cho khách mới.          │
│                             │
│ ▼ Tách câu (2)              │  ← sentences (expand inline, §6)
│ ▼ Từ vựng (6)               │  ← ≤5 visible + "xem thêm"
│ ▼ Ngữ pháp (1)              │  ← ≤3 points
│ ▼ Luyện phát âm             │  ← pronunciation
│ ▼ Quick Practice (3)        │  ← practice (hide if empty)
│                             │
│ ┌─────────────────────────┐ │
│ │     🔖  Lưu bài học      │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

- Sections expand/collapse **within this scroll**; opening a section fires `result_section_opened`.
- Do **not** navigate to separate full screens for M1–M4 (post-P0 may add dedicated screens).

---

## 6. Inline section: Sentence analysis (reference layout)

Shows detail density when the **Tách câu** section is expanded inside §5 scroll (not a separate P0 screen).

```text
┌─────────────────────────────┐
│ Câu 1 / 2             🔊     │
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

## 7. Inline section: Vocabulary (reference layout)

Expanded **Từ vựng** block inside §5 scroll. Word card may open as modal/sheet post-P0; Phase 0 = list inline.

```text
┌─────────────────────────────┐    ┌─────────────────────────────┐
│ Từ vựng (6)                 │    │ offer                 ☆   │
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
- ☆/Save word button — **post-P0 only** when flashcard feature flag is on. Schema has no `is_saved` field in Phase 0.

---

## 8. Inline section: Grammar (reference layout)

Expanded **Ngữ pháp** block inside §5 scroll.

```text
┌─────────────────────────────┐
│ Ngữ pháp (1)                │
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

## 9. Inline section: Quick Practice (reference layout)

Practice questions inline or in expandable block within §5 scroll.

```text
┌─────────────────────────────┐    ┌─────────────────────────────┐
│ Quick Practice   1 / 3      │    │ Quick Practice   1 / 3      │
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

**Canonical copy:** `01-user-flow-screen-spec.md` §13 — do not duplicate here.

---

## 12. Quick Wireframe → Document Map

| Wireframe | Screen in 06 | Main schema/field |
|---|---|---|
| Home | §3 | recent lessons |
| Review & Edit OCR | §5 | confirmed_text, detected_language |
| AI Analysis Loading | §6 | — |
| Lesson Result (single scroll) | §7 | title, level, original_text, vietnamese_translation, summary, sentences, vocabulary, grammar_points, pronunciation, practice |
| Sentence section (inline) | §8 | Sentence, SentenceBreakdownChunk, SentencePattern |
| Vocabulary section (inline) | §9 | VocabularyItem (cefr_level, ipa, pronunciation_guide_vi) |
| Grammar section (inline) | §10 | GrammarPoint |
| Practice section (inline) | §7 / §9 wireframe | PracticeQuestion |
| Lesson History | §11 | Lesson (title, created_at) |
| Image Capture / Preview | §13 | image input (no AI field) |
| Profile & ThemePicker | §14 | theme id (registry) |

---

## 13. Image Capture / Preview (M3)

Sits between Home (Chụp ảnh / Upload) and Review & Edit OCR (§3). Native camera/gallery via
`react-native-image-picker` — no custom in-app camera in Phase 0 (`01-user-flow` §4).

```text
┌─────────────────────────────┐
│ ←   Ảnh của bạn             │
│                             │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │      🖼  preview ảnh     │ │  ← selected/captured image
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌──────────┐ ┌────────────┐ │
│ │ ↻ Đổi ảnh │ │ Tiếp tục → │ │  ← retake/change · continue → OCR
│ └──────────┘ └────────────┘ │
└─────────────────────────────┘
```

- No-permission state: `Yêu cầu cấp quyền camera/photo` (`01-user-flow` §4 States).
- `Tiếp tục` runs OCR; OCR failure → §3 / canonical error copy (`01-user-flow` §13).

---

## 14. Profile / Settings & ThemePicker (M5)

`ThemePicker` is the product home for theme switching (`01-user-flow` §12, `03-theme-system.md`).
Lists only registry themes whose feature flag is on; `default` is always present and marked when active.

```text
┌─────────────────────────────┐
│ Hồ sơ                       │
│                             │
│ Trình độ        Beginner ›  │
│ Ngôn ngữ app    Tiếng Việt ›│
│ Giọng đọc (TTS)        ›    │
│                             │
│ Giao diện                   │
│ ┌─────────────────────────┐ │
│ │ ◉ Mặc định (Default)     │ │  ← always shown
│ │ ○ Tối (Dark)             │ │  ← only if darkTheme flag on
│ │ ○ Pastel Kids            │ │  ← only if pastelKidsTheme flag on
│ └─────────────────────────┘ │
│                             │
│ Quyền riêng tư          ›   │  → PrivacyNoteScreen
│ Xoá dữ liệu cục bộ      ›   │
├─────────────────────────────┤
│  🏠 Home   📚 Lessons  👤   │
└─────────────────────────────┘
```

- Tapping a theme calls `setThemeId` → applies globally immediately, no restart (US-016, TC-024).
- A disabled-flag theme does not appear (TC-030); an unknown persisted id falls back to default (TC-029).
- `Quyền riêng tư` opens `PrivacyNoteScreen` — short note on what leaves the device during OCR/AI.
