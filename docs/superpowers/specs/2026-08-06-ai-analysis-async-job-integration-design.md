# AI Analysis Async Job — Client Integration Design

Date: 2026-08-06

## Scope

This design replaces the app's synchronous `POST /v1/ai/analyze` call with the
new async job API (`POST /v1/ai/analyses` + `GET /v1/ai/analyses/:analysis_id`)
documented in `LingoBites-Server/docs/01-ba/02-technical/14-ai-analysis-async-job-client-integration-guide.md`.
It also replaces `AnalyzingScreen`'s fake, timer-driven progress simulation
with real stage-by-stage progress from the poll response.

Out of scope: cancel endpoint, SSE/streaming, partial content before
completion — none of these exist server-side yet per the source doc. Also out
of scope: any client-side feature flag to switch between sync/async (the sync
path is being removed, not made optional), and any special handling for app
backgrounding during polling.

## Source of truth

`LingoBites-Server/docs/01-ba/02-technical/14-ai-analysis-async-job-client-integration-guide.md`.
If this spec and that doc disagree, the doc wins.

## Current state (being replaced)

- `src/shared/api/analyzeClient.ts` — `analyzeTextWithApi()`, a single blocking
  `fetch` to `POST /v1/ai/analyze`.
- `src/modules/ai-analysis/AIAnalysisService.ts` — `analyzeText()`, switches
  between `analyzeTextWithApi` (real) and `analyzeTextWithMock` (mock), adds
  analytics events.
- `src/modules/ai-analysis/AnalyzingScreen.tsx` — awaits `analyzeText()` while
  showing a 3-step list that ticks on a fixed timer and carries progress to a
  random cap (91–96%) until the real result arrives, since the sync API never
  returned real progress.
- `src/modules/ai-analysis/MockAIAnalysisService.ts` — resolves immediately
  with fixture data.

`analyzeClient.ts` and its test are deleted as part of this change — once the
async path fully replaces the sync call in-app, the sync client is dead code.

## Architecture

```
AnalyzingScreen
   └─ analyzeText(text, options, onProgress)      [AIAnalysisService.ts]
        ├─ useMockAi=true  → simulateAnalysisJob() [MockAIAnalysisService.ts]
        └─ useMockAi=false → runAnalysisJob()      [analysisJobClient.ts, new]
             ├─ POST /v1/ai/analyses  (Idempotency-Key header)
             └─ poll status_url every ~1.5s until completed/failed/give-up
                   → onProgress({percent, stage, message}) per poll
```

`AIAnalysisService.analyzeText()` remains the seam the UI depends on — it
doesn't matter to `AnalyzingScreen` whether progress updates come from a real
poll loop or the mock's simulated one; both go through the same
`AnalysisProgressCallback` shape.

### Files

New:
- `src/shared/api/analysisJobClient.ts` — create+poll orchestration.
- `src/shared/api/__tests__/analysisJobClient.test.ts`

Edited:
- `src/shared/api/types.ts` — new request/response types, extended `ApiErrorCode`.
- `src/modules/ai-analysis/types.ts` — `AnalysisProgress`, `AnalysisProgressCallback`.
- `src/modules/ai-analysis/AIAnalysisService.ts` — call `runAnalysisJob` instead of `analyzeTextWithApi`; thread progress callback through.
- `src/modules/ai-analysis/MockAIAnalysisService.ts` — simulate the 6 staged progress updates before resolving.
- `src/modules/ai-analysis/AnalyzingScreen.tsx` — render real stages/percent/message instead of the fake timer.
- `src/modules/ai-analysis/__tests__/AIAnalysisService.test.ts`
- `src/modules/ai-analysis/__tests__/MockAIAnalysisService.test.ts`
- `src/modules/ai-analysis/__tests__/AnalyzingScreen.test.tsx`

Deleted:
- `src/shared/api/analyzeClient.ts`
- `src/shared/api/__tests__/analyzeClient.test.ts`

## Data flow & types

`src/shared/api/types.ts` additions:

