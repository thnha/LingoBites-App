/**
 * lib/logger.js — Writes JSONL events to .ai-logs/events.jsonl.
 * Shared by every hook. Uses no external libraries.
 */
const fs = require("fs");
const path = require("path");
const { loadConfig } = require("./complexity");

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

// Common secrets accidentally pasted into prompts or commands—redact before logging.
const SECRET_PATTERNS = [
  { re: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, tag: "PRIVATE_KEY" },
  { re: /AKIA[0-9A-Z]{16}/g, tag: "AWS_KEY" },
  { re: /gh[pousr]_[A-Za-z0-9]{20,}/g, tag: "GITHUB_TOKEN" },
  { re: /xox[baprs]-[A-Za-z0-9-]{10,}/g, tag: "SLACK_TOKEN" },
  { re: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, tag: "JWT" },
  { re: /Bearer\s+[A-Za-z0-9\-_.]{10,}/gi, tag: "BEARER_TOKEN" },
  {
    re: /((?:api[_-]?key|secret|token|password|passwd|pwd|access[_-]?key)\s*[:=]\s*["']?)([^\s"',;]{4,})/gi,
    tag: "CREDENTIAL",
    keepPrefix: true
  }
];

/** Replace strings resembling secrets with [REDACTED:*]. */
function redactSecrets(text) {
  if (typeof text !== "string" || !text) return text;
  let out = text;
  for (const p of SECRET_PATTERNS) {
    out = p.keepPrefix
      ? out.replace(p.re, (_, prefix) => `${prefix}[REDACTED:${p.tag}]`)
      : out.replace(p.re, `[REDACTED:${p.tag}]`);
  }
  return out;
}

/** Recursively redact every string value in an event. */
function redactEvent(value) {
  if (typeof value === "string") return redactSecrets(value);
  if (Array.isArray(value)) return value.map(redactEvent);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = redactEvent(v);
    return out;
  }
  return value;
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

/** Read all events, skipping invalid lines. */
function readEvents() {
  const file = path.join(logsDir(), "events.jsonl");
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
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
