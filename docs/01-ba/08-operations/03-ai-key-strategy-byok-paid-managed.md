# AI Key Strategy — BYOK + Paid Managed Mode

## 1. Objectives

Reduce AI cost for the system while keeping a simple experience for paying users.

Proposed design:

```text
Free user: can provide their own API key (BYOK — Bring Your Own Key)
Paid user: uses system AI key, no personal token required
Trial user: uses small quota from system AI key
```

Core principle unchanged: mobile does not call AI provider directly; all AI requests still go through backend proxy for schema validation, retry, safe logging, and rate limiting.

---

## 2. User model

| User group | API key | Experience | Who pays AI cost |
|---|---|---|---|
| Free, no key | None | View demo/mock only or guided to enter key | No cost incurred |
| Free, BYOK | User-provided key | Generate real lesson via backend proxy | User pays provider |
| Trial | System key with small quota | Try a few lessons | System |
| Paid | System key | Generate lesson without knowing token | System |
| Internal/test | Mock or limited system key | Test provider/schema | System if using real AI |

---

## 3. Proposed data flow

### BYOK user

```text
Mobile
  → send confirmed_text + auth/session/anonymous id
  → Backend proxy
  → retrieve encrypted user credential or receive ephemeral key from client
  → call AI provider with user key
  → validateAIOutput()
  → return lesson result
```

### Paid user

```text
Mobile
  → send confirmed_text + paid entitlement
  → Backend proxy
  → check entitlement/quota
  → call AI provider with system key
  → validateAIOutput()
  → return lesson result
```

Backend always responsible for:

- validate request length
- select correct credential
- call provider
- retry invalid output at most once
- not log raw text/API key/full AI output
- return standard error codes

---

## 4. Credential selection rules

| Condition | Credential used | If unavailable |
|---|---|---|
| Paid user with remaining quota | System AI key | Report quota exhausted or request upgrade |
| Trial with remaining quota | System AI key | Switch to BYOK or paid |
| Free user with valid BYOK key | User AI key | Report invalid key if provider rejects |
| Free user without BYOK key | Do not call real AI | Show key setup or demo sample |

Pseudo logic:

```ts
if (user.isPaid && quota.remaining > 0) return systemCredential;
if (user.isTrial && trial.remaining > 0) return systemCredential;
if (user.hasUserProvidedKey) return userCredential;
return { error: "AI_KEY_REQUIRED" };
```

---

## 5. Security

| Risk | Mandatory rule |
|---|---|
| System key exposure | System key only in backend env/secret manager, never sent to mobile |
| User key in logs | Do not log API key; mask when displaying: `sk-...abcd` |
| Plaintext key storage | Do not store plaintext in database |
| Unintended user key use | Use only when user taps generate/analyze |
| Invalid key/quota exhausted | Friendly error, no infinite retry |
| Paid key abuse | Rate limit, quota, budget alert, request cap |
| Provider error leak | Do not return stack trace/provider secret to mobile |

### Where to store API keys?

| Approach | Pros | Cons | Recommendation |
|---|---|---|---|
| Backend encrypted storage | Easier multi-device later, mobile does not hold key long | Requires good encryption/key management | Good for apps with accounts |
| Mobile secure storage then send temporarily on generate | Less backend responsibility | Mobile sends key over network each request; hard for multi-device | Acceptable for Phase 0 local-first |
| No storage, user enters each time | Safer storage-wise | Poor UX | Not recommended |

Phase 0 without login: mobile secure storage for BYOK is simplest. When accounts/sync exist, migrate to backend encrypted storage.

---

## 6. BYOK setup UX

Suggested screen: **AI Configuration** (Cấu hình AI)

| Component | Content |
|---|---|
| Provider picker | OpenAI first; other providers later |
| API key input | Password field, paste-friendly |
| Test connection | Call backend to verify key with small request |
| Status | `Đã kết nối`, `Key không hợp lệ`, `Provider hết quota` |
| Help link | Link to API key creation guide |
| Delete key | Remove key from secure storage |
| Paid CTA | `Nâng cấp để dùng AI của hệ thống, không cần API key` |

Short copy:

```text
Bạn có thể dùng API key riêng để tự trả chi phí AI. Nếu nâng cấp gói trả phí, ứng dụng sẽ dùng AI của hệ thống và bạn không cần tự cấu hình key.
```

---

## 7. Additional error codes

| Code | When it occurs | UX |
|---|---|---|
| `AI_KEY_REQUIRED` | Free user has no BYOK and no trial quota | Open AI Configuration screen or suggest upgrade |
| `AI_KEY_INVALID` | Provider rejects key | Allow edit/delete key |
| `AI_KEY_QUOTA_EXCEEDED` | User key quota exhausted/provider billing error | Explain this is provider quota |
| `MANAGED_AI_QUOTA_EXCEEDED` | Paid/trial in-app quota exhausted | Wait for reset or upgrade |
| `AI_PROVIDER_UNAUTHORIZED` | Credential not accepted by provider | No infinite retry |

---

## 8. Cost control for paid managed mode

| Guardrail | Suggested value |
|---|---|
| Trial quota | 5–10 lessons/user |
| Paid daily cap | 50–200 lessons/user/day depending on plan |
| Max text length | 3,000 characters |
| AI retry | At most 1 |
| Monthly app budget alert | 20, 50, 100 USD during closed beta |
| Per-user anomaly alert | Abnormal request volume in short time |
| Saved lesson reopen | Do not call AI again |

---

## 9. Items to document in privacy/terms

| Content | Reason |
|---|---|
| User may provide their own API key | Transparency about BYOK |
| API key used only to call AI when user requests lesson generation | Reduce misuse concerns |
| App does not sell/share API keys | Trust |
| With BYOK, AI cost billed directly by provider to user | Avoid billing confusion |
| For paid users, app uses system AI infrastructure | Transparency about managed mode |

---

## 10. Milestone implementation recommendations

| Milestone | Scope |
|---|---|
| M1 | Mock AI only, BYOK not needed yet |
| M2 | Backend supports credential resolver but may use system key internal only |
| M3 | OCR independent of BYOK; still use system provider or separate provider later |
| M4 | Save key/config state locally if no account yet |
| M5 | Add AI Configuration screen, error codes, quota, budget alert |
| After Phase 0 | Paid entitlement, subscription, backend encrypted key vault if accounts exist |

---

## 11. Default decisions

| Topic | Decision |
|---|---|
| Mobile calls AI directly? | No |
| Free user must have API key? | Not required to open app, but BYOK or trial quota needed for real AI |
| Paid user needs API key? | No |
| Where is system key? | Backend env/secret manager |
| Where is user BYOK Phase 0? | Mobile secure storage if no account |
| Where is user BYOK with account? | Backend encrypted storage |
| Log API key? | Never |
