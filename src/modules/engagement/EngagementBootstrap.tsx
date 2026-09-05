import { useEffect } from 'react';
import { useFeatureEnabled } from '../../release';
import { reconcileReminders } from './reminderService';

/**
 * App-start engagement bootstrap: recomputes reminder state from the local
 * schedule and reconciles OS notifications with it. Runs whenever the review
 * system feature is enabled. Delivers no UI — gamification state is always
 * recomputed from the persisted event log on read (see `getGamificationSnapshot`).
 *
 * Real local notifications need a native scheduler adapter installed via
 * `configureReminderScheduler`; until that is wired in, the no-op scheduler
 * keeps this path safe and testable.
 */
export function EngagementBootstrap() {
  const reviewSystemEnabled = useFeatureEnabled('reviewSystem');

  useEffect(() => {
    if (!reviewSystemEnabled) {
      return;
    }
    reconcileReminders();
  }, [reviewSystemEnabled]);

  return null;
}
