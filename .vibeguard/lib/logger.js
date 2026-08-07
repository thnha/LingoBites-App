/**
 * lib/logger.js — Writes JSONL events to .ai-logs/events.jsonl.
 * Shared by every hook. Uses no external libraries.
 */
const fs = require("fs");
const path = require("path");
const { loadConfig } = require("./complexity");
const { redactSecrets, redactValue: redactEvent } = require("./control-plane/redaction");

/** Project root: prefer the Claude Code environment variable. */
function projectDir() {
  return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

function logsDir() {
  const dir = path.join(projectDir(), ".ai-logs");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function reportsDir() {
  const dir = path.join(logsDir(), "reports");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Rotate events.jsonl to events.jsonl.1 when it exceeds maxLogSizeMB. */
function rotateIfNeeded(file) {
  try {
    const { maxLogSizeMB } = loadConfig(projectDir());
    const stat = fs.statSync(file);
    if (stat.size >= maxLogSizeMB * 1024 * 1024) {
      fs.renameSync(file, `${file}.1`);
    }
  } catch { /* File does not exist or config is invalid—ignore. */ }
}

/** Write one JSON event to events.jsonl, automatically redacting and rotating. */
function logEvent(event) {
  const file = path.join(logsDir(), "events.jsonl");
  rotateIfNeeded(file);
  const safeEvent = redactEvent({ ts: new Date().toISOString(), ...event });
  fs.appendFileSync(file, JSON.stringify(safeEvent) + "\n", "utf8");
}

/** Read all events from the current and (if present) previously rotated log, skipping invalid lines. */
function readEvents() {
  const dir = logsDir();
  const events = [];
  for (const name of ["events.jsonl.1", "events.jsonl"]) {
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      if (!line.trim()) continue;
      try {
        events.push(JSON.parse(line));
      } catch { /* Skip one malformed record without losing the file. */ }
    }
  }
  return events;
}

/** Read JSON from stdin (Claude Code passes hook input through stdin). */
function readStdinJSON() {
  try {
    const raw = fs.readFileSync(0, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

module.exports = {
  projectDir,
  logsDir,
  reportsDir,
  logEvent,
  readEvents,
  readStdinJSON,
  redactSecrets
};
