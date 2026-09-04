const fs = require("node:fs");
const path = require("node:path");
const { redactValue } = require("./redaction");

const DEFAULT_MAX_EVENTS = 1000;
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 2000;

const PERMANENT_STATUSES = new Set([400, 401, 403, 413]);

function withLock(lockFile, fn) {
  let fd;
  try {
    fd = fs.openSync(lockFile, "wx");
  } catch {
    // Best-effort exclusivity for a single-process client; proceed if already held.
  }
  try {
    return fn();
  } finally {
    if (fd !== undefined) {
      fs.closeSync(fd);
      fs.rmSync(lockFile, { force: true });
    }
  }
}

function readSpoolRecords(spoolFile) {
  if (!fs.existsSync(spoolFile)) return [];
  return fs
    .readFileSync(spoolFile, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function writeSpoolRecords(spoolFile, records) {
  const tempFile = `${spoolFile}.tmp`;
  const content = records.map((record) => JSON.stringify(record)).join("\n") + (records.length ? "\n" : "");
  fs.writeFileSync(tempFile, content, { mode: 0o600 });
  fs.renameSync(tempFile, spoolFile);
}

function createAdapterClient(options) {
  const {
    daemonUrl,
    token,
    clientId,
    spoolRoot,
    fetchImpl = globalThis.fetch,
    maxEvents = DEFAULT_MAX_EVENTS,
    maxBytes = DEFAULT_MAX_BYTES,
    timeoutMs = DEFAULT_TIMEOUT_MS
  } = options;

  const spoolFile = path.join(spoolRoot, `${clientId}.jsonl`);
  const lockFile = path.join(spoolRoot, `${clientId}.lock`);
  let offline = false;

  function spool(event) {
    withLock(lockFile, () => {
      const records = readSpoolRecords(spoolFile);
      const candidate = [...records, redactValue(event)];
      const bytes = candidate.reduce((sum, record) => sum + Buffer.byteLength(JSON.stringify(record), "utf8") + 1, 0);
      if (candidate.length > maxEvents || bytes > maxBytes) {
        throw Object.assign(new Error("Offline buffer is full"), { code: "OBSERVABILITY_BUFFER_FULL" });
      }
      writeSpoolRecords(spoolFile, candidate);
    });
  }

  async function postEvents(events) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(`${daemonUrl}/v1/ingest/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ events }),
        signal: controller.signal
      });
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  async function send(event) {
    if (offline) {
      spool(event);
      return { status: "buffered" };
    }

    let res;
    try {
      res = await postEvents([event]);
    } catch {
      offline = true;
      spool(event);
      return { status: "buffered" };
    }

    if (res.status === 202) {
      const body = await res.json();
      return { status: body.results[0].status };
    }

    if (PERMANENT_STATUSES.has(res.status)) {
      const body = await res.json().catch(() => ({}));
      throw Object.assign(new Error("Ingest request rejected"), { code: (body.error && body.error.code) || "INGEST_REJECTED" });
    }

    offline = true;
    spool(event);
    return { status: "buffered" };
  }

  return { send };
}

module.exports = { createAdapterClient };
