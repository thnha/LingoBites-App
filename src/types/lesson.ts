import type {ChipTone} from '../components/Chip';

export type LessonCardView = {
  id: string;
  title: string;
  meta: string;
  blurb?: string;
};

export type LessonSubjectKey = 'grammar' | 'vocabulary' | 'idioms' | 'conversation';

export type LibraryLessonCardView = {
  id: string;
  title: string;
  blurb: string;
  dateLabel: string;
  vocabularyCount: number;
  durationMin: number;
  subjectLabel: string;
  subjectTone: ChipTone;
  subjectKey: LessonSubjectKey;
};
