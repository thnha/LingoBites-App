#!/usr/bin/env node
/**
 * hooks/log-tool-use.js — PreToolUse and PostToolUse Hook
 *
 * Runs BEFORE and AFTER every tool execution.
 * - In PreToolUse (when tool_response is not present in stdin):
 *   - Emits tool.call.started event
 *   - Records the start time to a local file
 * - In PostToolUse (when tool_response is present in stdin):
 *   - Emits tool.call.completed event with duration
 *   - Cleans up the start time file
 */
const fs = require("fs");
const path = require("path");
const { readStdinJSON, logsDir } = require("../lib/logger");
const { getMirrorClient, mirrorEvent, baseEventFields } = require("../lib/control-plane/claude-adapter");

async function main() {
  const input = readStdinJSON();
  const sessionId = input.session_id || "unknown";
  const toolName = input.tool_name || "unknown";
  const toolCallId = input.tool_call_id;

  if (!toolCallId || toolName === "unknown") {
    process.exit(0);
  }

  const client = getMirrorClient();
  const baseFields = baseEventFields(sessionId, { toolCallId });

  const isPostToolUse = "tool_response" in input;

  if (!isPostToolUse) {
    // PreToolUse: tool.call.started
    const occurredAt = new Date().toISOString();
    const stateFile = path.join(logsDir(), `tool-start-${toolCallId}.txt`);
    fs.writeFileSync(stateFile, occurredAt, "utf8");

    await mirrorEvent(client, {
      ...baseFields,
      eventType: "tool.call.started",
      occurredAt,
      payload: {
        name: toolName,
        input: input.tool_input || {}
      }
    });
  } else {
    // PostToolUse: tool.call.completed
    const occurredAt = new Date().toISOString();
    const stateFile = path.join(logsDir(), `tool-start-${toolCallId}.txt`);
    let startedAt = occurredAt;
    if (fs.existsSync(stateFile)) {
      startedAt = fs.readFileSync(stateFile, "utf8").trim();
      try {
        fs.unlinkSync(stateFile);
      } catch {}
    }

    const duration = Date.now() - new Date(startedAt).getTime();

    const toolResponse = input.tool_response || {};
    const status = (toolResponse.exit_code === 0 || !toolResponse.error) ? "completed" : "failed";
    const error = toolResponse.error || toolResponse.message || "";
    const output = typeof toolResponse === "string" ? toolResponse : (toolResponse.output || toolResponse.result || "");

    await mirrorEvent(client, {
      ...baseFields,
      eventType: "tool.call.completed",
      occurredAt,
      payload: {
        status,
        output,
        error,
        duration
      }
    });
  }

  process.exit(0);
}

main().catch(() => {
  process.exit(0);
});
