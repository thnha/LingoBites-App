import {SCHEMA_VERSION} from '../schemas/ai-output-v1';
import {sha256Hex} from '../utils/sha256';
import {DEFAULT_PROMPT_VERSION} from './constants';

export function normalizeConfirmedTextForHash(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export function computeLessonInputHash(input: {
  confirmedText: string;
  level: string;
  promptVersion?: string;
  schemaVersion?: string;
}): string {
  const payload = [
    normalizeConfirmedTextForHash(input.confirmedText),
    input.level.trim(),
    input.promptVersion ?? DEFAULT_PROMPT_VERSION,
    input.schemaVersion ?? SCHEMA_VERSION,
  ].join('|');

  return sha256Hex(payload);
}
