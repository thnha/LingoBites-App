import fixture from '@shared/schemas/__tests__/fixtures/lesson-v2-envelope.json';
import * as TokenStore from '@shared/security/lessonTokenStore';
import {createLessonV2, resumeLessonV2} from '../lessonV2Client';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {open} from 'react-native-quick-sqlite';
import {DB_NAME} from '@shared/db/constants';
import {resetDatabaseForTests} from '@shared/db/database';
import {getLessonV2ById} from '@shared/db/LessonV2Repository';

const response = (
  body: unknown,
  status = 202,
  headers: Record<string, string> = {},
) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers(headers),
  json: jest.fn().mockResolvedValue(body),
});

describe('lessonV2Client', () => {
  beforeEach(() => {
    __resetMockDatabases();
    resetDatabaseForTests(open({name: DB_NAME}));
    jest
      .spyOn(TokenStore, 'saveLessonToken')
      .mockResolvedValue({ok: true, token: null});
    jest
      .spyOn(TokenStore, 'getLessonToken')
      .mockResolvedValue({ok: true, token: 'token-123'});
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('persists the create response and keeps the capability token out of the lesson snapshot', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(response(fixture, 202));
    const pending = createLessonV2(
      {confirmedText: 'Anna lives in Hanoi.'},
      {fetchImpl},
    );
    await jest.advanceTimersByTimeAsync(800);
    await expect(pending).resolves.toMatchObject({ok: true, completed: true});

    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:3000/v2/lessons',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Idempotency-Key': expect.any(String),
        }),
      }),
    );
    expect(getLessonV2ById(fixture.lesson.lesson_id)).not.toBeNull();
    expect(
      JSON.stringify(getLessonV2ById(fixture.lesson.lesson_id)),
    ).not.toContain('token-123');
  });

  it('fails resume explicitly when the Keychain has no token', async () => {
    jest
      .spyOn(TokenStore, 'getLessonToken')
      .mockResolvedValue({ok: true, token: null});
    await expect(
      resumeLessonV2(fixture.lesson.lesson_id, {fetchImpl: jest.fn()}),
    ).resolves.toMatchObject({
      ok: false,
      errorCode: 'MISSING_TOKEN',
    });
  });
});
