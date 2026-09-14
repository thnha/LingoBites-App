/* eslint-disable @typescript-eslint/no-unused-vars */
const fs = require('fs');

const tables = [
  'FlashcardRecord',
  'ReviewScheduleRecord',
  'ReviewSessionRecord',
  'GamificationEventRecord',
  'ContentReviewItemRecord',
  'ContentLessonState',
  'GrammarBookmark',
  'YoutubeLessonRecord', // Check if exists
  'YoutubeSentenceRecord', // Check if exists
  'YoutubeProgressRecord', // Check if exists
];

let content = fs.readFileSync('src/shared/db/types.ts', 'utf8');

// I'll just use regex to add revision and tombstone to all these types.
content = content.replace(/export type FlashcardRecord = \{/, 'export type FlashcardRecord = {\n  revision: number;\n  tombstone: boolean;');
content = content.replace(/export type ReviewScheduleRecord = \{/, 'export type ReviewScheduleRecord = {\n  revision: number;\n  tombstone: boolean;');
content = content.replace(/export type ReviewSessionRecord = \{/, 'export type ReviewSessionRecord = {\n  revision: number;\n  tombstone: boolean;');
content = content.replace(/export type GamificationEventRecord = GamificationEventInput & \{/, 'export type GamificationEventRecord = GamificationEventInput & {\n  revision: number;\n  tombstone: boolean;');
content = content.replace(/export type ContentReviewItemRecord = \{/, 'export type ContentReviewItemRecord = {\n  revision: number;\n  tombstone: boolean;');
content = content.replace(/export type ContentLessonState = \{/, 'export type ContentLessonState = {\n  revision: number;\n  tombstone: boolean;');
content = content.replace(/export type GrammarBookmark = \{/, 'export type GrammarBookmark = {\n  revision: number;\n  tombstone: boolean;');
// YouTube tables
content = content.replace(/export type YouTubeLessonRecord = \{/, 'export type YouTubeLessonRecord = {\n  revision: number;\n  tombstone: boolean;');
content = content.replace(/export type YouTubeSentenceRecord = \{/, 'export type YouTubeSentenceRecord = {\n  revision: number;\n  tombstone: boolean;');
content = content.replace(/export type YouTubeProgressRecord = \{/, 'export type YouTubeProgressRecord = {\n  revision: number;\n  tombstone: boolean;');

fs.writeFileSync('src/shared/db/types.ts', content);
