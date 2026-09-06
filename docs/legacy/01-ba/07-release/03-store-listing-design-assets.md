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
| App name (both stores) | `LingoBites` | **30 characters** | Currently **10 characters** — valid |
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
| App Name | Yes | 30 characters | `LingoBites` |
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
LingoBites giúp người Việt mới học tiếng Anh học từ nội dung đời thật — sách, menu, biển báo, email, hoặc đoạn text bạn copy.

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
LingoBites turns real-world English text into beginner-friendly Vietnamese lessons.

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
[Right 60%] LingoBites
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
