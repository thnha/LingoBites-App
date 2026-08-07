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

/** Recursively redact every string value in a value (object, array, or scalar). */
function redactValue(value) {
  if (typeof value === "string") return redactSecrets(value);
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = redactValue(v);
    return out;
  }
  return value;
}

module.exports = { redactSecrets, redactValue };
