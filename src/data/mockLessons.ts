import {validFullOutput, validMinimalOutput} from '../shared/fixtures';
import {validateAIOutput} from '../shared/schemas/ai-output-v1';
import type {AIOutput} from '../shared/schemas/ai-output-v1';

function assertValid(lesson: AIOutput): AIOutput {
  const result = validateAIOutput(lesson);
  if (!result.valid) {
    throw new Error(`Invalid mock lesson: ${result.error}`);
  }
  return lesson;
}

export const mockLessons: AIOutput[] = [
  assertValid(validFullOutput),
  assertValid(validMinimalOutput),
];
