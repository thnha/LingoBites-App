import {validateAIOutput} from '../../shared/schemas/ai-output-v1';
import {mockLessons} from '../mockLessons';

describe('mockLessons', () => {
  it('every mock lesson passes validateAIOutput', () => {
    for (const lesson of mockLessons) {
      const result = validateAIOutput(lesson);
      expect(result.valid).toBe(true);
    }
  });
});
