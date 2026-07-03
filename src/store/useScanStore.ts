import {create} from 'zustand';
import type {AIOutput} from '../shared/schemas/ai-output-v1';
import type {Async} from '../types/async';
import {idle, loading} from '../types/async';
import {analyzeLessonText, type AnalyzeSourceType} from '../services/ai';

type ScanStore = {
  job: Async<AIOutput>;
  scanFromText: (text: string, sourceType?: AnalyzeSourceType) => Promise<void>;
  reset: () => void;
};

export const useScanStore = create<ScanStore>(set => ({
  job: idle,

  async scanFromText(text, sourceType = 'paste_text') {
    const trimmed = text.trim();
    if (!trimmed) {
      set({job: {status: 'empty'}});
      return;
    }

    set({job: loading});
    const result = await analyzeLessonText(trimmed, {sourceType});

    if (result.ok) {
      set({job: {status: 'success', data: result.lesson}});
      return;
    }

    set({job: {status: 'error', message: result.message}});
  },

  reset() {
    set({job: idle});
  },
}));
