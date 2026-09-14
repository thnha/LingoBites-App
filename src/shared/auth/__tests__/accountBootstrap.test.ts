import {open} from 'react-native-quick-sqlite';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {DB_NAME} from '../../db/constants';
import {getDatabase, resetDatabaseForTests} from '../../db/database';
import {hasInstallMarker} from '../../db/installMarker';
import * as DeviceIdentityNative from '../../identity/deviceIdentityNative';
import {
  bootAccount,
  resetBootStateForTests,
  submitOnboardingName,
} from '../accountBootstrap';
import {resetRefreshStateForTests} from '../authSession';
import {getActiveSession} from '../sessionStore';
import type {AuthSession, AuthUser} from '../authTypes';
import {installKeychainVault, vault} from '../../../test-support/keychainVault';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const ANDROID_ID = 'a1b2c3d4e5f60718';
const FALLBACK_UUID = '123e4567-e89b-42d3-a456-426614174000';

const user: AuthUser = {
  id: '11111111-1111-4111-8111-111111111111',
  public_code: 'LB-AB12CD34',
  display_name: 'An',
  phone_e164: null,
  status: 'active',
  created_at: '2026-09-14T00:00:00.000Z',
  updated_at: '2026-09-14T00:00:00.000Z',
};

const freshSession: AuthSession = {
  session_id: '22222222-2222-4222-8222-222222222222',
  access_token: 'lb_at_access',
  refresh_token: 'lb_rt_refresh',
  access_expires_at: new Date(Date.now() + 3600_000).toISOString(),
  refresh_expires_at: new Date(Date.now() + 7 * 86400_000).toISOString(),
};

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
}

function ticketResponse() {
  return jsonResponse(404, {
    request_id: 't1',
    status: 'failed',
    error: {code: 'ACCOUNT_NOT_FOUND', message: 'No account.'},
    bootstrap_ticket: 'bt_ticket_1',
    bootstrap_ticket_expires_at: new Date(Date.now() + 900_000).toISOString(),
  });
}

function authenticatedResponse() {
  return jsonResponse(200, {
    request_id: 'b1',
    status: 'authenticated',
    user,
    session: freshSession,
  });
}

function createdResponse() {
  return jsonResponse(201, {
    request_id: 'c1',
    status: 'created',
    user,
    session: freshSession,
  });
}

function bootstrapBodies(): Array<Record<string, string>> {
  return mockFetch.mock.calls
    .filter(([url]) => (url as string).endsWith('/v1/auth/bootstrap'))
    .map(([, init]) => JSON.parse((init as RequestInit).body as string));
}

