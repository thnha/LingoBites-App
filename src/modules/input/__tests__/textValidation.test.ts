import {MAX_INPUT_TEXT_LENGTH} from '../../../shared/copy/userMessages';
import {validateConfirmedText} from '../textValidation';

describe('validateConfirmedText', () => {
  it('rejects empty input', () => {
    const result = validateConfirmedText('   ');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.message).toContain('nhập hoặc dán');
    }
  });

  it('rejects text over MAX_INPUT_TEXT_LENGTH', () => {
    const result = validateConfirmedText('a'.repeat(MAX_INPUT_TEXT_LENGTH + 1));
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.message).toContain('3000');
    }
  });

  it('accepts text at max length', () => {
    const value = 'a'.repeat(MAX_INPUT_TEXT_LENGTH);
    const result = validateConfirmedText(value);
    expect(result).toEqual({valid: true, value});
  });

  it('trims surrounding whitespace', () => {
    const result = validateConfirmedText('  hello world  ');
    expect(result).toEqual({valid: true, value: 'hello world'});
  });
});
