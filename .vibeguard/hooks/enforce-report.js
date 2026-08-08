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
const { readStdinJSON, readEvents, reportsDir, projectDir } = require("../lib/logger");

const input = readStdinJSON();
const sessionId = input.session_id || "unknown";

// Prevent an infinite loop: allow completion when the Stop hook was already active.
if (input.stop_hook_active) process.exit(0);

// Count files changed by the AI in this session.
const events = readEvents();
const changes = events.filter(
  (e) => e.type === "file_change" && e.session_id === sessionId
);

// No file changes means no report is needed.
if (changes.length === 0) process.exit(0);

const reportPath = path.join(reportsDir(), `${sessionId}.md`);

// An existing report allows completion.
if (fs.existsSync(reportPath)) {
  let content = "Session report written.";
  try {
    content = fs.readFileSync(reportPath, "utf8").slice(0, 500);
  } catch { /* Report unreadable at mirror time; use the fallback summary. */ }

  const { getMirrorClient, mirrorEvent } = require("../lib/control-plane/claude-adapter");
  mirrorEvent(getMirrorClient(), {
    sessionId,
    workspaceId: projectDir(),
    repositoryId: projectDir(),
    agentId: "agt_claude-code",
    taskId: sessionId,
    eventType: "agent.claim_made",
    payload: { claimType: "completion", content }
  }).catch(() => {});

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
