#!/usr/bin/env node
/**
 * hooks/log-file-read.js — Hook: PostToolUse (matcher: Read)
 *
 * Runs AFTER every successful AI file read.
 * Records file reads within the repository working tree to the control plane.
 * Drops reads under node_modules/ or outside the repository.
 */
const fs = require("fs");
const path = require("path");
const { readStdinJSON, projectDir } = require("../lib/logger");
const { isSensitive } = require("../lib/control-plane/sensitive-files");

const input = readStdinJSON();
const toolName = input.tool_name || "unknown";
const toolInput = input.tool_input || {};
const sessionId = input.session_id || "unknown";

const filePath = toolInput.file_path || "unknown";

// Drop reads without a valid file path
if (!filePath || filePath === "unknown") {
  process.exit(0);
}

// Get the project directory (repository root)
const repoRoot = projectDir();

// Check if the file is inside the repository working tree
let isInRepo = false;
let relativePath = filePath;
try {
  relativePath = path.relative(repoRoot, filePath);
  // If relative path starts with ".." or is absolute, it's outside the repo
  isInRepo = !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
} catch {
  // Keep defaults if path operations fail
}

// Drop reads outside the repository
if (!isInRepo) {
  process.exit(0);
}

// Drop reads under node_modules/
if (relativePath.includes("node_modules/") || relativePath.startsWith("node_modules/")) {
  process.exit(0);
}

// Load config for sensitivity check
let config = {};
try {
  const configPath = path.join(repoRoot, ".vibeguard", "config.json");
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
} catch {
  // Use empty config if loading fails
}

// Determine if the file is sensitive
const sensitive = isSensitive(relativePath, config);

// Mirror the file.read event to the control plane
const { getMirrorClient, mirrorEvent, baseEventFields } = require("../lib/control-plane/claude-adapter");
mirrorEvent(getMirrorClient(), {
  ...baseEventFields(sessionId),
  eventType: "file.read",
  payload: { path: relativePath, sensitive }
}).catch(() => {});

process.exit(0);
