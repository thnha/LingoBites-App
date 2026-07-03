import {
  EMPTY_INPUT_MESSAGE,
  MAX_INPUT_TEXT_LENGTH,
  TEXT_TOO_LONG_MESSAGE,
} from '../../shared/copy/userMessages';

export {MAX_INPUT_TEXT_LENGTH};

export type TextValidationResult =
  | {valid: true; value: string}
  | {valid: false; message: string};

export function validateConfirmedText(input: string): TextValidationResult {
  const value = input.trim();

  if (!value) {
    return {valid: false, message: EMPTY_INPUT_MESSAGE};
  }

  if (value.length > MAX_INPUT_TEXT_LENGTH) {
    return {valid: false, message: TEXT_TOO_LONG_MESSAGE};
  }

  return {valid: true, value};
}
