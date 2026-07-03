# Public App Setup Checklist — Accounts, Services & Environments

> **Who is this for?** Anyone who has never shipped a mobile app to store, or dev/backend/product needing step-by-step checklist for closed beta / public beta.
>
> **Read alongside:** `01-release-production-readiness.md` (ship conditions), `03-store-listing-design-assets.md` (store copy/images), `../08-operations/04-security-key-and-data-protection.md` (key security).

---

## 0. Basic terminology (read first if unfamiliar)

| Term | Simple meaning | Example in this project |
|---|---|---|
| **Bundle ID** (iOS) | Unique "ID number" of app on iPhone | `com.yourcompany.lingobites.staging` |
| **Package name** (Android) | Android equivalent of Bundle ID | `com.yourcompany.lingobites.staging` |
| **TestFlight** | iOS beta distribution channel via Apple (no public App Store needed) | Send build to 20–100 testers |
| **Internal / Closed testing** (Play) | Internal / limited testing on Google Play | Equivalent to TestFlight |
| **Signing / Keystore** | Certificate proving "this app was built by you" | Required to install on real devices |
| **Env (environment)** | Configuration set per stage | `local`, `staging`, `production` |
| **API key / Secret** | Password to call third-party services | `AI_API_KEY`, `OCR_API_KEY` — **backend only** |
| **Backend proxy** | Middle server holding keys; mobile only calls server | Fastify `/v1/ocr`, `/v1/ai/analyze` |
| **Firebase** | Google platform: crash logs, analytics | Crashlytics during beta |
| **Privacy Policy** | Web page explaining what data app collects/processes | Required before public beta |
| **Data Safety** (Play) | Google form declaring app data collection | Must match actual app behavior |

**Data flow to remember:**

```text
Phone (NO AI/OCR keys)
    → HTTPS → Backend (HAS keys in secret env)
        → OCR provider / AI provider
    → Return result to phone
```

Mobile **never** contains `AI_API_KEY` or `OCR_API_KEY`. See `../08-operations/04-security-key-and-data-protection.md`.

---

## 1. Purpose

This document guides **step by step** preparing accounts, environments, store, Firebase, hosting, and providers to move **LingoBites** from dev machine build to **closed beta** then **public beta**.

Each step includes:

- **What you need** — accounts, card, time
- **What to do** — specific actions
- **Expected outcome** — how to know it's done
- **Common mistakes** — avoid wasting time

---

## 2. Preparation before starting

### 2.1 People and roles

| Role | Main tasks in this checklist |
|---|---|
| **Release owner** | Create store accounts, finalize app name, fill store forms |
| **Mobile dev** | Mobile env, Firebase config, iOS/Android build, signing |
| **Backend / DevOps** | Hosting, env secrets, provider keys, `/health` |
| **Product / Legal** | Privacy Policy, support email, store copy |

One person may hold multiple roles — still complete every item.

### 2.2 Estimated costs (Phase 0 beta)

| Item | Reference cost | Notes |
|---|---|---|
| Apple Developer Program | ~99 USD/year | Required for iOS TestFlight |
| Google Play Console | ~25 USD one-time | Required for Android |
| Domain | ~10–20 USD/year | For privacy/support URL |
| Backend hosting | 0–20 USD/month | Free tier (Render/Railway) sufficient for small closed beta |
| AI provider | Usage-based | Set budget alert (e.g. 50 USD/month staging) |
| OCR provider | Usage-based | Test with small quota first |
| Firebase | 0 USD (Spark) | Sufficient for small beta Crashlytics/Analytics |
| Support email | 0 USD | Gmail workspace or free alias |

### 2.3 Estimated time (first time)

| Stage | Time |
|---|---|
| Store accounts (Apple + Google) | 1–3 days (Apple may require approval wait) |
| Domain + simple privacy page | 0.5–1 day |
| Backend staging deploy | 0.5–1 day |
| AI/OCR provider + test | 1 day |
| Firebase + app integration | 0.5 day |
| TestFlight + Internal testing build | 1–2 days |
| **First-time total** | **~5–10 working days** (can parallelize) |

### 2.4 Tools to install on dev machine

- [ ] **Node.js** LTS (for backend)
- [ ] **Xcode** (macOS, for iOS) — from Mac App Store
- [ ] **Android Studio** (for Android SDK)
- [ ] **Git**
- [ ] **GitHub/GitLab** account (if using CI later)

