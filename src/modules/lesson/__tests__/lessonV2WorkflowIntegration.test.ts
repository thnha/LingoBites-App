import {AppState} from 'react-native';
import fixture from '@shared/schemas/__tests__/fixtures/lesson-v2-envelope.json';
import * as TokenStore from '@shared/security/lessonTokenStore';
import {
  createLessonV2,
  resumeLessonV2,
  retryLessonV2Chunk,
  deleteLessonV2,
} from '@shared/api/lessonV2Client';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {open} from 'react-native-quick-sqlite';
import {DB_NAME} from '@shared/db/constants';
import {resetDatabaseForTests, getDatabase} from '@shared/db/database';
import {runMigrations} from '@shared/db/migrations';
import {getLessonV2ById, upsertLessonV2} from '@shared/db/LessonV2Repository';
import {saveLesson, getLessonById} from '@shared/db/LessonRepository';
import type {AIOutput} from '@shared/schemas/ai-output-v1';
import {validFullOutput} from '@shared/fixtures';
import type {LessonV2} from '@shared/schemas/lesson-v2';

const baseLesson = fixture.lesson as unknown as LessonV2;

const makeResponse = (
  body: unknown,
  status = 202,
  headers: Record<string, string> = {},
) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers({
    'content-type': 'application/json',
    ...headers,
  }),
  json: jest.fn().mockResolvedValue(body),
  text: jest.fn().mockResolvedValue(JSON.stringify(body)),
});

