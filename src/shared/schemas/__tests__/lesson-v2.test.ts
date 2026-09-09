import { LessonV2CreateEnvelopeSchema, SentenceV2Schema } from '../lesson-v2';
import fixture from './fixtures/lesson-v2-envelope.json';

describe('lesson-v2 schema', () => {
  it('parses the shared fixture correctly', () => {
    const parsed = LessonV2CreateEnvelopeSchema.parse(fixture);
    expect(parsed.lesson.schema_version).toBe('lesson-v2');
    expect(parsed.access_token).toBe('token-123');
    expect(parsed.lesson.sentences[0].text).toBe('Anna lives in Hanoi.');
  });

  it('proves SentenceV2 has no ipa field', () => {
    expect(SentenceV2Schema.shape).not.toHaveProperty('ipa');
  });

  it('proves tts.locale is en-US and text matches source', () => {
    const parsed = LessonV2CreateEnvelopeSchema.parse(fixture);
    expect(parsed.lesson.sentences[0].tts.locale).toBe('en-US');
    expect(parsed.lesson.sentences[0].tts.text).toBe(parsed.lesson.sentences[0].text);
  });
});
