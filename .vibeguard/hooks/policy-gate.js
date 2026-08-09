#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { loadConfig } = require("../lib/complexity");
const { projectDir, readStdinJSON } = require("../lib/logger");
const { decide } = require("../lib/control-plane/policy-client");
const { computeFingerprint, resolvePolicy } = require("../lib/control-plane/policy-engine");
const { isSensitive } = require("../lib/control-plane/sensitive-files");

const DEPENDENCY_RE = /\b(npm\s+(install|i|add)|yarn\s+add|pnpm\s+add|pip\s+install|composer\s+require|cargo\s+add|go\s+get)\b/i;
const COMMIT_RE = /\bgit\s+commit\b/i;
const PUSH_RE = /\bgit\s+push\b/i;

function normalizePath(filePath) {
  return String(filePath || "").replace(/\\/g, "/").replace(/^\.\//, "");
}

function globToRegExp(pattern) {
  const normalized = normalizePath(pattern);
  let source = "";
  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];
    if (char === "*" && next === "*") {
      source += ".*";
      index += 1;
    } else if (char === "*") {
      source += "[^/]*";
    } else {
      source += char.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`^${source}$`);
}

function matchesScope(filePath, patterns = []) {
  const normalized = normalizePath(filePath);
  return patterns.some((pattern) => {
    const scoped = normalizePath(pattern);
    if (!scoped) return false;
    if (scoped === normalized) return true;
    if (!scoped.includes("*") && normalized.startsWith(`${scoped.replace(/\/$/, "")}/`)) return true;
    return globToRegExp(scoped).test(normalized);
  });
}

function readLocalContract(root) {
  try {
    const contractPath = path.join(root, ".vibeguard", "task-contract.json");
    if (!fs.existsSync(contractPath)) return null;
    return JSON.parse(fs.readFileSync(contractPath, "utf8"));
  } catch {
    return null;
  }
}

function categoryForEdit({ toolName, toolInput, config, root }) {
  const filePath = normalizePath(toolInput.file_path);
  if (!filePath) return null;
  if (isSensitive(filePath, config)) return "sensitive_edit";

  const edits = Array.isArray(toolInput.edits) ? toolInput.edits : [];
  const { largeMultiEditThreshold } = resolvePolicy(config);
  if (toolName === "MultiEdit" && edits.length >= largeMultiEditThreshold) {
    return "large_multi_edit";
  }

  const contract = readLocalContract(root);
  if (!contract) return "no_contract";

  const inScope = Array.isArray(contract.inScope) ? contract.inScope : [];
  const outOfScope = Array.isArray(contract.outOfScope) ? contract.outOfScope : [];
  if (!matchesScope(filePath, inScope) && !matchesScope(filePath, outOfScope)) {
    return "scope_drift_edit";
  }
  return null;
}

function categoryForBash(command) {
  if (DEPENDENCY_RE.test(command)) return "dependency_change";
  if (COMMIT_RE.test(command)) return "commit_gate";
  if (PUSH_RE.test(command)) return "push_gate";
  return null;
}

function writeDecision(decision) {
  const reasons = Array.isArray(decision.reasons) ? decision.reasons : [];
  const message = reasons.join("; ") || "policy gate denied this action";

  if (decision.result === "warn") {
    process.stderr.write(`[VIBEGUARD] ${message}\n`);
    return 0;
  }
  if (decision.result === "block") {
    process.stderr.write(`[VIBEGUARD] BLOCKED: ${message}\n`);
    return 2;
  }
  if (decision.result === "require_approval") {
    process.stderr.write(
      `[VIBEGUARD] This action requires approval: ${message}\n` +
      "Open the VibeGuard dashboard's Pending Approvals panel, grant the approval, then retry.\n"
    );
    return 2;
  }
  return 0;
}

async function main() {
  const input = readStdinJSON();
  const toolName = input.tool_name;
  const toolInput = input.tool_input || {};
  const sessionId = input.session_id || "unknown";
  const root = projectDir();
  const config = loadConfig(root);

  let category = null;
  let normalizedTarget = "";

  if (["Edit", "Write", "MultiEdit"].includes(toolName)) {
    normalizedTarget = normalizePath(toolInput.file_path);
    category = categoryForEdit({ toolName, toolInput, config, root });
  } else if (toolName === "Bash") {
    normalizedTarget = String(toolInput.command || "").trim().slice(0, 300);
    category = normalizedTarget ? categoryForBash(normalizedTarget) : null;
  }

  if (!category || !normalizedTarget) return 0;

  const actionFingerprint = computeFingerprint({ sessionId, toolName, normalizedTarget });
  const decision = await decide({
    projectDir: root,
    sessionId,
    category,
    normalizedTarget,
    toolName,
    actionFingerprint
  });

  return writeDecision(decision);
}

main()
  .then((code) => process.exit(code))
  .catch(() => process.exit(0));