beforeEach(() => {
  __resetMockDatabases();
  resetDatabaseForTests(open({name: DB_NAME}));
  getDatabase();
  installKeychainVault();
  resetBootStateForTests();
  resetRefreshStateForTests();
  mockFetch.mockReset();
  jest
    .spyOn(DeviceIdentityNative, 'readPlatformIdentifiers')
    .mockResolvedValue({
      androidId: null,
      identifierForVendor: null,
    });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('accountBootstrap fresh install (SETE-303 / T6)', () => {
  it('clears persisted Keychain sessions before creating a fallback account', async () => {
    const order: string[] = [];
    const Keychain = jest.requireMock('react-native-keychain') as {
      resetGenericPassword: jest.Mock;
    };
    Keychain.resetGenericPassword.mockImplementation(
      async (options: {service?: string}) => {
        order.push(`reset:${options?.service ?? 'default'}`);
        vault.delete(options?.service ?? 'default');
        return true;
      },
    );
    mockFetch.mockImplementation(async (url: string) => {
      order.push(`fetch:${url}`);
      return ticketResponse();
    });
    // A stale pre-uninstall session lingering in Keychain.
    vault.set('com.lingobites.auth.session.stale', {
      username: 'auth-session',
      password: '{"session_id":"stale"}',
    });
    vault.set('com.lingobites.auth.active', {
      username: 'active-session',
      password: 'stale',
    });

    const result = await bootAccount({
      platform: 'ios',
      randomUuid: () => FALLBACK_UUID,
    });

    expect(result.status).toBe('needs-onboarding');
    const firstFetch = order.findIndex(entry => entry.startsWith('fetch:'));
    const resets = order.filter(entry => entry.startsWith('reset:'));
    expect(resets.length).toBeGreaterThan(0);
    expect(Math.max(...resets.map(entry => order.indexOf(entry)))).toBeLessThan(
      firstFetch,
    );
    expect(vault.has('com.lingobites.auth.session.stale')).toBe(false);
    expect(hasInstallMarker()).toBe(true);
  });

  it('reuses the persisted fallback UUID across boots of the same install', async () => {
    mockFetch.mockResolvedValue(ticketResponse());
    await bootAccount({platform: 'ios', randomUuid: () => FALLBACK_UUID});
    resetBootStateForTests();
    // A different generator on the next boot must not mint a new identity.
    await bootAccount({
      platform: 'ios',
      randomUuid: () => 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    });
    const bodies = bootstrapBodies();
    expect(bodies).toHaveLength(2);
    expect(bodies[0]).toEqual({
      identifier_kind: 'random_fallback',
      identifier_value: FALLBACK_UUID,
    });
    expect(bodies[1]).toEqual(bodies[0]);
  });

  it('bootstraps a known Android id straight to authenticated', async () => {
    jest
      .spyOn(DeviceIdentityNative, 'readPlatformIdentifiers')
      .mockResolvedValue({androidId: ANDROID_ID, identifierForVendor: null});
    mockFetch.mockResolvedValueOnce(authenticatedResponse());
    const result = await bootAccount({platform: 'android'});
    expect(result).toEqual({status: 'authenticated', user});
    expect(bootstrapBodies()[0]).toEqual({
      identifier_kind: 'android_id',
      identifier_value: ANDROID_ID,
    });
    await expect(getActiveSession()).resolves.toMatchObject({
      ok: true,
      value: {session_id: freshSession.session_id},
    });
    expect(hasInstallMarker()).toBe(true);
  });

  it('shares one in-flight boot across concurrent callers (no duplicates)', async () => {
    mockFetch.mockResolvedValueOnce(authenticatedResponse());
    jest
      .spyOn(DeviceIdentityNative, 'readPlatformIdentifiers')
      .mockResolvedValue({androidId: ANDROID_ID, identifierForVendor: null});
    const [a, b] = await Promise.all([
      bootAccount({platform: 'android'}),
      bootAccount({platform: 'android'}),
    ]);
    expect(a).toEqual({status: 'authenticated', user});
    expect(b).toEqual({status: 'authenticated', user});
    expect(bootstrapBodies()).toHaveLength(1);
  });

  it('reports offline without setting the install marker', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'));
    const result = await bootAccount({
      platform: 'ios',
      randomUuid: () => FALLBACK_UUID,
    });
    expect(result).toEqual({status: 'offline'});
    expect(hasInstallMarker()).toBe(false);
  });
});

describe('accountBootstrap session restore (SETE-303 / T6)', () => {
  it('restores a live session via /me without bootstrapping', async () => {
    // Seed a completed install: marker + active session.
    mockFetch.mockResolvedValueOnce(ticketResponse());
    await bootAccount({platform: 'ios', randomUuid: () => FALLBACK_UUID});
    resetBootStateForTests();
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce(
      jsonResponse(201, {
        request_id: 'c2',
        status: 'created',
        user,
        session: freshSession,
      }),
    );
    const submitted = await submitOnboardingName({
      bootstrapTicket: 'bt_ticket_1',
      displayName: 'An',
    });
    expect(submitted.status).toBe('authenticated');

    // Next boot: /me validates the stored session; bootstrap never fires.
    resetBootStateForTests();
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce(
      jsonResponse(200, {request_id: 'm1', status: 'success', user}),
    );
    const restored = await bootAccount({platform: 'ios'});
    expect(restored).toEqual({status: 'authenticated', user});
    expect(
      mockFetch.mock.calls.some(([url]) =>
        (url as string).endsWith('/v1/auth/bootstrap'),
      ),
    ).toBe(false);
  });
});

describe('submitOnboardingName idempotency (SETE-303 / T6)', () => {
  async function bootToTicket(): Promise<string> {
    mockFetch.mockResolvedValueOnce(ticketResponse());
    const result = await bootAccount({
      platform: 'ios',
      randomUuid: () => FALLBACK_UUID,
    });
    expect(result.status).toBe('needs-onboarding');
    if (result.status !== 'needs-onboarding') {
      throw new Error('expected a bootstrap ticket');
    }
    return result.bootstrapTicket;
  }

  function idempotencyKeys(): Array<string | undefined> {
    return mockFetch.mock.calls
      .filter(([url]) => (url as string).endsWith('/v1/users'))
      .map(
        ([, init]) => (init as RequestInit).headers as Record<string, string>,
      )
      .map(headers => headers['Idempotency-Key']);
  }

  it('replays the same Idempotency-Key when creation is retried', async () => {
    const ticket = await bootToTicket();
    mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'));
    await expect(
      submitOnboardingName({bootstrapTicket: ticket, displayName: 'An'}),
    ).resolves.toEqual({status: 'offline'});

    mockFetch.mockResolvedValueOnce(createdResponse());
    await expect(
      submitOnboardingName({bootstrapTicket: ticket, displayName: 'An'}),
    ).resolves.toEqual({status: 'authenticated', user});

    const keys = idempotencyKeys();
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBe(keys[0]);
  });

  it('converges on the existing account after a 409 conflict', async () => {
    const ticket = await bootToTicket();
    mockFetch.mockResolvedValueOnce(
      jsonResponse(409, {
        request_id: 'c3',
        status: 'failed',
        error: {code: 'IDEMPOTENCY_CONFLICT', message: 'conflict'},
      }),
    );
    // Re-bootstrap finds the account created by the racing request.
    mockFetch.mockResolvedValueOnce(authenticatedResponse());
    await expect(
      submitOnboardingName({bootstrapTicket: ticket, displayName: 'An'}),
    ).resolves.toEqual({status: 'authenticated', user});
    expect(bootstrapBodies()).toHaveLength(2);
  });
});
