import {
  invalidMissingFieldOutput,
  validFullOutput,
  validMinimalOutput,
} from '../../fixtures';
import {validateAIOutput} from '../ai-output-v1';

describe('validateAIOutput', () => {
  it('accepts valid-full fixture', () => {
    const result = validateAIOutput(validFullOutput);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.title).toBe('Special Discount Flyer');
    }
  });

  it('accepts valid-minimal fixture with empty optional arrays', () => {
    const result = validateAIOutput(validMinimalOutput);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.vocabulary).toEqual([]);
      expect(result.data.grammar_points).toEqual([]);
      expect(result.data.practice).toEqual([]);
    }
  });

  it('rejects invalid-missing-field fixture', () => {
    const result = validateAIOutput(invalidMissingFieldOutput);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain('vocabulary');
    }
  });
});
