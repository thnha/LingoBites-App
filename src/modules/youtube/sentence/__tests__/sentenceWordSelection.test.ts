import {
  findVocabEntry,
  formatFunctionWordNote,
  formatGrammarBadge,
  grammarSaveKey,
  isFunctionWordEntry,
  tokenizeSentenceWords,
  wordSaveKey,
} from '../sentenceWordSelection';
import type {VocabEntry} from '@shared/schemas/sentence-contract';

const VOCAB: VocabEntry[] = [
  {
    word: 'learning',
    pos: 'noun',
    ipa: 'ˈlɜːnɪŋ',
    meaning: 'sự học',
    tip: 'learn + ing',
  },
  {
    word: 'through',
    pos: 'từ chức năng',
    ipa: 'θruː',
    meaning: 'qua, xuyên qua',
    inSentenceNote: 'Trong câu: học qua video',
  },
];

describe('tokenizeSentenceWords', () => {
  it('marks words tappable and punctuation/whitespace untappable', () => {
    const tokens = tokenizeSentenceWords('We are learning, through video!');
    const byText = new Map(tokens.map(t => [t.text, t]));
    expect(byText.get('We')?.tappable).toBe(true);
    expect(byText.get('learning')?.tappable).toBe(true);
    expect(byText.get(',')?.tappable).toBe(false);
    expect(byText.get('!')?.tappable).toBe(false);
    expect(byText.get(' ')?.tappable).toBe(false);
    expect(byText.get(',')?.normalizedWord).toBeNull();
    expect(byText.get('learning')?.normalizedWord).toBe('learning');
  });

  it('returns no tokens for an empty sentence', () => {
    expect(tokenizeSentenceWords('')).toEqual([]);
  });
});

describe('findVocabEntry', () => {
  it('matches case-insensitively', () => {
    expect(findVocabEntry(VOCAB, 'Learning')?.meaning).toBe('sự học');
  });

  it('returns undefined when the word has no entry', () => {
    expect(findVocabEntry(VOCAB, 'video')).toBeUndefined();
  });
});

describe('function word shortening', () => {
  it('detects function words by pos', () => {
    expect(isFunctionWordEntry(VOCAB[1])).toBe(true);
    expect(isFunctionWordEntry(VOCAB[0])).toBe(false);
  });

  it('prefers the Trong câu note', () => {
    expect(formatFunctionWordNote(VOCAB[1])).toBe('Trong câu: học qua video');
  });
});

describe('grammar + save keys', () => {
  it('formats badges as NGỮ PHÁP i/n', () => {
    expect(formatGrammarBadge(0, 3)).toBe('NGỮ PHÁP 1/3');
    expect(formatGrammarBadge(2, 3)).toBe('NGỮ PHÁP 3/3');
  });

  it('builds stable case-insensitive word keys', () => {
    expect(wordSaveKey('Learning')).toBe('learning');
    expect(grammarSaveKey({name: 'Present continuous'} as never)).toBe(
      'Present continuous',
    );
  });
});
