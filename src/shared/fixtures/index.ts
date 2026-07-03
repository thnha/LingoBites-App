import type {AIOutput} from '../schemas/ai-output-v1';
import {AIOutputSchema} from '../schemas/ai-output-v1';
import invalidMissingFieldJson from './invalid-missing-field.json';
import validFullJson from './valid-full.json';
import validMinimalJson from './valid-minimal.json';

export const validFullOutput = validFullJson as AIOutput;
// valid-minimal.json omits optional fields on purpose; parse through the
// schema so defaults (summary, pronunciation, practice) are applied and the
// result is a real AIOutput rather than an unsafe cast.
export const validMinimalOutput = AIOutputSchema.parse(validMinimalJson);
export const invalidMissingFieldOutput = invalidMissingFieldJson;

/** @deprecated Use validFullOutput — kept for existing imports */
export const validLessonOutput = validFullOutput;