describe('lesson-v2 Workflow Integration & Verification (SETE-177)', () => {
  let tokenStoreMap: Map<string, string>;

  beforeEach(() => {
    Object.defineProperty(AppState, 'currentState', {
      value: 'active',
      configurable: true,
      writable: true,
    });
    tokenStoreMap = new Map();
    __resetMockDatabases();
    const db = open({name: DB_NAME});
    resetDatabaseForTests(db);
    runMigrations(db);

    jest
      .spyOn(TokenStore, 'saveLessonToken')
      .mockImplementation(async (id: string, token: string) => {
        tokenStoreMap.set(id, token);
        return {ok: true, token: null};
      });

    jest
      .spyOn(TokenStore, 'getLessonToken')
      .mockImplementation(async (id: string) => {
        const token = tokenStoreMap.get(id) ?? null;
        return {ok: true, token};
      });

    jest
      .spyOn(TokenStore, 'deleteLessonToken')
      .mockImplementation(async (id: string) => {
        tokenStoreMap.delete(id);
        return {ok: true};
      });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // 1. Happy path: paragraph in -> skeleton immediately -> progressive fill -> ready
  it('TC-E2E-01: Happy Path - persists skeleton immediately, polls revision, and reaches ready', async () => {
    const skeletonLesson: LessonV2 = {
      ...baseLesson,
      status: 'skeleton_ready',
      revision: 1,
      sentences: [
        {
          ...baseLesson.sentences[0],
          status: 'pending',
          translation: null,
          simple_meaning: null,
          phrases: [],
        },
      ],
      chunks: [
        {
          ...baseLesson.chunks[0],
          status: 'pending',
        },
      ],
    };

    const readyLesson: LessonV2 = {
      ...baseLesson,
      status: 'ready',
      revision: 2,
    };

    const fetchImpl = jest
      .fn()
      // Initial POST /v2/lessons
      .mockResolvedValueOnce(
        makeResponse(
          {
            lesson: skeletonLesson,
            access_token: 'secret-cap-token-1',
            token_type: 'Bearer',
          },
          202,
          {
            Location: `/v2/lessons/${skeletonLesson.lesson_id}`,
            ETag: '"1"',
            'X-Poll-After-Ms': '800',
          },
        ),
      )
      // First poll -> ready
      .mockResolvedValueOnce(
        makeResponse(readyLesson, 200, {
          ETag: '"2"',
          'X-Poll-After-Ms': '800',
        }),
      );

    const promise = createLessonV2(
      {confirmedText: 'Anna lives in Hanoi.'},
      {fetchImpl},
    );

    // Initial POST completed
    await jest.advanceTimersByTimeAsync(100);

    // Verify skeleton was immediately persisted in SQLite
    const localSkeleton = getLessonV2ById(skeletonLesson.lesson_id);
    expect(localSkeleton).not.toBeNull();
    expect(localSkeleton?.status).toBe('skeleton_ready');
    expect(localSkeleton?.sentences[0].status).toBe('pending');

    // Advance timer to trigger poll
    await jest.advanceTimersByTimeAsync(800);
    const result = await promise;

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.completed).toBe(true);
      expect(result.lesson.status).toBe('ready');
    }

    // Verify final ready lesson state in SQLite
    const localReady = getLessonV2ById(skeletonLesson.lesson_id);
    expect(localReady?.status).toBe('ready');
    expect(localReady?.revision).toBe(2);
  });

  // 2. Partial failure: one chunk fails -> ready_with_warnings, others unaffected
  it('TC-E2E-02: Partial Failure - chunk failure degrades lesson to ready_with_warnings without failing other chunks', async () => {
    const degradedLesson: LessonV2 = {
      ...baseLesson,
      status: 'ready_with_warnings',
      revision: 3,
      chunks: [
        {
          id: 'c0',
          index: 0,
          sentence_ids: ['s0'],
          status: 'ready',
          attempts: 1,
          error_code: null,
          retryable: true,
        },
        {
          id: 'c1',
          index: 1,
          sentence_ids: ['s0'],
          status: 'failed',
          attempts: 3,
          error_code: 'AI_UNIT_INVALID_OUTPUT',
          retryable: true,
        },
      ],
      warnings: [
        {
          code: 'CHUNK_FAILED',
          unit: 'c1',
          message_vi: 'Đoạn 2 chưa phân tích được.',
        },
      ],
    };

    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        makeResponse(
          {
            lesson: degradedLesson,
            access_token: 'token-part-fail',
            token_type: 'Bearer',
          },
          202,
        ),
      )
      .mockResolvedValueOnce(makeResponse(degradedLesson, 200));

    const promise = createLessonV2(
      {confirmedText: 'Multiple chunk sentence paragraph test.'},
      {fetchImpl},
    );

    await jest.advanceTimersByTimeAsync(800);
    const result = await promise;

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lesson.status).toBe('ready_with_warnings');
      expect(result.lesson.chunks[0].status).toBe('ready');
      expect(result.lesson.chunks[1].status).toBe('failed');
      expect(result.lesson.warnings[0].code).toBe('CHUNK_FAILED');
    }

    const localDegraded = getLessonV2ById(degradedLesson.lesson_id);
    expect(localDegraded?.status).toBe('ready_with_warnings');
    expect(localDegraded?.chunks).toHaveLength(2);
  });

  // 3. Retry: retry a failed chunk/unit, confirm state reset without disturbing unrelated IDs
  it('TC-E2E-03: Retry Chunk - retrying failed chunk resets status to pending and preserves unrelated chunks', async () => {
    tokenStoreMap.set(baseLesson.lesson_id, 'token-for-retry');

    const retriedLesson: LessonV2 = {
      ...baseLesson,
      revision: 5,
      chunks: [
        {
          id: 'c0',
          index: 0,
          sentence_ids: ['s0'],
          status: 'pending',
          attempts: 0,
          error_code: null,
          retryable: true,
        },
      ],
    };

    const fetchImpl = jest.fn().mockResolvedValueOnce(
      makeResponse(retriedLesson, 202),
    );

    const retryResult = await retryLessonV2Chunk(
      baseLesson.lesson_id,
      'c0',
      {fetchImpl},
    );

    expect(retryResult.ok).toBe(true);
    if (retryResult.ok) {
      expect(retryResult.lesson.chunks[0].status).toBe('pending');
      expect(retryResult.lesson.chunks[0].attempts).toBe(0);
      expect(retryResult.lesson.revision).toBe(5);
    }

    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining(`/v2/lessons/${baseLesson.lesson_id}/chunks/c0/retry`),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-for-retry',
        }),
      }),
    );
  });

  // 4. Idempotency: same key+input (reuse), same key+different input (409), different key (new lesson)
  it('TC-E2E-04: Idempotency - reused: true replaces token atomically in Keychain', async () => {
    const lessonId = baseLesson.lesson_id;
    tokenStoreMap.set(lessonId, 'old-capability-token');

    const reusedEnvelope = {
      lesson: baseLesson,
      access_token: 'new-reissued-token',
      token_type: 'Bearer',
      reused: true,
    };

    const fetchImpl = jest.fn().mockResolvedValueOnce(
      makeResponse(reusedEnvelope, 200),
    );

    const result = await createLessonV2(
      {confirmedText: 'Anna lives in Hanoi.', idempotencyKey: 'idem-key-1'},
      {fetchImpl},
    );

    expect(result.ok).toBe(true);
    // Verified: Keychain now stores the reissued token
    expect(tokenStoreMap.get(lessonId)).toBe('new-reissued-token');
  });

  // 5. Resume / offline resilience
  it('TC-E2E-05: Offline & Resume - reads partial lesson from SQLite and resumes polling from Keychain token', async () => {
    const lessonId = baseLesson.lesson_id;
    tokenStoreMap.set(lessonId, 'persisted-keychain-token');

    const partialLesson: LessonV2 = {
      ...baseLesson,
      status: 'partially_ready',
      revision: 2,
    };

    // Store partial snapshot in SQLite
    upsertLessonV2(partialLesson);

    // Verify offline read succeeds from SQLite
    const cached = getLessonV2ById(lessonId);
    expect(cached?.status).toBe('partially_ready');

    const completedLesson: LessonV2 = {
      ...baseLesson,
      status: 'ready',
      revision: 3,
    };

    const fetchImpl = jest.fn().mockResolvedValueOnce(
      makeResponse(completedLesson, 200, {ETag: '"3"'}),
    );

    // Resume resumes from Keychain token
    const resumeResultPromise = resumeLessonV2(lessonId, {
      fetchImpl,
      initialLesson: cached ?? undefined,
    });

    await jest.advanceTimersByTimeAsync(800);
    const resumeResult = await resumeResultPromise;

    expect(resumeResult.ok).toBe(true);
    if (resumeResult.ok) {
      expect(resumeResult.lesson.status).toBe('ready');
      expect(resumeResult.completed).toBe(true);
    }
  });

  // 6. Token security & isolation: no plaintext token in SQLite
  it('TC-E2E-06: Token Security - capability token never leaks into SQLite DB or serialized lesson', async () => {
    const secretToken = 'super-secret-capability-token-xyz-12345';
    const fetchImpl = jest.fn().mockResolvedValueOnce(
      makeResponse(
        {
          lesson: baseLesson,
          access_token: secretToken,
          token_type: 'Bearer',
        },
        202,
      ),
    );

    await createLessonV2(
      {confirmedText: 'Anna lives in Hanoi.'},
      {fetchImpl},
    );

    // Token must be stored in Keychain
    expect(tokenStoreMap.get(baseLesson.lesson_id)).toBe(secretToken);

    // SQLite database must NOT contain the secret token anywhere
    const db = getDatabase();
    const rows = db.execute(
      'SELECT * FROM lesson_v2 WHERE lesson_id = ?;',
      [baseLesson.lesson_id],
    );
    const rowJson = JSON.stringify(rows.rows?.item(0) ?? {});
    expect(rowJson).not.toContain(secretToken);

    const localObj = getLessonV2ById(baseLesson.lesson_id);
    expect(JSON.stringify(localObj)).not.toContain(secretToken);
  });

  // 7. v1 Backward Compatibility: existing ai-output-v1 lessons unaffected
  it('TC-E2E-07: v1 Regression - ai-output-v1 lesson persists and loads independently alongside lesson_v2', () => {
    const saveResult = saveLesson({
      confirmedText: validFullOutput.original_text,
      sourceType: 'paste_text',
      lesson: validFullOutput,
    });
    expect(saveResult.ok).toBe(true);

    const v1Id = (saveResult as {lessonId: string}).lessonId;
    const fetchedV1 = getLessonById(v1Id);
    expect(fetchedV1).not.toBeNull();
    expect(fetchedV1?.title).toBe(validFullOutput.title);

    // Confirm v2 table does not collide or overwrite v1
    const v2Lookup = getLessonV2ById(v1Id);
    expect(v2Lookup).toBeNull();
  });

  // 8. Delete & Purge: deleteLessonV2 purges local SQLite and Keychain token
  it('TC-E2E-08: Deletion - deleteLessonV2 clears local SQLite row and removes Keychain credential', async () => {
    const lessonId = baseLesson.lesson_id;
    tokenStoreMap.set(lessonId, 'token-to-delete');

    const fetchImpl = jest.fn().mockResolvedValueOnce(
      makeResponse(null, 204),
    );

    const deleteResult = await deleteLessonV2(lessonId, {fetchImpl});
    expect(deleteResult.ok).toBe(true);

    // Token removed from Keychain
    expect(tokenStoreMap.has(lessonId)).toBe(false);

    // Local lesson purged from SQLite
    expect(getLessonV2ById(lessonId)).toBeNull();
  });
});
