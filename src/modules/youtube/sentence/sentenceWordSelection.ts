import type {
  GrammarPoint,
  VocabEntry,
} from '@shared/schemas/sentence-contract';

/**
 * SETE-331 (TASK-4, Stage 2): pure helpers for the interactive word +
 * grammar blocks inside `SentenceCard`.
 *
 * Kept dependency-free so unit tests cover tokenization, selection, and
 * save-label logic without rendering. Persistence itself stays with the
 * parent (FlashcardRepository / GrammarBookmarkRepository via
 * `useBookmarkOptimistic`); this module only resolves *what* to save.
 */

export type SentenceWordToken = {
  /** Exact slice to render (word, punctuation, or whitespace). */
  text: string;
  /** Only word tokens are tappable; punctuation/whitespace never are. */
  tappable: boolean;
  /** Lowercased word for vocab lookup; null when not tappable. */
  normalizedWord: string | null;
};

const WORD_RE = /^[A-Za-z']+$/;

/**
 * Splits a sentence into render tokens. Words (`[A-Za-z']+`) are tappable;
 * punctuation marks and whitespace are preserved but never tappable.
 */
export function tokenizeSentenceWords(en: string): SentenceWordToken[] {
  if (en === '') {
    return [];
  }
  const parts = en.split(/([A-Za-z']+|\s+)/g).filter(p => p !== '');
  return parts.map(text => {
    const tappable = WORD_RE.test(text);
    return {
      text,
      tappable,
      normalizedWord: tappable ? text.toLowerCase() : null,
    };
  });
}

/** Case-insensitive vocab lookup for the currently selected word. */
export function findVocabEntry(
  vocab: readonly VocabEntry[],
  word: string,
): VocabEntry | undefined {
  const needle = word.toLowerCase();
  return vocab.find(entry => entry.word.toLowerCase() === needle);
}

/** Function words (pos `từ chức năng`) render the shortened in-sentence note. */
export function isFunctionWordEntry(entry: VocabEntry): boolean {
  return entry.pos === 'từ chức năng';
}

/**
 * Shortened body for function words: the contract's `Trong câu: …` note.
 * Falls back to meaning when the note is absent.
 */
export function formatFunctionWordNote(entry: VocabEntry): string {
  return entry.inSentenceNote ?? entry.meaning;
}

/** Badge label for the i-th grammar point (0-based) of n total. */
export function formatGrammarBadge(index: number, total: number): string {
  return `NGỮ PHÁP ${index + 1}/${total}`;
}

/** Stable save key for a word within one sentence card. */
export function wordSaveKey(word: string): string {
  return word.toLowerCase();
}

/** Stable save key for a grammar point (its display name). */
export function grammarSaveKey(point: GrammarPoint): string {
  return point.name;
}
