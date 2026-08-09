#!/usr/bin/env node
/**
 * hooks/block-dangerous.js — Hook: PreToolUse (matcher: Bash)
 *
 * Runs BEFORE a Bash command executes.
 * If the command matches one of `dangerousPatterns` (.vibeguard/config.json),
 * it is BLOCKED (exit 2) and the reason is written to stderr.
 * Blocks by default: git push --force, rm -rf, git reset --hard, git clean -f,
 * curl|sh, sudo npm/pip install, npm install -g, drop table/database.
 *
 * This is a hard deny, not an approval gate: the hook cannot know whether the
 * user approved in a later turn. To run one of these commands, run it manually
 * outside Claude Code or relax dangerousPatterns.
 */
const { logEvent, readStdinJSON, projectDir } = require("../lib/logger");
const { loadConfig } = require("../lib/complexity");

const input = readStdinJSON();
const toolInput = input.tool_input || {};
const command = (toolInput.command || "").trim();
const sessionId = input.session_id || "unknown";

if (!command) process.exit(0);

const { dangerousPatterns } = loadConfig(projectDir());

for (const src of dangerousPatterns || []) {
  let re;
  try {
    re = new RegExp(src, "i");
  } catch {
    continue; // Invalid config pattern—skip it without crashing the hook.
  }
  if (re.test(command)) {
    logEvent({
      type: "blocked_command",
      session_id: sessionId,
      command: command.slice(0, 300),
      pattern: src
    });

    const { getMirrorClient, mirrorEvent } = require("../lib/control-plane/claude-adapter");
    const { computeFingerprint } = require("../lib/control-plane/policy-engine");
    const actionFingerprint = computeFingerprint({ sessionId, toolName: "Bash", normalizedTarget: command.slice(0, 300) });
    mirrorEvent(getMirrorClient(), {
      sessionId,
      workspaceId: projectDir(),
      repositoryId: projectDir(),
      agentId: "agt_claude-code",
      taskId: sessionId,
      eventType: "policy.decision_recorded",
      payload: {
        actionFingerprint,
        category: "destructive_command",
        result: "block",
        reasons: [`matched dangerous pattern: ${src}`],
        policyProfile: "Guarded"
      }
    }).catch(() => {});

    process.stderr.write(
      [
        "[VIBEGUARD] This command is BLOCKED because it matches a configured dangerous pattern:",
        `  ${command}`,
        `  (matched pattern: ${src})`,
        "This action is difficult or impossible to undo. If it must be run,",
        "run it manually outside Claude Code, or adjust 'dangerousPatterns'",
        "in .vibeguard/config.json and try again."
      ].join("\n")
    );
    process.exit(2);
  }
}

process.exit(0);
