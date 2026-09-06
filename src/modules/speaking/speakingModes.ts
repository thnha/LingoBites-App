/**
 * Speaking Room mode listing + content availability (SETE-110 / M5, REQ-23).
 *
 * The six required modes are a fixed, always-shown list; a mode is only
 * "available" when the active content package actually declares content for
 * it. Today only `shadowing` maps onto existing M1/M2 content (the same
 * `listen_and_repeat` / `speaking_drill` activities the lesson runtime turns
 * into a shadowing step — see `buildLessonSteps.ts`); the other five modes
 * have no content-schema representation yet, so they always render the
 * "not available yet" state (REQ-23, VC-17) rather than a broken/empty
 * screen. Adding real content for them is future content-authoring work, not
 * part of this milestone.
 */

import {
  getLessonActivities,
  getLessonChunks,
  listActivePackageLessons,
} from '../../shared/db/ContentRuntimeRepository';
import type {SpeakingMode} from '../../shared/db/types';

export type SpeakingModeInfo = {
  mode: SpeakingMode;
  titleVi: string;
  descriptionVi: string;
  available: boolean;
};

const SHADOWING_ACTIVITY_TYPES = new Set(['listen_and_repeat', 'speaking_drill']);

export type ShadowingLine = {
  textEn: string;
  textVi: string;
  audioAssetId: string | null;
};

export type ShadowingContent = {
  lessonId: string;
  lessonTitleVi: string;
  lines: ShadowingLine[];
};

/** All shadowing-eligible lines across the active package's lessons. */
export function getShadowingContent(): ShadowingContent[] {
  const lessons = listActivePackageLessons();
  const content: ShadowingContent[] = [];
  for (const lesson of lessons) {
    const activities = getLessonActivities(lesson.id).filter(activity =>
      SHADOWING_ACTIVITY_TYPES.has(activity.type),
    );
    if (activities.length === 0) {
      continue;
    }
    const chunks = getLessonChunks(lesson.id);
    const chunksById = new Map(chunks.map(chunk => [chunk.id, chunk]));
    const lines: ShadowingLine[] = [];
    for (const activity of activities) {
      for (const chunkId of activity.chunkRefIds) {
        const chunk = chunksById.get(chunkId);
        if (!chunk) {
          continue;
        }
        lines.push({
          textEn: chunk.phraseEn,
          textVi: chunk.phraseVi,
          audioAssetId: chunk.audioRefIds[0] ?? null,
        });
      }
    }
    if (lines.length > 0) {
      content.push({
        lessonId: lesson.id,
        lessonTitleVi: lesson.titleVi,
        lines,
      });
    }
  }
  return content;
}

const MODE_COPY: Record<SpeakingMode, {titleVi: string; descriptionVi: string}> = {
  shadowing: {
    titleVi: 'Lặp lại theo mẫu (Shadowing)',
    descriptionVi: 'Nghe câu mẫu, ghi âm lại và tự kiểm tra.',
  },
  quick_answer: {
    titleVi: 'Trả lời nhanh',
    descriptionVi: 'Trả lời một câu hỏi ngắn trong vài giây.',
  },
  standup: {
    titleVi: 'Báo cáo hàng ngày (Stand-up)',
    descriptionVi: 'Luyện nói tóm tắt công việc hôm nay.',
  },
  app_description: {
    titleVi: 'Mô tả ứng dụng/hệ thống',
    descriptionVi: 'Luyện mô tả một tính năng hoặc hệ thống bằng tiếng Anh.',
  },
  bug_report: {
    titleVi: 'Báo lỗi (Bug report)',
    descriptionVi: 'Luyện trình bày một lỗi kỹ thuật bằng tiếng Anh.',
  },
  mock_interview: {
    titleVi: 'Phỏng vấn thử',
    descriptionVi: 'Luyện trả lời câu hỏi phỏng vấn công việc.',
  },
};

/** REQ-23: the six required modes, each flagged with whether content exists. */
export function listSpeakingRoomModes(): SpeakingModeInfo[] {
  const shadowingAvailable = getShadowingContent().length > 0;
  const availability: Record<SpeakingMode, boolean> = {
    shadowing: shadowingAvailable,
    quick_answer: false,
    standup: false,
    app_description: false,
    bug_report: false,
    mock_interview: false,
  };
  return (Object.keys(MODE_COPY) as SpeakingMode[]).map(mode => ({
    mode,
    titleVi: MODE_COPY[mode].titleVi,
    descriptionVi: MODE_COPY[mode].descriptionVi,
    available: availability[mode],
  }));
}