```ts
export type ApiErrorCode =
  | 'VALIDATION_EMPTY_TEXT'
  | 'VALIDATION_TEXT_TOO_LONG'
  | 'VALIDATION_MISSING_IDEMPOTENCY_KEY'
  | 'IDEMPOTENCY_CONFLICT'
  | 'IMAGE_TOO_LARGE'
  | 'OCR_NO_TEXT'
  | 'OCR_PROVIDER_ERROR'
  | 'AI_TIMEOUT'
  | 'AI_INVALID_OUTPUT'
  | 'AI_PROVIDER_ERROR'
  | 'AI_STAGE_PROVIDER_ERROR'
  | 'AI_STAGE_INVALID_OUTPUT'
  | 'AI_STAGE_TIMEOUT'
  | 'AI_JOB_TIMEOUT'
  | 'AI_FINAL_VALIDATION_FAILED'
  | 'AI_JOB_NOT_FOUND'
  | 'AI_POLL_GIVE_UP'   // client-only: local poll timeout, no server code for this
  | 'NETWORK_ERROR';

export type AnalysisJobStage = {
  name: string;
  status: 'pending' | 'processing' | 'retrying' | 'completed' | 'failed' | 'skipped';
  attempts: number;
};

export type AnalysisJobProgressBody = {
  percent: number;
  current_stage: string | null;
  message: string | null;
  stages: AnalysisJobStage[];
};

export type CreateAnalysisJobSuccessBody = {
  request_id: string;
  analysis_id: string;
  status: 'queued' | string;
  created_at: string;
  status_url: string;
};

export type AnalysisJobStatusBody =
  | {
      analysis_id: string;
      request_id: string;
      status: 'queued' | 'processing' | 'paused';
      progress: AnalysisJobProgressBody;
      partial_data: null;
      created_at: string;
      updated_at: string;
      expires_at: string;
    }
  | {
      analysis_id: string;
      request_id: string;
      status: 'completed';
      progress: AnalysisJobProgressBody;
      model: string;
      schema_version: 'ai-output-v1';
      prompt_version: string;
      data: unknown; // validated via validateAIOutput
      partial_data: null;
      created_at: string;
      updated_at: string;
      expires_at: string;
    }
  | {
      analysis_id: string;
      status: 'failed';
      progress: AnalysisJobProgressBody;
      error: {code: ApiErrorCode; message: string; stage?: string; retryable?: boolean};
      partial_data: null;
      created_at: string;
      updated_at: string;
      expires_at: string;
    };
```

`AnalyzeTextRequestBody` (existing) is reused unchanged as the `POST
/v1/ai/analyses` body — same shape per the doc.

`src/modules/ai-analysis/types.ts` additions:

```ts
export type AnalysisProgress = {
  percent: number;        // 0-100
  stage: string | null;   // current_stage
  message: string | null; // ready-to-display Vietnamese string
};
export type AnalysisProgressCallback = (progress: AnalysisProgress) => void;
```

`AnalyzeTextResult` is unchanged (`{ok:true, lesson}` / `{ok:false, errorCode,
message}`) — the job's `data` field validates through the same
`validateAIOutput` used today, so no new lesson-parsing logic is needed.

### `analysisJobClient.ts`

Exports `runAnalysisJob(confirmedText, sourceType, onProgress):
Promise<AnalyzeTextResult>`:

1. Generate a fresh Idempotency-Key (reuse `createRequestId()`) once per call
   — one call = one user action = one key, per the doc's "one key per tap"
   rule. There is no client-side auto-retry of a whole job, so key reuse across
   retries isn't needed: a failed job means the user goes back and re-taps,
   which re-mounts `AnalyzingScreen` and generates a new key for that new
   action.
