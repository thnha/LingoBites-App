# User Flow & Screen Specification

## 1. Main Navigation

**Phase 0 (locked):** bottom navigation uses **3 tabs only**:

```text
Home | Lessons | Profile
```

| Tab | Purpose |
|---|---|
| **Home** | Primary CTAs: chụp ảnh, upload ảnh, dán text; recent lessons |
| **Lessons** | Saved lesson history (M4+) |
| **Profile** | Settings, privacy note, clear local data (M5) |

**Not in Phase 0:**

- **Scan tab** — scan/upload live on Home as buttons, not a separate tab.
- **Vocabulary tab** — vocabulary is a **section inside each lesson**; standalone flashcards are post-P0 (P1).

Post-P0 may add tabs or a center Scan FAB; do not implement until explicitly requested.

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

- **Native camera / gallery** via `react-native-image-picker` (system UI — no custom in-app camera view in Phase 0).
- Image preview after selection.
- Retake/change image.
- Continue button → OCR or review flow.

> Phase 0 does **not** use `react-native-vision-camera` or a live camera preview inside the app.

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

## 7. Screen: Lesson Result (single scroll — Phase 0 locked)

### Purpose

Display the lesson created from the input text on **one scrollable screen**.

**Canonical layout:** `02-technical/01-technical-implementation-spec.md` §14.
Wireframe: `02-ui-wireframes.md` §5.

Phase 0 uses a **single `ScrollView`** with section headers — not a hub that navigates to separate full screens (that pattern is post-P0 / Phase 1 polish).

### Section order (required)

1. Title + meta (`detected_language` · `level`).
2. Original text.
3. Vietnamese translation.
4. Summary (empty state if `summary` is `""`).
5. Sentence analysis — inline per sentence with breakdown/patterns.
6. Vocabulary — show ≤5 items initially, **"xem thêm"** if more (FR-VOC-007).
7. Grammar — show ≤3 points (FR-GR-005 / BR-GR-004).
8. Pronunciation.
9. Practice (hide or empty state if `practice` is `[]`).
10. Save lesson action.

Sections may use **expand/collapse within the scroll**; expanding fires `result_section_opened` analytics. Do not push separate stack screens for M1–M4.

### Example Layout

```text
Special Discount Flyer
English · Beginner

Bản gốc
We are offering a special discount for new customers.

Bản dịch
Chúng tôi đang cung cấp một chương trình giảm giá đặc biệt...

Tóm tắt
Đoạn này nói về ưu đãi giảm giá cho khách mới.

▼ Tách câu (2)
  [sentence cards inline — see §8 content model]

▼ Từ vựng (6) — hiển thị 5, xem thêm
▼ Ngữ pháp (1)
▼ Luyện phát âm
▼ Quick Practice (3)

[ Lưu bài học ]
```

### Acceptance Criteria

- User immediately understands the translation and summary.
- All sections render in §14 order; empty arrays show friendly messages, no crash.
- Vocabulary/grammar limits match technical-spec §14.
- Save button shows the correct state (M4+).

---

## 8. Section content: Sentence analysis (inline — not a separate P0 screen)

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

## 9. Section content: Vocabulary (inline — not a separate P0 screen)

### Purpose

Display words and phrases worth learning from the lesson.

### Components

- Word/phrase.
- Vietnamese meaning.
- Word type.
- Pronunciation.
- CEFR level.
- Example.
- Save word button — **post-P0 only** when flashcard feature flag is on (no `is_saved` in `01-ai-output-v1.ts`).

### Acceptance Criteria

- User understands word meaning.
- User can hear or see pronunciation.
- Save-word control is hidden in Phase 0 unless flashcard module is explicitly enabled.

---

## 10. Section content: Grammar (inline — not a separate P0 screen)

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
- App language: `en` / `vi` UI locale support. During M1-M3 before localization infrastructure exists, prefer Vietnamese learner-facing copy.
- TTS voice setting if available.
- **Theme picker** — `ThemePicker` lives here; this is the product home for switching the app theme
  (see `03-theme-system.md`). It lists only registry themes whose feature flag is enabled; `default`
  is always shown. Do not place the picker inside the PasteText input flow.
- Privacy note — opens `PrivacyNoteScreen` (data-handling note: what leaves the device during OCR/AI).
- Clear local data if needed.

---

## 13. Empty States and Error States (canonical copy)

**Single source of truth** for user-facing empty/error strings. Wireframes and other docs link here — do not duplicate tables elsewhere.

| Situation | Message |
|---|---|
| No lesson | Bạn chưa có bài học nào. Hãy chụp một đoạn tiếng Anh để bắt đầu. |
| OCR failed | App chưa nhận diện được chữ trong ảnh. Hãy thử ảnh rõ hơn hoặc nhập text thủ công. |
| AI failed | App chưa tạo được bài học. Vui lòng thử lại. |
| No vocabulary | Đoạn này khá đơn giản, app chưa tìm thấy từ vựng khó đáng học. |
| No grammar | Đoạn này không có cấu trúc ngữ pháp nổi bật. |
| Network lost | Mất kết nối mạng. Vui lòng thử lại sau khi có mạng. |

---

## 14. UX Priorities

Priority order when designing UI:

1. Easy to get started.
2. Easy to edit OCR text.
3. Easy to understand the translation.
4. Easy to learn sentence by sentence.
5. Do not overwhelm the user.
