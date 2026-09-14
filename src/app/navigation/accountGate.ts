import type {AccountPhase} from '@modules/account';

/**
 * Deterministic account gate mapping (SETE-303 / T6): exactly one root
 * route per account phase. `AppNavigator` renders from this helper so the
 * phase → screen contract is unit-testable without mounting a navigator.
 */
export function accountGateRouteForPhase(
  phase: AccountPhase,
): 'BootGate' | 'Onboarding' | 'Tabs' {
  if (phase === 'authenticated') {
    return 'Tabs';
  }
  if (phase === 'needs-onboarding') {
    return 'Onboarding';
  }
  return 'BootGate';
}
