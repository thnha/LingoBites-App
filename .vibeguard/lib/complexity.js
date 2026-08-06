/**
 * lib/complexity.js — Heuristic for assessing prompt complexity and vagueness.
 * Returns { complex: bool, vague: bool, score: number, reasons: string[] }.
 * Thresholds and keywords can be adjusted in .vibeguard/config.json.
 */
const fs = require("fs");
const path = require("path");

const DEFAULT_CONFIG = {
  // Prompts longer than this threshold (characters) gain points.
  longPromptChars: 300,
  // A score at or above this threshold is complex and requires a plan.
  complexThreshold: 3,
  // A shorter prompt containing a vague keyword is considered vague and requires clarification.
  shortPromptChars: 60,
  // Major-work keywords (each match adds two points).
  bigKeywords: [
    "refactor", "rewrite", "migrate", "migration", "entire", "all",
    "database", "schema", "auth", "authentication", "authorization",
    "architecture", "restructure", "redesign", "integrate", "deployment",
    "deploy", "ci/cd"
  ],
  // New-feature keywords (each match adds one point).
  featureKeywords: [
    "add feature", "new feature", "feature", "functionality", "implement",
    "build", "create", "new API", "module"
  ],
  // Vague keywords require clarification only for short prompts.
  vagueKeywords: [
    "fix it", "make it pretty", "optimize", "improve", "clean up", "redo",
    "fix bug", "make it better"
  ],
  // Rotate events.jsonl to events.jsonl.1 when it exceeds this size (MB).
  maxLogSizeMB: 5,
  // String regexes for Bash commands blocked at PreToolUse; see hooks/block-dangerous.js.
  dangerousPatterns: [
    "git\\s+push\\s+[^|;&]*(--force(-with-lease)?\\b|(?<![\\w-])-f(?![\\w-]))",
    // Block rm with BOTH recursive (-r/-R/--recursive) and force (-f/--force) flags anywhere,
    // regardless of order or position (for example, "rm -v -rf x", "rm --force -r x", or "rm x -rf").
    // getopt allows flags and operands to be reordered, so matching only flags after "rm" is insufficient.
    "\\brm\\s+(?=[^|;&]*(?<!\\S)(?:-(?!-)[a-zA-Z]*[rR][a-zA-Z]*|--recursive)(?!\\S))(?=[^|;&]*(?<!\\S)(?:-(?!-)[a-zA-Z]*f[a-zA-Z]*|--force)(?!\\S))[^|;&]*",
    "git\\s+reset\\s+--hard\\b",
    "git\\s+clean\\s+-[a-z]*f",
    "curl[^|;&]*\\|\\s*(sh|bash|zsh)\\b",
    "wget[^|;&]*\\|\\s*(sh|bash|zsh)\\b",
    "sudo\\s+(npm|pip|yarn|pnpm)\\s+(install|i|add)\\b",
    // npm install|i|add -g / --global
    "npm\\s+(install|i|add)\\s+[^|;&]*(-g\\b|--global\\b)",
    "yarn\\s+global\\s+add\\b",
    "pnpm\\s+add\\s+[^|;&]*(-g\\b|--global\\b)",
    "\\bdrop\\s+(table|database)\\b"
  ]
};

function loadConfig(projectDir) {
  try {
    const p = path.join(projectDir, ".vibeguard", "config.json");
    if (fs.existsSync(p)) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(p, "utf8")) };
    }
  } catch { /* Use defaults if config is invalid. */ }
  return DEFAULT_CONFIG;
}

function analyze(prompt, projectDir) {
  const cfg = loadConfig(projectDir);
  const text = (prompt || "").toLowerCase();
  let score = 0;
  const reasons = [];

  if (text.length > cfg.longPromptChars) {
    score += 2;
    reasons.push(`long prompt (${text.length} characters)`);
  }

  // Multiple sentences or bullets imply several combined requests.
  const bullets = (prompt.match(/^\s*[-*\d]+[.)]?\s+/gm) || []).length;
  const sentences = (prompt.match(/[.!?。]\s|\n/g) || []).length;
  if (bullets >= 3 || sentences >= 4) {
    score += 2;
    reasons.push(`multiple combined requests (${bullets} bullets, ~${sentences} sentences)`);
  }

  for (const kw of cfg.bigKeywords) {
    if (text.includes(kw)) {
      score += 2;
      reasons.push(`major-work keyword: "${kw}"`);
    }
  }
  for (const kw of cfg.featureKeywords) {
    if (text.includes(kw)) {
      score += 1;
      reasons.push(`feature keyword: "${kw}"`);
    }
  }

  const vague =
    text.length > 0 &&
    text.length < cfg.shortPromptChars &&
    cfg.vagueKeywords.some((kw) => text.includes(kw));

  return { complex: score >= cfg.complexThreshold, vague, score, reasons };
}

module.exports = { analyze, loadConfig, DEFAULT_CONFIG };
