import {open} from 'react-native-quick-sqlite';
import {__resetMockDatabases} from '../../../../test-utils/sqliteMock';
import {DB_NAME} from '../../../shared/db/constants';
import {getDatabase, resetDatabaseForTests} from '../../../shared/db/database';
import * as DeviceIdentityNative from '../../../shared/identity/deviceIdentityNative';
import {resetBootStateForTests} from '../../../shared/auth/accountBootstrap';
import {resetRefreshStateForTests} from '../../../shared/auth/authSession';
import {installKeychainVault} from '../../../test-support/keychainVault';
import {resetAccountStoreForTests, useAccountStore} from '../useAccountStore';
import type {AuthSession, AuthUser} from '../../../shared/auth';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const ANDROID_ID = 'a1b2c3d4e5f60718';

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

beforeEach(() => {
  __resetMockDatabases();
  resetDatabaseForTests(open({name: DB_NAME}));
  getDatabase();
  installKeychainVault();
  resetBootStateForTests();
  resetRefreshStateForTests();
  resetAccountStoreForTests();
  mockFetch.mockReset();
  jest
    .spyOn(DeviceIdentityNative, 'readPlatformIdentifiers')
    .mockResolvedValue({androidId: ANDROID_ID, identifierForVendor: null});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useAccountStore navigation flow (SETE-303 / T6)', () => {
  it('moves bootstrapping → needs-onboarding → authenticated deterministically', async () => {
    expect(useAccountStore.getState().phase).toBe('bootstrapping');

    mockFetch.mockResolvedValueOnce(
      jsonResponse(404, {
        request_id: 't1',
        status: 'failed',
        error: {code: 'ACCOUNT_NOT_FOUND', message: 'No account.'},
        bootstrap_ticket: 'bt_ticket_1',
        bootstrap_ticket_expires_at: new Date(
          Date.now() + 900_000,
        ).toISOString(),
      }),
    );
    await useAccountStore.getState().boot();
    expect(useAccountStore.getState().phase).toBe('needs-onboarding');
    expect(useAccountStore.getState().bootstrapTicket).toBe('bt_ticket_1');

    mockFetch.mockResolvedValueOnce(
      jsonResponse(201, {
        request_id: 'c1',
        status: 'created',
        user,
        session: freshSession,
      }),
    );
    await useAccountStore.getState().submitDisplayName('An');
    const state = useAccountStore.getState();
    expect(state.phase).toBe('authenticated');
    expect(state.user).toEqual(user);
  });

  it('reaches authenticated directly for a known device', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(200, {
        request_id: 'b1',
        status: 'authenticated',
        user,
        session: freshSession,
      }),
    );
    await useAccountStore.getState().boot();
    expect(useAccountStore.getState().phase).toBe('authenticated');
  });

  it('lands on offline and recovers through retry', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'));
    await useAccountStore.getState().boot();
    expect(useAccountStore.getState().phase).toBe('offline');

    mockFetch.mockResolvedValueOnce(
      jsonResponse(200, {
        request_id: 'b2',
        status: 'authenticated',
        user,
        session: freshSession,
      }),
    );
    await useAccountStore.getState().retry();
    expect(useAccountStore.getState().phase).toBe('authenticated');
  });
});
