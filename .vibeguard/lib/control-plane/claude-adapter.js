const fs = require("node:fs");
const { randomUUID } = require("node:crypto");
const { createAdapterClient } = require("./adapter-client");
const { projectDir } = require("../logger");

/** Shared identity fields every mirrored event needs. `extra` merges in per-event IDs (turnId, toolCallId, ...). */
function baseEventFields(sessionId, extra = {}) {
  return {
    sessionId,
    workspaceId: projectDir(),
    repositoryId: projectDir(),
    agentId: "agt_claude-code",
    taskId: sessionId,
    ...extra
  };
}

function buildEnvelope(fields) {
  const envelope = {
    schema_version: 1,
    client_event_id: randomUUID(),
    occurred_at: fields.occurredAt || new Date().toISOString(),
    workspace_id: fields.workspaceId,
    repository_id: fields.repositoryId,
    session_id: fields.sessionId,
    agent_id: fields.agentId,
    task_id: fields.taskId,
    correlation_id: fields.sessionId,
    parent_event_id: null,
    event_type: fields.eventType,
    source: {
      adapter: "claude-code",
      adapter_version: "1.0.0",
      provider: "anthropic",
      model: fields.model || "unknown"
    },
    code_state: {
      head_commit: fields.headCommit || "unknown",
      working_tree_hash: fields.treeHash || "unknown"
    },
    payload: fields.payload || {},
    redaction: { applied: false, ruleset_version: 1 }
  };

  // Add stable ID fields if provided (Trajectory Release 1)
  if (fields.turnId) envelope.turn_id = fields.turnId;
  if (fields.messageId) envelope.message_id = fields.messageId;
  if (fields.toolCallId) envelope.tool_call_id = fields.toolCallId;

  return envelope;
}

let cachedClient;

function getMirrorClient(options = {}) {
  const env = options.env || process.env;
  if (cachedClient !== undefined) return cachedClient;
  const tokenFile = env.VIBEGUARD_CONTROL_PLANE_TOKEN_FILE;
  if (!tokenFile || !fs.existsSync(tokenFile)) {
    cachedClient = null;
    return cachedClient;
  }
  const token = fs.readFileSync(tokenFile, "utf8").trim();
  const timeoutMs = env.VIBEGUARD_CONTROL_PLANE_TIMEOUT_MS
    ? Number(env.VIBEGUARD_CONTROL_PLANE_TIMEOUT_MS)
    : undefined;
  cachedClient = createAdapterClient({
    daemonUrl: env.VIBEGUARD_CONTROL_PLANE_URL || "http://127.0.0.1:4174",
    token,
    clientId: "claude-code-hooks",
    spoolRoot: env.VIBEGUARD_DATA_DIR ? `${env.VIBEGUARD_DATA_DIR}/v2/spool` : undefined,
    ...(timeoutMs !== undefined && { timeoutMs })
  });
  return cachedClient;
}

async function mirrorEvent(client, envelopeFields) {
  if (!client) return;
  try {
    await client.send(buildEnvelope(envelopeFields));
  } catch {
    // Mirroring is best-effort; legacy hook behavior must never depend on it.
  }
}

module.exports = { buildEnvelope, mirrorEvent, getMirrorClient, baseEventFields };
