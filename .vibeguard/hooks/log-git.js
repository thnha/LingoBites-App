#!/usr/bin/env node
/**
 * hooks/log-git.js — Hook: PostToolUse (matcher: Bash)
 *
 * Runs after every Bash command. Tracks important Git commands only:
 * commit / checkout / switch / merge / rebase / reset / push / branch / cherry-pick.
 * For git commit, also captures the SHA and message of the new commit.
 * Dependency-install commands (npm install, pip install, and more) are logged separately.
 */
const { execSync } = require("child_process");
const { logEvent, readStdinJSON, projectDir } = require("../lib/logger");

const input = readStdinJSON();
const toolInput = input.tool_input || {};
const command = (toolInput.command || "").trim();
const sessionId = input.session_id || "unknown";

if (!command) process.exit(0);

const GIT_RE = /\bgit\s+(commit|checkout|switch|merge|rebase|reset|push|branch|cherry-pick|revert|stash)\b/;
const DEP_RE = /\b(npm\s+(install|i|add)|yarn\s+add|pnpm\s+add|pip\s+install|composer\s+require|cargo\s+add|go\s+get)\b/;
const VERIFY_RE = /\b(npm\s+(test|run\s+(test|lint|build|typecheck|type-check))|yarn\s+(test|lint|build|typecheck)|pnpm\s+(test|lint|build|typecheck)|jest|mocha|pytest|go\s+test|cargo\s+test|tsc)\b/;

const gitMatch = command.match(GIT_RE);
const depMatch = command.match(DEP_RE);

if (gitMatch) {
  const event = {
    type: "git",
    session_id: sessionId,
    action: gitMatch[1],
    command: command.slice(0, 300)
  };

  if (gitMatch[1] === "commit") {
    try {
      const info = execSync('git log -1 --format="%H|%s"', {
        cwd: projectDir(),
        encoding: "utf8",
        timeout: 5000
      }).trim();
      const [sha, ...msg] = info.replace(/"/g, "").split("|");
      event.sha = sha;
      event.message = msg.join("|");
    } catch { /* Not a Git repository or the commit failed. */ }
  }

  logEvent(event);

  const { getMirrorClient, mirrorEvent } = require("../lib/control-plane/claude-adapter");
  mirrorEvent(getMirrorClient(), {
    sessionId,
    workspaceId: projectDir(),
    repositoryId: projectDir(),
    agentId: "agt_claude-code",
    taskId: sessionId,
    eventType: "git.operation",
    payload: { action: event.action, sha: event.sha }
  }).catch(() => {});
}

if (depMatch) {
  logEvent({
    type: "dependency",
    session_id: sessionId,
    command: command.slice(0, 300)
  });
}

const verifyMatch = command.match(VERIFY_RE);
const toolResponse = input.tool_response || {};

if (verifyMatch && typeof toolResponse.exit_code === "number") {
  const { getMirrorClient, mirrorEvent } = require("../lib/control-plane/claude-adapter");
  mirrorEvent(getMirrorClient(), {
    sessionId,
    workspaceId: projectDir(),
    repositoryId: projectDir(),
    agentId: "agt_claude-code",
    taskId: sessionId,
    eventType: "verification.completed",
    payload: { command: command.slice(0, 300), status: toolResponse.exit_code === 0 ? "passed" : "failed" }
  }).catch(() => {});
}

process.exit(0);
