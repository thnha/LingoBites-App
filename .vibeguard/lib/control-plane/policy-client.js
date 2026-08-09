const fs = require("node:fs");
const { loadConfig } = require("../complexity");
const { localFallbackDecision, resolvePolicy } = require("./policy-engine");

async function decide({
  projectDir,
  sessionId,
  category,
  normalizedTarget,
  toolName,
  actionFingerprint,
  env = process.env,
  fetchImpl = globalThis.fetch
}) {
  const config = loadConfig(projectDir);
  const { profile, outageGraceMs } = resolvePolicy(config);
  const tokenFile = env.VIBEGUARD_CONTROL_PLANE_TOKEN_FILE;
  const daemonUrl = env.VIBEGUARD_CONTROL_PLANE_URL || "http://127.0.0.1:4174";

  if (!tokenFile || !fs.existsSync(tokenFile)) {
    return { ...localFallbackDecision(profile, category), source: "local_fallback" };
  }

  const token = fs.readFileSync(tokenFile, "utf8").trim();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), outageGraceMs);

  try {
    const response = await fetchImpl(`${daemonUrl}/v1/control/decide`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sessionId, actionFingerprint, category, normalizedTarget, toolName }),
      signal: controller.signal
    });

    if (response.status !== 200) {
      return { ...localFallbackDecision(profile, category), source: "local_fallback" };
    }

    const body = await response.json();
    return { ...body, reasons: Array.isArray(body.reasons) ? body.reasons : [], source: "daemon" };
  } catch {
    return { ...localFallbackDecision(profile, category), source: "local_fallback" };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { decide };