---

## 3. Setup order overview

Follow **this order** to avoid finishing build but missing backend or privacy URL.

```text
Step 1  → Finalize app name, domain, support email          (~2 hours)
Step 2  → Create Apple Developer + App Store Connect       (~1 day, may wait)
Step 3  → Create Google Play Console + app record            (~2 hours)
Step 4  → Buy domain + minimum Privacy/Support page   (~0.5 day)
Step 5  → Deploy backend staging + HTTPS + /health        (~0.5 day)
Step 6  → Create AI provider account + staging key           (~2 hours)
Step 7  → Create OCR provider account + staging key          (~2 hours)
Step 8  → Firebase staging + attach iOS/Android              (~2 hours)
Step 9  → Configure mobile + backend env                   (~1 hour)
Step 10 → iOS/Android signing + test build                 (~1 day)
Step 11 → Internal test on real devices                     (~0.5 day)
Step 12 → Open closed beta (TestFlight / Closed testing)    (after QA P0 pass)
Step 13 → Prepare production (separate env, store assets)    (before public beta)
```

**Do not** open public beta before closed beta passes QA P0 and security checklist (`01-release-production-readiness.md`).

---

## 4. Step 1 — Finalize app name, identifiers, and support

### 4.1 Finalize display name

| Item | Default suggestion | Notes |
|---|---|---|
| App name (store) | `LingoBites` | See `03-store-listing-design-assets.md` |
| Company / publisher name | Legal name or individual | Match store account |

### 4.2 Finalize Bundle ID and Package name

**Convention:** use **two sets** — staging and production — to install side by side on same test device.

| Environment | iOS Bundle ID (example) | Android package (example) |
|---|---|---|
| Staging | `com.yourcompany.lingobites.staging` | `com.yourcompany.lingobites.staging` |
| Production | `com.yourcompany.lingobites` | `com.yourcompany.lingobites` |

**How to finalize:**

1. Replace `yourcompany` with real name (lowercase, no accents, no spaces).
2. Record in internal file / wiki — **do not change** after uploading build to store (change = new app).
3. Mobile dev updates `ios/` and `android/` per finalized IDs.

**Expected outcome:** Table of 4 IDs (iOS staging/prod, Android staging/prod) agreed by team.

### 4.3 Support email and URL

| Item | Requirement | Example |
|---|---|---|
| Support email | Mailbox checked daily | `support@yourdomain.com` or `lingobites@gmail.com` |
| Privacy Policy URL | Public HTTPS page | `https://yourdomain.com/privacy` |
| Support URL (optional) | Short FAQ page or mailto | `https://yourdomain.com/support` |

**Expected outcome:** Test email to support → received.

---

## 5. Step 2 — Apple Developer & App Store Connect (iOS)

### 5.1 What you need

- Apple ID
- Credit/debit card (~99 USD/year fee)
- Mac with Xcode (for building later)

### 5.2 Register Apple Developer Program

