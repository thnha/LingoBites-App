#!/usr/bin/env node
/**
 * hooks/log-file-change.js — Hook: PostToolUse (matcher: Edit|Write|MultiEdit|NotebookEdit)
 *
 * Runs AFTER every successful AI file creation or edit.
 * Records the file, tool, time, and session to show where the AI made changes.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { logEvent, readStdinJSON, projectDir } = require("../lib/logger");

const input = readStdinJSON();
const toolName = input.tool_name || "unknown";
const toolInput = input.tool_input || {};
const sessionId = input.session_id || "unknown";

const filePath =
  toolInput.file_path || toolInput.path || toolInput.notebook_path || "unknown";

// Use a relative path for readability.
let rel = filePath;
try {
  rel = path.relative(projectDir(), filePath) || filePath;
} catch { /* Keep the original path. */ }

// Estimate the size of the change.
let sizeHint = null;
if (typeof toolInput.content === "string") {
  sizeHint = `${toolInput.content.split("\n").length} lines (overwrite/create)`;
} else if (typeof toolInput.new_string === "string") {
  sizeHint = `~${toolInput.new_string.split("\n").length} replacement lines`;
} else if (Array.isArray(toolInput.edits)) {
  sizeHint = `${toolInput.edits.length} edit(s)`;
}

logEvent({
  type: "file_change",
  session_id: sessionId,
  tool: toolName,
  file: rel,
  size_hint: sizeHint
});

// Hash the file's current content so the control plane can update its
// code-state tree hash. Unreadable (e.g. concurrently deleted) files simply
// omit the hash; the control plane skips code-state updates for that event.
let contentHash = null;
try {
  contentHash = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
} catch { /* File unreadable at mirror time; omit the hash. */ }

const { getMirrorClient, mirrorEvent, baseEventFields } = require("../lib/control-plane/claude-adapter");
mirrorEvent(getMirrorClient(), {
  ...baseEventFields(sessionId),
  eventType: "file.changed",
  payload: { path: rel, changeType: toolName, contentHash }
}).catch(() => {});

process.exit(0);
