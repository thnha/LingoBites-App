# Security, Key & Data Protection — Phase 0

## 1. Purpose

This document is a practical security checklist for Phase 0, focused on:

- Protecting OCR/AI/API keys.
- Not exposing sensitive image/text data.
- Secure backend proxy.
- Logging/analytics without raw content.
- Readiness before closed beta/public beta.

Does not replace `03-ai-key-strategy-byok-paid-managed.md`; that file covers BYOK/paid managed AI specifically. This file covers broader security baseline.

---

## 2. Mandatory principles

| Principle | Decision |
|---|---|
| Mobile does not contain system OCR/AI keys | All OCR/AI calls go through backend proxy |
| Backend holds secrets | Use env/secret manager, no hard-coding |
| No raw content logging | Do not log images, full OCR text, confirmed text, full AI output |
| User confirms before AI | OCR text sent to AI only after user confirms |
| Saved lesson does not call AI again | Open lesson from local `ai_output_json` |
| Errors do not leak secrets | Do not return stack trace/provider token to mobile |
| HTTPS required | Closed/public beta uses HTTPS endpoint |

---

## 3. Key inventory

| Secret / Key | Where it lives | Must NOT live in | Notes |
|---|---|---|---|
| `AI_API_KEY` system | Backend secret manager / hosting env | Mobile app, git, analytics, crash log | For trial/paid/internal |
| `OCR_API_KEY` | Backend secret manager / hosting env | Mobile app, git | For `/v1/ocr` |
| Analytics write key | Mobile env if public client key; backend env if secret | Git if secret | Distinguish public token vs secret token |
| Crash reporting config | Mobile config if SDK requires | Git if contains private key | Google/Firebase config usually not secret, but service account is |
| Firebase service account | Backend secret manager | Mobile app, git | Server-side only if Admin SDK needed |
| Store signing key / keystore | Build machine/CI secret storage | Git, docs | Requires safe backup |
| Apple API key / App Store Connect key | CI secret storage | Git, mobile app | Release automation only |
| BYOK user key Phase 0 | Mobile secure storage or backend encrypted vault | Logs, analytics, plaintext DB | See `03-ai-key-strategy-byok-paid-managed.md` |

---

## 4. Mobile security checklist

| Checklist | Required state |
|---|---|
| No `AI_API_KEY` / `OCR_API_KEY` in mobile `.env` | Mobile only knows `API_BASE_URL` |
| Use `react-native-config` for non-sensitive config | Do not commit real `.env` |
| If storing BYOK key locally | Use secure storage/keychain, not AsyncStorage |
| No text/image logging in production debug | Disable console/raw content logs in release build |
| Clear permission copy | Camera/photo used only for OCR purpose |
| Delete local data | User can delete saved lessons/local data |
| Crash logs without raw content | Do not attach request body with text/AI output |

---

## 5. Backend security checklist

| Checklist | Required state |
|---|---|
| HTTPS | Required for beta outside local machine |
| Request size limit | Reject oversized images, overly long text |
| Rate limit | Per anonymous user id/IP/available device signal |
| Input validation | Validate request body, source type, platform, max length |
| AI output validation | `validateAIOutput()` before returning success |
| Secret storage | Hosting secret/env, no hard-coding |
| Error handling | Do not return stack trace/provider raw error containing secret |
| Logging | Metadata only: request id, status, duration, error code, token usage, char count |
| Temp file cleanup | Uploaded images deleted after OCR if using temp files |
| CORS/access policy | Open only as needed for API, no careless wildcard if web client exists |

---

## 6. Logging & analytics policy

Do not log:

- Original images.
- Full OCR text.
- Full confirmed text.
- Full AI output.
- API key or token.
- User-provided BYOK key.

Allowed to log:

- `request_id`
- anonymous user id
- status/error code
- provider/model name
- duration
- token usage
- text length bucket
- image size bucket
- app version/platform

Pre-beta check rule:

```text
Search all log/event payload debug output → no raw sentence/user text/API key found.
```

---

## 7. Data handling & retention

| Data | Phase 0 handling |
|---|---|
| Uploaded image | Sent temporarily to backend OCR; not stored by default; temp file deleted after processing |
| OCR raw text | Shown for user edit; not sent to AI before confirm |
| Confirmed text | Sent to AI to create lesson; full text not logged |
| AI output | Validate, render, save local if user saves; full output not logged |
| Saved lesson | Local-first on device |
| Analytics | Metadata only |
| Backend logs | Short retention, no raw content |

Public beta recommendation: define clear log retention, e.g. 7–30 days depending on hosting/tool.

---

## 8. BYOK security baseline

If BYOK is enabled:

- User must know their key may incur provider charges.
- App uses key only when user taps generate/analyze.
- Key displayed masked.
- Delete key button available.
- Do not log key.
- If key sent from mobile to backend per request, HTTPS required.
- If stored on backend, encrypted at rest and key deletion plan required.

Phase 0 local-first default: BYOK key stored in mobile secure storage if no account yet.

---

## 9. Security exit criteria

### Internal build

- [ ] No system key in mobile source/config.
- [ ] `.env.example` does not contain real secrets.
- [ ] Invalid AI output does not crash.
- [ ] Saved lesson reopen does not call AI.

### Closed beta

- [ ] Backend HTTPS.
- [ ] Basic rate limit.
- [ ] No raw content logging.
- [ ] Crash reporting does not send raw text/AI output.
- [ ] Privacy note in app.
- [ ] Way to delete local data.
- [ ] Provider keys in hosting secret/env.

### Public beta

- [ ] Privacy policy public URL.
- [ ] Store data safety declared correctly.
- [ ] Budget alert for AI/OCR.
- [ ] Clear log retention policy.
- [ ] Release signing key/keystore safely backed up.
- [ ] Key rotation process if exposed.

---

## 10. Key rotation checklist

When key exposure is suspected:

1. Disable or revoke key at provider.
2. Create new key.
3. Update secret manager/hosting env.
4. Redeploy backend.
5. Verify requests succeed.
6. Verify logs no longer contain old key.
7. Record incident note: time, key, scope, actions taken.
