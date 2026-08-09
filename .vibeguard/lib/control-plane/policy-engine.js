const { createHash } = require("node:crypto");

const VALID_PROFILES = new Set(["Observe", "Guarded", "Strict"]);
const DEFAULT_PROFILE = "Guarded";
const ALWAYS_FAIL_CLOSED_CATEGORIES = new Set(["destructive_command", "sensitive_edit", "push_gate"]);

function inRange(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

function resolvePolicy(config = {}) {
  const policy = (config && config.policy) || {};
  const outageGraceMs = inRange(policy.outageGraceMs, 0, 30000) ? policy.outageGraceMs : 2000;
  const largeMultiEditThreshold = inRange(policy.largeMultiEditThreshold, 1, 100) ? policy.largeMultiEditThreshold : 10;
  const rawPatchLoop = policy.patchLoop || {};
  const patchLoop = {
    threshold: inRange(rawPatchLoop.threshold, 2, 10) ? rawPatchLoop.threshold : 3,
    windowMinutes: inRange(rawPatchLoop.windowMinutes, 5, 60) ? rawPatchLoop.windowMinutes : 15
  };
  return { profile: VALID_PROFILES.has(policy.profile) ? policy.profile : DEFAULT_PROFILE, outageGraceMs, largeMultiEditThreshold, patchLoop };
}

function localFallbackDecision(profile, category) {
  if (ALWAYS_FAIL_CLOSED_CATEGORIES.has(category)) {
    return { result: "block", reasons: [`${category} always fails closed when the daemon is unreachable`] };
  }
  if (profile === "Observe") {
    return { result: "allow", reasons: ["daemon unreachable; Observe fails open"] };
  }
  return { result: "block", reasons: [`daemon unreachable; ${profile} fails closed after the outage grace period`] };
}

function computeFingerprint({ sessionId, toolName, normalizedTarget }) {
  return createHash("sha256").update(`${sessionId}:${toolName}:${normalizedTarget}`).digest("hex");
}

module.exports = { VALID_PROFILES, DEFAULT_PROFILE, ALWAYS_FAIL_CLOSED_CATEGORIES, resolvePolicy, localFallbackDecision, computeFingerprint };
