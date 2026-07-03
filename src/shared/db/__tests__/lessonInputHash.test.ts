import {computeLessonInputHash, normalizeConfirmedTextForHash} from '../lessonInputHash';

describe('lessonInputHash', () => {
  it('normalizes whitespace before hashing', () => {
    expect(normalizeConfirmedTextForHash('  Hello   world \n')).toBe('Hello world');
  });

  it('returns stable hash for same normalized input', () => {
    const first = computeLessonInputHash({
      confirmedText: 'Hello world',
      level: 'Beginner',
    });
    const second = computeLessonInputHash({
      confirmedText: '  Hello   world  ',
      level: 'Beginner',
    });

    expect(first).toBe(second);
  });
});
