/**
 * Default patterns for sensitive files.
 * These are always evaluated, and can be extended via config.
 */
const DEFAULT_SENSITIVE_PATTERNS = [
  ".env*",
  "**/.env*",
  "*.pem",
  "**/*.pem",
  "*.key",
  "**/*.key",
  "**/auth/**",
  "**/authz/**",
  "**/authorization/**",
  "**/migrations/**",
  "schema.sql",
  "**/schema.sql",
  "*.sql",
  "**/*.sql",
  "**/payment*/**",
  "**/billing*/**",
  "**/secrets*/**",
  "config/secrets*",
  ".github/workflows/**",
  "**/deploy/**",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "*.lockb",
  "**/*.lockb"
];

/**
 * Simple glob pattern matcher supporting **, *, and literal strings.
 * @param {string} filePath - The file path to match
 * @param {string} pattern - The glob pattern
 * @returns {boolean} - True if the path matches the pattern
 */
function matchPattern(filePath, pattern) {
  // Escape special regex characters except * and /
  let regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "§DOUBLESTAR§")
    .replace(/\*/g, "[^/]*")
    .replace(/§DOUBLESTAR§/g, ".*");

  // Anchor the pattern
  regexPattern = "^" + regexPattern + "$";

  const regex = new RegExp(regexPattern);
  return regex.test(filePath);
}

/**
 * Check if a file path matches sensitive file patterns.
 * @param {string} filePath - The file path to check
 * @param {object} config - Optional config with sensitiveFiles array
 * @returns {boolean} - True if the file is sensitive
 */
function isSensitive(filePath, config = {}) {
  const patterns = [
    ...DEFAULT_SENSITIVE_PATTERNS,
    ...(config.sensitiveFiles || [])
  ];

  return patterns.some((pattern) => matchPattern(filePath, pattern));
}

module.exports = { isSensitive, DEFAULT_SENSITIVE_PATTERNS };
