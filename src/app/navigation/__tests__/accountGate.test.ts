import {accountGateRouteForPhase} from '../accountGate';

describe('accountGateRouteForPhase (SETE-303 / T6)', () => {
  it('maps every account phase to exactly one root route', () => {
    expect(accountGateRouteForPhase('authenticated')).toBe('Tabs');
    expect(accountGateRouteForPhase('needs-onboarding')).toBe('Onboarding');
    expect(accountGateRouteForPhase('bootstrapping')).toBe('BootGate');
    expect(accountGateRouteForPhase('offline')).toBe('BootGate');
    expect(accountGateRouteForPhase('merge-in-progress')).toBe('BootGate');
    expect(accountGateRouteForPhase('failed')).toBe('BootGate');
  });
});
