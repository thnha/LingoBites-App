#!/usr/bin/env node
/**
 * hooks/prompt-gate.js — Hook: UserPromptSubmit
 *
 * Runs BEFORE Claude sees your prompt.
 * - Logs the prompt to .ai-logs/events.jsonl.
 * - For COMPLEX prompts, prints instructions to stdout (injected into context)
 *   requiring Claude to plan, list affected files, and WAIT for approval.
 * - For VAGUE prompts, requires Claude to ask for clarification.
 * - Normal prompts pass through without intervention.
 *
 * Note: UserPromptSubmit stdout is added to the model context.
 * Exit 0 = pass through. (Exit 2 = block the prompt; this hook does not do so by default.)
 */
const { logEvent, readStdinJSON, projectDir } = require("../lib/logger");
const { analyze } = require("../lib/complexity");
const { getMirrorClient, mirrorEvent } = require("../lib/control-plane/claude-adapter");

async function main() {
  const input = readStdinJSON();
  const prompt = input.prompt || "";
  const sessionId = input.session_id || "unknown";

  const result = analyze(prompt, projectDir());

  logEvent({
    type: "prompt",
    session_id: sessionId,
    chars: prompt.length,
    complex: result.complex,
    vague: result.vague,
    score: result.score,
    preview: prompt.slice(0, 200)
  });

  const client = getMirrorClient();
  const baseFields = {
    sessionId,
    workspaceId: projectDir(),
    repositoryId: projectDir(),
    agentId: "agt_claude-code",
    taskId: sessionId,
  };

  await mirrorEvent(client, {
    ...baseFields,
    eventType: "prompt.submitted",
    payload: { chars: prompt.length, complex: result.complex, vague: result.vague }
  });

  if (result.complex) {
    await mirrorEvent(client, {
      ...baseFields,
      eventType: "task.contract_created",
      payload: {
        goal: prompt.slice(0, 500),
        inScope: [],
        outOfScope: [],
        acceptanceCriteria: [],
        verificationCommands: [],
        actor: "user",
        reason: "auto-drafted from a complex prompt"
      }
    });

    console.log(
      [
        "[VIBEGUARD - REQUIRED PROCESS] This request is classified as COMPLEX",
        `(reasons: ${result.reasons.join("; ")}).`,
        "Before writing any code, you MUST:",
        "1. Ask clarifying questions FIRST if any part of the request is unclear.",
        "2. List exactly which files you will create, edit, or delete.",
        "3. Provide an implementation plan in small steps that can each be reviewed independently.",
        "4. List any new dependencies or libraries and explain why they are needed.",
        "5. STOP and wait for the user to reply 'ok' or approve the plan before starting to code.",
        "Do not skip this process."
      ].join("\n")
    );
  } else if (result.vague) {
    console.log(
      [
        "[VIBEGUARD] This request is short and VAGUE.",
        "Before acting, ask 1–3 clarifying questions about:",
        "the file or module scope, the specific desired result, and",
        "any constraints. Begin editing code only after the user confirms."
      ].join("\n")
    );
  }

  process.exitCode = 0;
}

main().catch(() => {
  process.exitCode = 0;
});
