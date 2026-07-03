# Release & Production Readiness — Phase 0

## 1. Purpose

This document defines the conditions for **LingoBites Phase 0** to ship as internal beta, closed beta, or public beta.

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
| App name | LingoBites or finalized name |
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
