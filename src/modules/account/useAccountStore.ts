import {create} from 'zustand';
import {
  bootAccount,
  submitOnboardingName,
  type AuthUser,
  type BootResult,
} from '@shared/auth';

/**
 * Account bootstrap state for navigation gating (SETE-303 / T6).
 *
 * `phase` is the single source of truth the root navigator reads:
 * - `bootstrapping`: splash/loading — no account decision yet.
 * - `needs-onboarding`: bootstrap ticket held, display-name screen shown.
 * - `authenticated`: session persisted, main tabs shown.
 * - `offline` / `merge-in-progress` / `failed`: explicit retry states, so a
 *   failed boot can never strand the app on the wrong stack.
 *
 * The Zustand state only mirrors what Keychain/SQLite already persist — a
 * process restart re-runs `bootAccount`, which restores from the stored
 * session instead of trusting in-memory state.
 */

export type AccountPhase =
  | 'bootstrapping'
  | 'needs-onboarding'
  | 'authenticated'
  | 'offline'
  | 'merge-in-progress'
  | 'failed';

export type AccountState = {
  phase: AccountPhase;
  user: AuthUser | null;
  bootstrapTicket: string | null;
  bootstrapTicketExpiresAt: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  boot: () => Promise<void>;
  submitDisplayName: (
    displayName: string,
    phone?: string | null,
  ) => Promise<void>;
  retry: () => Promise<void>;
  signOutLocal: () => void;
};

function fromBootResult(result: BootResult): Partial<AccountState> {
  switch (result.status) {
    case 'authenticated':
      return {
        phase: 'authenticated',
        user: result.user,
        bootstrapTicket: null,
        bootstrapTicketExpiresAt: null,
        failureCode: null,
        failureMessage: null,
      };
    case 'needs-onboarding':
      return {
        phase: 'needs-onboarding',
        user: null,
        bootstrapTicket: result.bootstrapTicket,
        bootstrapTicketExpiresAt: result.bootstrapTicketExpiresAt,
        failureCode: null,
        failureMessage: null,
      };
    case 'offline':
      return {phase: 'offline', failureCode: null, failureMessage: null};
    case 'merge-in-progress':
      return {
        phase: 'merge-in-progress',
        failureCode: null,
        failureMessage: null,
      };
    case 'failed':
      return {
        phase: 'failed',
        failureCode: result.code,
        failureMessage: result.message,
      };
  }
}

export const useAccountStore = create<AccountState>()((set, get) => ({
  phase: 'bootstrapping',
  user: null,
  bootstrapTicket: null,
  bootstrapTicketExpiresAt: null,
  failureCode: null,
  failureMessage: null,

  boot: async () => {
    const result = await bootAccount();
    set(fromBootResult(result));
  },

  submitDisplayName: async (displayName, phone) => {
    const ticket = get().bootstrapTicket;
    if (!ticket) {
      set({
        phase: 'failed',
        failureCode: 'MISSING_BOOTSTRAP_TICKET',
        failureMessage: 'Signup session expired. Please restart the app.',
      });
      return;
    }
    const result = await submitOnboardingName(
      {bootstrapTicket: ticket, displayName, phone: phone ?? null},
      {},
    );
    if (result.status === 'authenticated') {
      set(fromBootResult(result));
      return;
    }
    if (result.status === 'offline') {
      set({phase: 'offline', failureCode: null, failureMessage: null});
      return;
    }
    set({
      phase: 'failed',
      failureCode: result.code,
      failureMessage: result.message,
    });
  },

  retry: async () => {
    set({phase: 'bootstrapping'});
    await get().boot();
  },

  signOutLocal: () => {
    set({
      phase: 'bootstrapping',
      user: null,
      bootstrapTicket: null,
      bootstrapTicketExpiresAt: null,
      failureCode: null,
      failureMessage: null,
    });
  },
}));

/** Test seam: restores the store to its initial state between tests. */
export function resetAccountStoreForTests(): void {
  useAccountStore.setState({
    phase: 'bootstrapping',
    user: null,
    bootstrapTicket: null,
    bootstrapTicketExpiresAt: null,
    failureCode: null,
    failureMessage: null,
  });
}
