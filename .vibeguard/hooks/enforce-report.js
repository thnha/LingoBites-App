#!/usr/bin/env node
/**
 * hooks/enforce-report.js — Hook: Stop
 *
 * Runs when Claude tries to FINISH a response turn.
 * If the AI changed files in this session but has not written a report
 * (.ai-logs/reports/<session_id>.md), exit 2 BLOCKS completion and writes
 * instructions to stderr requiring Claude to create the report first.
 *
 * IMPORTANT: check stop_hook_active to prevent an infinite loop after the hook
 * has already blocked completion once and Claude is handling its request.
 */
const fs = require("fs");
const path = require("path");
const { readStdinJSON, readEvents, reportsDir, logsDir } = require("../lib/logger");
const { getMirrorClient, mirrorEvent, baseEventFields } = require("../lib/control-plane/claude-adapter");

async function main() {
  const input = readStdinJSON();
  const sessionId = input.session_id || "unknown";

  // Prevent an infinite loop: allow completion when the Stop hook was already active.
  if (input.stop_hook_active) {
    await emitTurnCompleted(sessionId);
    process.exit(0);
  }

  // Count files changed by the AI in this session.
  const events = readEvents();
  const changes = events.filter(
    (e) => e.type === "file_change" && e.session_id === sessionId
  );

  // No file changes means no report is needed.
  if (changes.length === 0) {
    await emitTurnCompleted(sessionId);
    process.exit(0);
  }

  const reportPath = path.join(reportsDir(), `${sessionId}.md`);

  // An existing report allows completion.
  if (fs.existsSync(reportPath)) {
    let content = "Session report written.";
    try {
      content = fs.readFileSync(reportPath, "utf8").slice(0, 500);
    } catch { /* Report unreadable at mirror time; use the fallback summary. */ }

    const client = getMirrorClient();
    const baseFields = baseEventFields(sessionId);

    // Emit agent.claim_made
    await mirrorEvent(client, {
      ...baseFields,
      eventType: "agent.claim_made",
      payload: { claimType: "completion", content }
    });

    await emitTurnCompleted(sessionId);
    process.exit(0);
  }

  // No report yet: block completion and require Claude to write one.
  const files = [...new Set(changes.map((c) => c.file))];
  process.stderr.write(
    [
      `[VIBEGUARD] You changed ${files.length} file(s) in this session but have NOT written a report.`,
      `Before finishing, use the Write tool to create: ${reportPath}`,
      "The Markdown report must include:",
      "## Summary: a short description of the work completed",
      "## Changed files: each file, what changed, and why",
      `(recorded files: ${files.join(", ")})`,
      "## New dependencies: added libraries, or 'None'",
      "## User review: important items or risks the user should inspect",
      "After writing the report, finish the turn normally."
    ].join("\n")
  );
  process.exit(2);
}

async function emitTurnCompleted(sessionId) {
  const turnStatePath = path.join(logsDir(), `turn-${sessionId}.json`);
  let turnId = sessionId + "-unknown";
  if (fs.existsSync(turnStatePath)) {
    try {
      const state = JSON.parse(fs.readFileSync(turnStatePath, "utf8"));
      turnId = state.turnId;
    } catch {}
  }

  const client = getMirrorClient();
  const baseFields = baseEventFields(sessionId, { turnId });

  await mirrorEvent(client, {
    ...baseFields,
    eventType: "turn.completed",
    occurredAt: new Date().toISOString(),
    payload: {}
  });
}

main().catch(() => {
  process.exit(0);
});