1. Open [https://developer.apple.com/programs/enroll/](https://developer.apple.com/programs/enroll/)
2. Sign in with Apple ID → **Enroll** → choose Individual or Organization.
3. Fill information, pay, wait for Apple approval (hours to days).
4. When status is **Active**, go to [https://developer.apple.com/account](https://developer.apple.com/account).

**Expected outcome:** Membership status = **Active**.

### 5.3 Create Bundle ID (Identifiers)

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list).
2. **Identifiers** → **+** → **App IDs** → **App**.
3. Description: `LingoBites Staging` (optional).
4. Bundle ID: **Explicit** → enter ID from Step 1 (e.g. `com.yourcompany.lingobites.staging`).
5. Capabilities: enable if needed (Phase 0 usually no Push, Sign in with Apple).
6. Repeat for production Bundle ID.

**Expected outcome:** 2 App IDs in Identifiers list.

### 5.4 Create app record on App Store Connect

1. Open [https://appstoreconnect.apple.com](https://appstoreconnect.apple.com).
2. **Apps** → **+** → **New App**.
3. Platform: iOS. Name: `LingoBites` (or finalized name). Primary language: Vietnamese or English.
4. Bundle ID: select production ID (official store app uses prod; staging may be separate app or TestFlight only — team decides, but ID must match build).
5. SKU: any internal code, e.g. `lingobites-001`.

**Expected outcome:** App appears in App Store Connect with "Prepare for Submission" status.

### 5.5 TestFlight — tester groups (after build available)

1. App Store Connect → app → **TestFlight**.
2. **Internal Testing**: add team member emails (per Apple policy limit).
3. **External Testing**: create Closed beta group, add tester emails (may need Beta App Review first time).

**Expected outcome:** At least one tester group and email list.

### 5.6 Store info to fill early (can be draft)

| Field | Suggestion | Notes |
|---|---|---|
| Category | **Education** | |
| Age rating | Complete questionnaire in Connect | Declare correctly if user-generated content (images/text) |
| Privacy Policy URL | URL from Step 4 | Required before external TestFlight / public |
| Support URL | URL or page with email | |
| Camera usage | Copy in `Info.plist` | See `01-release-production-readiness.md` § Permission copy |
| Photo library usage | Copy in `Info.plist` | |

**Common mistakes:**

- Xcode build Bundle ID **does not match** App Store Connect → upload fails.
- **Agreements** not accepted in App Store Connect → cannot upload.
- Using free Apple ID instead of **paid Developer Program** → no TestFlight.

---

## 6. Step 3 — Google Play Console (Android)

### 6.1 What you need

- Google account
- One-time ~25 USD registration fee
- Keystore file (created in Step 10)

### 6.2 Create developer account

1. Open [https://play.google.com/console/signup](https://play.google.com/console/signup).
2. Choose account type (individual / organization), fill info, pay.
3. Complete **Identity verification** if Google requires.

**Expected outcome:** Can access Play Console dashboard.

### 6.3 Create app

1. **All apps** → **Create app**.
2. App name, default language, App / Game → **App**.
3. Declare paid / ads or not (Phase 0 usually: no).

**Expected outcome:** App in setup checklist state (many items incomplete — normal).

### 6.4 Package name

- Package name **cannot change** after app creation.
- Enter correct production package from Step 1 (e.g. `com.yourcompany.lingobites`).
- Staging: create **second Play app** with `.staging` package OR use **Internal testing** with same package — team decides; recommend separate staging app to separate analytics.

### 6.5 Testing tracks (recommended order)

| Track | Purpose | When |
|---|---|---|
| **Internal testing** | Internal team, fast publish | Right after first build |
| **Closed testing** | 20–100 testers via link/email | After internal QA P0 |
| **Open testing / Production** | Public beta | After closed beta stable |

**Create Internal testing:**

1. **Testing** → **Internal testing** → **Create new release**.
2. Upload AAB (after build) → **Save** → **Review release** → **Start rollout**.

**Expected outcome:** Internal testing track ready to receive `.aab` file.

### 6.6 Data Safety form (fill before public, draft early)

Declare **actual** Phase 0 app behavior:

| Data | Yes/No | Declaration detail |
|---|---|---|
| User-captured/selected photos | **Yes** | Sent to server for OCR; not stored long-term by default |
| User text | **Yes** | OCR text / paste text; sent to AI after user confirms |
| Crash logs | **Yes** if Crashlytics enabled | Metadata, no raw lesson text |
| Analytics | **Yes** if enabled | Event metadata only |
| Login account | **No** Phase 0 | No mandatory login |

**Do not** select "no data collected" if app sends images/text to backend/provider.

**Common mistakes:**

- Lose keystore → cannot update app. **Backup immediately** when created (Step 10).
- Data Safety does not match app → rejection or policy violation report.

---

## 7. Step 4 — Domain, Privacy Policy, and Support

### 7.1 Buy domain

1. Choose registrar (Namecheap, Cloudflare, Google Domains, etc.).
2. Register domain e.g. `lingobites.com` or subdomain of existing domain.
3. Enable HTTPS (Cloudflare or free static hosting: GitHub Pages, Netlify, Vercel).

**Expected outcome:** `https://yourdomain.com` loads (temporary blank page OK).

### 7.2 Minimum Privacy Policy page

Page must clearly state (Vietnamese, easy to understand):

1. What app does (photo/image/text → lesson).
2. What data is processed (images, user-provided text).
3. Where data is sent (backend, OCR provider, AI provider — **commercial names not required** if not finalized, but must say "third-party AI/OCR service providers").
4. No sale of personal data (if true).
5. Storage: lessons saved **on device**; images not stored on server by default.
6. Deletion rights: user deletes lessons / local data in app.
7. Contact: support email.

**Expected outcome:** Privacy URL loads over HTTPS, ready to paste into App Store Connect and Play Console.

### 7.3 Support page (minimum)

- Simple HTML page: what app is, 3–5 FAQ items, contact email.
- Or use `mailto:support@...` if store accepts (Apple usually needs URL).

---

## 8. Step 5 — Environment model (local / staging / production)

### 8.1 Three environments

| Env | Who uses | Backend API | Provider keys | App build |
|---|---|---|---|---|
| `local` | Dev on machine | `http://localhost:3000` or mock | Mock or limited dev key | Debug build |
| `staging` | Team + closed beta | `https://api-staging.yourdomain.com` | Staging keys, low quota | TestFlight / Internal track |
| `production` | Real users, public beta | `https://api.yourdomain.com` | Production keys + budget alert | Store production |

### 8.2 Mandatory rules

- **Do not** use production AI/OCR keys on dev machine daily.
- **Do not** point store release app to staging API.
- Real `.env` files **not** committed to git — only commit `.env.example`.
- Each environment: **separate Firebase project** (recommended) and **separate provider API keys**.

### 8.3 Dev machine env files (example)

**Mobile** — create `.env.staging` (do not commit):

```text
API_BASE_URL=https://api-staging.yourdomain.com
USE_MOCK_AI=false
USE_MOCK_OCR=false
ENABLE_TTS=true
ENABLE_PRACTICE=true
MAX_TEXT_LENGTH=3000
APP_ENV=staging
```

**Backend** — create local `.env` (do not commit):

```text
NODE_ENV=development
PORT=3000
API_PUBLIC_BASE_URL=http://localhost:3000
APP_ENV=local
AI_PROVIDER=openai
AI_API_KEY=sk-...-dev-only
AI_MODEL=gpt-4o-mini
OCR_PROVIDER=google-vision
OCR_API_KEY=...
MAX_TEXT_LENGTH=3000
MAX_IMAGE_BYTES=5242880
LOG_SENSITIVE_CONTENT=false
RATE_LIMIT_ENABLED=true
BUDGET_ALERT_USD=20
```

Provider and model **finalize per** `02-technical/04-ai-ocr-integration.md` — do not guess AI output schema.

---

## 9. Step 6 — Backend hosting (staging)

### 9.1 Choose platform

| Platform | Pros for beginners | Cons |
|---|---|---|
| [Render](https://render.com) | Free tier, simple GitHub deploy | Free tier cold start |
| [Railway](https://railway.app) | Easy UI, clear env secrets | Limited credits |
| [Fly.io](https://fly.io) | Close to users, good scale | More technical setup |
| VPS (DigitalOcean, etc.) | Full control | Self-manage HTTPS, OS updates |

**Recommendation for small closed beta:** Render or Railway.

### 9.2 Staging deploy checklist (general flow)

- [ ] Backend repo has Dockerfile or start command: `node dist/server.js` / `npm start`.
- [ ] Create new **Web Service** on hosting.
- [ ] Connect GitHub repo → branch `main` or `release/staging`.
- [ ] Set **Environment Variables** (copy from section 9.3 — **do not** paste in chat/public).
- [ ] Region near users (Singapore / Tokyo if available).
- [ ] Deploy → wait for green build.
- [ ] Assign domain: `api-staging.yourdomain.com` → CNAME to hosting URL.
- [ ] Enable HTTPS (Let's Encrypt automatic on most PaaS).

### 9.3 Backend environment variables (staging)

Required on hosting dashboard:

```text
NODE_ENV=production
PORT=3000
API_PUBLIC_BASE_URL=https://api-staging.yourdomain.com
APP_ENV=staging
AI_PROVIDER=<finalized>
AI_API_KEY=<staging key>
AI_MODEL=<finalized>
OCR_PROVIDER=<finalized>
OCR_API_KEY=<staging key>
MAX_TEXT_LENGTH=3000
MAX_IMAGE_BYTES=5242880
LOG_SENSITIVE_CONTENT=false
RATE_LIMIT_ENABLED=true
BUDGET_ALERT_USD=50
```

Optional for beta:

```text
CRASH_REPORTING_DSN=
ANALYTICS_WRITE_KEY=
```

### 9.4 Post-deploy verification

Run on dev machine:

```bash
curl -s https://api-staging.yourdomain.com/health
```

**Expected outcome:** JSON reports healthy (per Fastify implementation in repo).

Next (when backend routes exist):

```bash
# Test only when implemented — use short text, no sensitive data
curl -s -X POST https://api-staging.yourdomain.com/v1/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"confirmed_text":"Hello world.","source_type":"paste"}'
```

**Operations checklist:**

- [ ] HTTPS works, no mixed HTTP.
- [ ] Hosting logs **do not** print full user/image text.
- [ ] Rate limit enabled.
- [ ] Image upload blocked if > `MAX_IMAGE_BYTES`.
- [ ] Budget alert email enabled at provider.

**Do not** open closed beta if API only runs on `localhost`.

---

## 10. Step 7 — AI provider (LLM)

### 10.1 Tasks (provider-agnostic)

- [ ] Create developer account at finalized provider (`02-technical/04-ai-ocr-integration.md`).
- [ ] Add payment / prepaid if required.
- [ ] Create **API key A** — label `scan-learn-staging` — staging only.
- [ ] Create **API key B** — `scan-learn-production` — only after closed beta.
- [ ] Finalize **model** supporting JSON / structured output per spec.
- [ ] Set **spending limit** or alert (email at threshold).
- [ ] Store keys in **hosting secret manager** — not public Slack/email.

### 10.2 Required tests before closed beta

- [ ] Call `/v1/ai/analyze` with short English sentence → response passes `validateAIOutput()`.
- [ ] Test fixture `docs/01-ba/01-schema/fixtures/invalid-missing-field.json` → backend retries once, mobile does not crash.
- [ ] Text > `MAX_TEXT_LENGTH` → clear error, provider not called.
- [ ] Wrong key / quota exhausted → standard error code, **no** key leak in response.

### 10.3 Cost and control

- Estimate: closed beta 50 users × few lessons/day — set staging cap (e.g. 30–50 USD/month).
- Have **one person** receive provider and hosting alert emails.

---

## 11. Step 8 — OCR provider

### 11.1 Tasks

- [ ] Create account at finalized OCR provider.
- [ ] Staging + production keys (separate like AI).
- [ ] Enable Vision/OCR API (some clouds require billing first).
- [ ] Finalize supported formats: JPEG, PNG; HEIC if provider and app support.

### 11.2 Required tests

- [ ] **20 real sample images**: books, menus, slides, slightly blurry — record usable rate.
- [ ] Image > 5MB (or `MAX_IMAGE_BYTES`) → `IMAGE_TOO_LARGE`, provider not called.
- [ ] OCR fail → app has retry and/or paste text fallback (QA `01-qa-test-plan.md`).
- [ ] Temp images on server deleted after processing (if backend uses temp files).

---

## 12. Step 9 — Firebase (Crashlytics / Analytics)

Firebase **not absolutely required** but **recommended** for closed beta to see crashes from tester devices.

### 12.1 Create project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com).
2. **Add project** → name `scan-learn-english-staging`.
3. Disable Google Analytics at creation **or** enable if Analytics wanted now (can enable later).
4. Repeat project `scan-learn-english-prod` when preparing public beta.

### 12.2 Add iOS app

1. Staging project → **Add app** → iOS.
2. Bundle ID: **exact match** staging Bundle ID.
3. Download `GoogleService-Info.plist`.
4. Mobile dev places file in correct Xcode target (per React Native Firebase guide in repo).
5. **Do not** commit file to public repo if team policy forbids — or commit if only public client config (no private key).

### 12.3 Add Android app

1. **Add app** → Android.
2. Package name: match staging package.
3. Download `google-services.json` → place in `android/app/`.
4. SHA-1: add debug and release fingerprint (Play App Signing) if using Google Sign-In later; basic Crashlytics works without immediately.

### 12.4 Enable services

| Service | Steps | Phase 0 |
|---|---|---|
| **Crashlytics** | Build → Crashlytics → Enable | **Enable** closed beta |
| **Analytics** | Analytics → Enable | **Enable** if M5; metadata events only |
| **Remote Config** | Optional | Light feature flags |
| **Cloud Messaging** | — | **Defer** (no push yet) |
| **Firestore / Auth** | — | **Defer** (local-first, no login) |

### 12.5 Firebase rules

- Separate plist/json files **staging vs prod** — do not mix projects.
- **Firebase service account JSON** (private key) is secret — backend/CI only, not mobile.
- Custom log / analytics: **do not** send raw OCR text, confirmed text, full AI output.

**Expected outcome:** Staging build on real device → within minutes see session in Firebase DebugView / Crashlytics (or test crash appears).

---

## 13. Step 10 — Mobile env configuration

### 13.1 Variables allowed on mobile

`.env.example` file (commit to git):

```text
API_BASE_URL=
USE_MOCK_AI=false
USE_MOCK_OCR=false
ENABLE_TTS=true
ENABLE_PRACTICE=true
MAX_TEXT_LENGTH=3000
APP_ENV=staging
```

### 13.2 Variables NOT allowed on mobile

```text
AI_API_KEY
OCR_API_KEY
FIREBASE_SERVICE_ACCOUNT
APPLE_API_KEY
GOOGLE_PLAY_SERVICE_ACCOUNT
```

If these names appear in mobile `.env` → **security blocker**.

### 13.3 Set per build

1. Install `react-native-config` (per implementation plan).
2. Create `.env.staging`, `.env.production` locally.
3. Staging build points `API_BASE_URL` to staging HTTPS.
4. CI/release: inject env from secret store, no hard-coding in source.

**Check:** Open staging app → network log only shows requests to `api-staging...`, not OpenAI/Google Vision domains directly.

---

## 14. Step 11 — Signing & build

### 14.1 iOS checklist

- [ ] Staging/prod Bundle IDs created on Developer Portal.
- [ ] Xcode → **Signing & Capabilities** → correct Team, **Automatically manage signing** (or manual cert per team policy).
- [ ] `Info.plist` has `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription` (Vietnamese copy from `01-release-production-readiness.md`).
- [ ] Version (`CFBundleShortVersionString`) and build number (`CFBundleVersion`) increment each upload.
- [ ] **Archive** → **Distribute** → App Store Connect → upload success.
- [ ] Build appears in TestFlight (processing 5–30 minutes).

**Backup:** Export distribution cert / record team ID if manual signing.

### 14.2 Android checklist

- [ ] `applicationId` matches Play Console.
- [ ] Create keystore (one time):

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore scan-learn-release.keystore \
  -alias scan-learn -keyalg RSA -keysize 2048 -validity 10000
```

- [ ] Store keystore + passwords in **password manager / vault** — loss = cannot update app.
- [ ] `android/gradle.properties` or CI secret: `MYAPP_UPLOAD_STORE_FILE`, passwords (do not commit).
- [ ] Enable **Play App Signing** (Google holds release key).
- [ ] Build AAB: `./gradlew bundleRelease` (or repo script).
- [ ] Upload AAB to Internal testing.

**Check:** Install build on real device → open app → core flow works.

---

## 15. Step 12 — Release assets (icon, screenshot, copy)

| Asset | Internal | Closed beta | Public beta |
|---|---|---|---|
| App icon 1024×1024 | Placeholder OK | Temporary polished version | Final version |
| Splash | Optional | Recommended | Required |
| Screenshots | Not needed for store | Internal OK | **Required** — see `03-store-listing-design-assets.md` |
| Privacy URL | Recommended | **Required** | **Required** |
| Support email/URL | Recommended | **Required** | **Required** |
| Store description | — | Draft | Final |
| Terms / AI disclaimer | Draft | Required | Required |

**Minimum public beta screenshots:** 6 screens per plan in `03-store-listing-design-assets.md` (home, OCR review, translation, sentences, vocab/grammar, history).

---

## 16. Step 13 — Internal test before closed beta

On **at least 1 iPhone + 1 Android** real device.

- [ ] Paste text → lesson → render all sections, no crash with `valid-minimal.json`.
- [ ] Capture/select image → OCR → **edit text** → confirm → AI lesson.
- [ ] AI invalid → retry, no crash (test backend/mock invalid fixture).
- [ ] Save lesson → reopen **does not** call AI again.
- [ ] Delete local data / delete lesson works.
- [ ] Privacy note shown in app.
- [ ] Network loss / API error → loading + error + retry.
- [ ] QA P0 in `01-qa-test-plan.md` passes.

---

## 17. Pre-flight checklist — Closed beta

Print/check before inviting testers:

**Application**

- [ ] App runs on iOS (TestFlight) and Android (Closed/Internal track).
- [ ] Correct staging API, not mock (except intentional test flags).
- [ ] Crashlytics receives crashes/sessions.
- [ ] Analytics metadata (if enabled) contains no raw text.

**Backend & security**

- [ ] `https://api-staging.../health` OK.
- [ ] AI/OCR keys **only** on hosting env.
- [ ] Rate limit + max body size working.
- [ ] Provider budget alert set.
- [ ] Log review: no full text / API key.

**Store & legal**

- [ ] Privacy Policy URL live.
- [ ] Support email working.
- [ ] Tester list + feedback channel (form, group chat, email).

**QA**

- [ ] QA P0 pass.
- [ ] OCR fail has paste fallback.
- [ ] Saved lesson does not call AI again.

**People**

- [ ] Someone on call to monitor crashes and API cost in first 48h of beta.

---

## 18. Pre-flight checklist — Public beta

Only after closed beta is stable:

- [ ] P0/P1 from closed beta resolved or have workaround.
- [ ] Privacy Policy updated if flow changed.
- [ ] Data Safety / Apple privacy nutrition **matches** actual app.
- [ ] Screenshots, icon, store description final (`03-store-listing-design-assets.md`).
- [ ] Backend **production** fully separated from staging (URL, keys, Firebase prod).
- [ ] Production keys + budget alert + quota.
- [ ] Monitoring has daily watcher.
- [ ] Rollback plan: disable `USE_MOCK_*` reverse, feature flags, or temporary OCR/AI suspension notice if provider down.

---

## 19. Account & service summary table

| Account / Service | Required when | Starting URL | Owner |
|---|---|---|---|
| Apple Developer | iOS beta | [developer.apple.com/programs](https://developer.apple.com/programs) | Release owner |
| App Store Connect | iOS beta | [appstoreconnect.apple.com](https://appstoreconnect.apple.com) | Release owner |
| Google Play Console | Android beta | [play.google.com/console](https://play.google.com/console) | Release owner |
| Domain registrar | Public beta | (Namecheap, Cloudflare, …) | Product/DevOps |
| Backend hosting | M2+ real AI | Render / Railway / Fly | Backend/DevOps |
| AI provider | M2 | Per `04-ai-ocr-integration.md` | Backend/DevOps |
| OCR provider | M3 | Per `04-ai-ocr-integration.md` | Backend/DevOps |
| Firebase | M5 / beta | [console.firebase.google.com](https://console.firebase.google.com) | Mobile/DevOps |
| Support email | Closed beta+ | Gmail / domain email | Product |
| Git / CI | Regular release | GitHub Actions, etc. | Tech Lead |

---

## 20. Common troubleshooting

| Symptom | Common cause | Fix |
|---|---|---|
| TestFlight "Processing" forever | Build symbol error / Apple delay | Check App Store Connect email; verify export compliance |
| Play upload signing error | Wrong keystore or package name | Match `applicationId` and upload key |
| App cannot call API | Wrong `API_BASE_URL`, iOS ATS blocks HTTP | Use HTTPS; verify `.env` for correct build flavor |
| 401/403 from backend | Missing header, rate limit | Check backend metadata logs |
| AI always fails | Staging key quota exhausted / wrong model | Provider dashboard; test curl directly to backend |
| OCR returns empty | Blurry image, wrong format | Test 20 sample images; guide user to capture clearly |
| Crashlytics no data | Wrong `GoogleService-Info.plist` / not enabled | Bundle ID match; release build uploads dSYM (iOS) |
| Store privacy rejection | Dead URL or missing image/text declaration | Fix policy + Data Safety form |

---

## 21. Deferred for Phase 0

Do not set up early — avoid scope creep:

- Mandatory account/login, Firestore user DB.
- Multi-device cloud sync.
- Real payment / subscription.
- Push notification (FCM).
- Speaking score / microphone permission.
- Full admin dashboard.
- Full-screen session replay.

---

## 22. One-page summary (quick reference)

```text
□ App name + 4 IDs (iOS/Android × staging/prod)
□ Apple Developer Active + App Store Connect app
□ Play Console app + Internal track
□ Domain + Privacy URL HTTPS + support email
□ Backend staging HTTPS + /health + secrets set
□ AI key staging + OCR key staging + budget alert
□ Firebase staging + plist/json in app
□ Mobile .env only API_BASE_URL + flags (NO AI/OCR key)
□ iOS Archive → TestFlight | Android AAB → Internal testing
□ QA P0 + privacy note in app
□ Closed beta → feedback → production env + store assets → public beta
```

When each box is complete, cross-check `01-release-production-readiness.md` § Release blockers before inviting users outside the team.