2. `POST /v1/ai/analyses`. A network/parse failure here is an immediate
   `NETWORK_ERROR` result (same behavior as today's sync client).
3. Wait `Retry-After` seconds from the 202 response (fallback to 1s if the
   header is missing), then start polling `status_url` every 1.5s.
4. Each poll: on success, call `onProgress({percent, stage: current_stage,
   message})`. Treat `queued`, `processing`, and `paused` identically as
   "still working" per the doc.
5. A single poll's network/parse failure is swallowed and retried on the next
   tick — it does not fail the job. Only an explicit `failed` status or the
   give-up timeout ends the loop.
6. Give up after 75s of total elapsed time (mid of the doc's 60–90s
   recommendation) → stop polling, return failure with `errorCode:
   'AI_POLL_GIVE_UP'`, same downstream handling as a `failed` job.
7. On `status: 'completed'` → validate `data` via `validateAIOutput` (same
   validator used by the sync path today); invalid → `AI_INVALID_OUTPUT`.
8. On `status: 'failed'` → map `error.code` to a display message via the
   table below.

## Error handling & messages

All codes map to existing copy in `src/shared/copy/userMessages.ts` — no new
strings needed:

| Code(s) | Message |
|---|---|
| `VALIDATION_EMPTY_TEXT` | `EMPTY_INPUT_MESSAGE` |
| `VALIDATION_TEXT_TOO_LONG` | `TEXT_TOO_LONG_MESSAGE` |
| `VALIDATION_MISSING_IDEMPOTENCY_KEY`, `IDEMPOTENCY_CONFLICT` | `AI_ANALYSIS_FAILED_MESSAGE` (client always generates the key; these indicate a client bug, not a user-recoverable state) |
| `AI_STAGE_PROVIDER_ERROR`, `AI_STAGE_INVALID_OUTPUT`, `AI_STAGE_TIMEOUT`, `AI_JOB_TIMEOUT`, `AI_FINAL_VALIDATION_FAILED`, `AI_JOB_NOT_FOUND`, `AI_INVALID_OUTPUT`, `AI_PROVIDER_ERROR`, `AI_TIMEOUT` | `AI_ANALYSIS_FAILED_MESSAGE` (matches today's handling of generic AI failures — the code is what analytics tracks, the message stays generic) |
| `AI_POLL_GIVE_UP` (client-only) | `AI_ANALYSIS_FAILED_MESSAGE` |
| fetch throw / non-JSON response | `NETWORK_LOST_MESSAGE` (unchanged) |

`error.retryable` from the doc is not surfaced in the UI — there is no
client-triggered retry endpoint in this slice, so a `failed` job (retryable or
not) is always handled the same way: navigate back to `origin` with
`{analyzeError: message}`, unchanged from today's `AnalyzingScreen` behavior.

## Progress UI (`AnalyzingScreen`)

Replace the 3-item fake `STEPS` array and its `setInterval` simulation with
the 6 real stages from the doc, using the doc's Vietnamese labels as static
step labels:

| Stage | Label |
|---|---|
| `source_analysis` | Đang dịch và sắp xếp nội dung |
| `sentence_analysis` | Đang phân tích từng câu |
| `learning_points` | Đang tìm ngữ pháp và từ vựng |
| `pronunciation` | Đang chuẩn bị hướng dẫn phát âm |
| `practice` | Đang tạo bài luyện tập |
| `finalizing` | Đang kiểm tra bài học |

Each stage's UI state (`done`/`active`/`pending`) is derived from
`progress.stages[]` (`completed`/`retrying`/`processing` → active or done;
`pending`/`skipped` → pending), the same `StepIndicator` component as today.
`HandoffProgressTrack`'s percent comes directly from `progress.percent / 100`
instead of the random-cap simulation. The subtitle under the screen title
shows `progress.message` when present, falling back to the existing static
copy when `message` is null (e.g. right at `queued`).

On `status: 'completed'`, all steps jump to done and the screen navigates
exactly as today (same `COMPLETE_HOLD_MS` hold before transition).

## Mock behavior (`MockAIAnalysisService.ts`)

`useMockAi=true` swaps `analyzeTextWithMock` for a new
`simulateAnalysisJob(confirmedText, options, onProgress)` that emits synthetic
progress through the same 6 stages (using the doc's weights: 15/35/25/10/10/5)
on a short timer (comparable pacing to today's `STEP_INTERVAL_MS`), then
resolves with the existing fixture data exactly as `analyzeTextWithMock` does
today. This keeps dev/demo UX aligned with production and exercises the same
progress-rendering code path in `AnalyzingScreen` without a real backend.

## Testing

- `analysisJobClient.test.ts`: create success, `IDEMPOTENCY_CONFLICT`,
  validation errors, poll transitions (`queued`→`processing`→`completed`,
  →`failed`, `paused` treated as `processing`), give-up timeout, transient
  poll-error swallowing. Use fake timers, following the existing patterns in
  `analyzeClient.test.ts`/`appConfig.test.ts`.
- `MockAIAnalysisService.test.ts`: assert staged progress callbacks fire in
  stage order with increasing percent before the promise resolves.
- `AIAnalysisService.test.ts`: update mocks from `analyzeTextWithApi` to
  `runAnalysisJob`; assert the progress callback is threaded through
  unchanged.
- `AnalyzingScreen.test.tsx`: drive progress via the callback instead of
  relying on the internal timer; assert the stage list renders from real
  `progress.stages[]` data and percent tracks `progress.percent`.
- Delete `analyzeClient.test.ts` alongside `analyzeClient.ts`.

Smallest relevant check: `yarn test src/modules/ai-analysis src/shared/api`.

## Non-goals / explicit deferrals

- No client-side sync/async feature flag — sync is fully removed from the app.
- No cancel button — matches the doc; a `failed`/give-up job requires a fresh
  user-initiated retry (new screen entry, new Idempotency-Key).
- No AppState/background-polling handling — same exposure as today's single
  blocking `fetch`, not addressed by this slice.
- No new analytics events beyond the existing `ai_analysis_started` /
  `ai_analysis_completed`; `error_code` on failure now includes the new codes
  above, which analytics consumers should expect.
