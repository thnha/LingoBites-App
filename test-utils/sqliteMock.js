const databases = new Map();

function toRows(rows) {
  return {
    rows: {
      length: rows.length,
      item: index => rows[index],
      _array: rows,
    },
    rowsAffected: rows.length,
  };
}

function createMockDatabase() {
  const lessons = [];
  const appSettings = [];
  const flashcards = [];
  const reviewSchedule = [];
  const reviewSessions = [];
  const syncOutbox = [];

  const execute = (sql, params = []) => {
    const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase();

    if (
      normalized.startsWith('create table') ||
      normalized.startsWith('create index')
    ) {
      return { rowsAffected: 0 };
    }

    if (normalized.startsWith('insert into lessons')) {
      lessons.push({
        id: params[0],
        anonymous_user_id: params[1],
        lesson_input_hash: params[2],
        title: params[3],
        source_type: params[4],
        ocr_raw_text: params[5],
        confirmed_text: params[6],
        vietnamese_translation: params[7],
        summary: params[8],
        level: params[9],
        ai_output_json: params[10],
        is_saved: params[11],
        created_at: params[12],
        updated_at: params[13],
        category: params[14],
      });
      return { rowsAffected: 1, insertId: lessons.length };
    }

    if (normalized.startsWith('insert into app_settings')) {
      appSettings.push({
        key: params[0],
        value: params[1],
        updated_at: params[2],
      });
      return { rowsAffected: 1 };
    }

    if (normalized.startsWith('insert into flashcards')) {
      flashcards.push({
        id: params[0],
        lesson_id: params[1],
        vocabulary_id: params[2],
        word: params[3],
        phrase_from_text: params[4],
        word_type: params[5],
        meaning_vi: params[6],
        pronunciation_guide_vi: params[7],
        ipa: params[8],
        cefr_level: params[9],
        source_sentence: params[10],
        example: params[11],
        example_translation: params[12],
        is_saved: params[13],
        created_at: params[14],
        updated_at: params[15],
      });
      return { rowsAffected: 1, insertId: flashcards.length };
    }

    if (normalized.startsWith('insert into review_schedule')) {
      reviewSchedule.push({
        card_id: params[0],
        lesson_id: params[1],
        interval_days: params[2],
        next_review_at: params[3],
        last_reviewed_at: params[4],
        created_at: params[5],
        updated_at: params[6],
        ease_factor: params[7],
        repetitions: params[8],
        rating_scale: params[9],
      });
      return { rowsAffected: 1, insertId: reviewSchedule.length };
    }

    if (normalized.startsWith('insert into review_sessions')) {
      reviewSessions.push({
        id: params[0],
        card_id: params[1],
        lesson_id: params[2],
        rating: params[3],
        reviewed_at: params[4],
        interval_days: params[5],
        next_review_at: params[6],
        created_at: params[7],
      });
      return { rowsAffected: 1, insertId: reviewSessions.length };
    }

    if (normalized.includes('delete from lessons where id')) {
      const id = params[0];
      const before = lessons.length;
      const remaining = lessons.filter(row => row.id !== id);
      lessons.length = 0;
      lessons.push(...remaining);
      return { rowsAffected: before - lessons.length };
    }

    if (normalized.startsWith('update flashcards set is_saved = 1')) {
      const updatedAt = params[0];
      const id = params[1];
      const row = flashcards.find(card => card.id === id);
      if (!row) {
        return { rowsAffected: 0 };
      }
      row.is_saved = 1;
      row.updated_at = updatedAt;
      return { rowsAffected: 1 };
    }

    if (normalized.startsWith('update flashcards set is_saved = 0')) {
      const updatedAt = params[0];
      const id = params[1];
      const row = flashcards.find(card => card.id === id);
      if (!row) {
        return { rowsAffected: 0 };
      }
      row.is_saved = 0;
      row.updated_at = updatedAt;
      return { rowsAffected: 1 };
    }

    if (normalized.startsWith('insert into sync_outbox')) {
      syncOutbox.push({
        id: params[0],
        event_type: params[1],
        entity_id: params[2],
        payload_json: params[3],
        created_at: params[4],
        attempt_count: 0,
        last_error: null,
        synced_at: null,
      });
      return { rowsAffected: 1, insertId: syncOutbox.length };
    }

    if (normalized.startsWith('update sync_outbox set synced_at')) {
      const syncedAt = params[0];
      const id = params[1];
      const row = syncOutbox.find(
        item => item.id === id && item.synced_at === null,
      );
      if (!row) {
        return { rowsAffected: 0 };
      }
      row.synced_at = syncedAt;
      row.last_error = null;
      return { rowsAffected: 1 };
    }

    if (normalized.startsWith('update sync_outbox set attempt_count')) {
      const errorMessage = params[0];
      const id = params[1];
      const row = syncOutbox.find(
        item => item.id === id && item.synced_at === null,
      );
      if (!row) {
        return { rowsAffected: 0 };
      }
      row.attempt_count += 1;
      row.last_error = errorMessage;
      return { rowsAffected: 1 };
    }

    if (
      normalized.startsWith('select') &&
      normalized.includes('count(*)') &&
      normalized.includes('from sync_outbox')
    ) {
      const pending = syncOutbox.filter(row => row.synced_at === null);
      return toRows([{ count: pending.length }]);
    }

    if (
      normalized.startsWith('select') &&
      normalized.includes('from sync_outbox')
    ) {
      let rows = [...syncOutbox];
      if (normalized.includes('synced_at is null')) {
        rows = rows.filter(row => row.synced_at === null);
      }
      rows.sort((a, b) =>
        String(a.created_at).localeCompare(String(b.created_at)),
      );
      if (normalized.includes('limit') && params.length > 0) {
        rows = rows.slice(0, Number(params[0]));
      }
      return toRows(rows);
    }

    if (normalized.includes('delete from sync_outbox')) {
      const before = syncOutbox.length;
      if (normalized.includes('where id')) {
        const id = params[0];
        const remaining = syncOutbox.filter(row => row.id !== id);
        syncOutbox.length = 0;
        syncOutbox.push(...remaining);
        return { rowsAffected: before - remaining.length };
      }
      syncOutbox.length = 0;
      return { rowsAffected: before };
    }

    if (normalized.startsWith('update review_schedule set ease_factor')) {
      // SM-2 backfill: SET ease_factor, repetitions, rating_scale, updated_at
      const easeFactor = params[0];
      const repetitions = params[1];
      const ratingScale = params[2];
      const updatedAt = params[3];
      const cardId = params[4];
      const ratingScaleFilter = params[5];
      const row = reviewSchedule.find(schedule => schedule.card_id === cardId);
      if (!row || row.rating_scale !== ratingScaleFilter) {
        return { rowsAffected: 0 };
      }
      row.ease_factor = easeFactor;
      row.repetitions = repetitions;
      row.rating_scale = ratingScale;
      row.updated_at = updatedAt;
      return { rowsAffected: 1 };
    }

    if (
      normalized.startsWith('update review_schedule') &&
      normalized.includes("rating_scale = 'v2'")
    ) {
      // Test/backfill helper: set interval, ease, repetitions and flip scale.
      const intervalDays = params[0];
      const easeFactor = params[1];
      const repetitions = params[2];
      const updatedAt = params[3];
      const cardId = params[4];
      const row = reviewSchedule.find(schedule => schedule.card_id === cardId);
      if (!row) {
        return { rowsAffected: 0 };
      }
      row.interval_days = intervalDays;
      row.ease_factor = easeFactor;
      row.repetitions = repetitions;
      row.rating_scale = 'v2';
      row.updated_at = updatedAt;
      return { rowsAffected: 1 };
    }

    if (normalized.startsWith('update review_schedule')) {
      const intervalDays = params[0];
      const nextReviewAt = params[1];
      const lastReviewedAt = params[2];
      const updatedAt = params[3];
      const easeFactor = params[4];
      const repetitions = params[5];
      const cardId = params[6];
      const row = reviewSchedule.find(schedule => schedule.card_id === cardId);
      if (!row) {
        return { rowsAffected: 0 };
      }
      row.interval_days = intervalDays;
      row.next_review_at = nextReviewAt;
      row.last_reviewed_at = lastReviewedAt;
      row.updated_at = updatedAt;
      row.ease_factor = easeFactor;
      row.repetitions = repetitions;
      return { rowsAffected: 1 };
    }

    if (normalized.includes('from lessons where lesson_input_hash')) {
      const hash = params[0];
      return toRows(lessons.filter(row => row.lesson_input_hash === hash));
    }

    if (normalized.includes('from lessons where id')) {
      const id = params[0];
      return toRows(lessons.filter(row => row.id === id));
    }

    if (
      normalized.includes('from flashcards where lesson_id') &&
      normalized.includes('vocabulary_id')
    ) {
      const lessonId = params[0];
      const vocabularyId = params[1];
      return toRows(
        flashcards.filter(
          row =>
            row.lesson_id === lessonId && row.vocabulary_id === vocabularyId,
        ),
      );
    }

    if (normalized.includes('from review_schedule where rating_scale')) {
      const ratingScale = params[0];
      return toRows(
        reviewSchedule.filter(row => row.rating_scale === ratingScale),
      );
    }

    if (normalized.includes('from review_schedule where card_id')) {
      const cardId = params[0];
      return toRows(reviewSchedule.filter(row => row.card_id === cardId));
    }

    if (
      normalized.includes('from flashcards') &&
      normalized.includes('inner join review_schedule')
    ) {
      const dueBy = params[0];
      const limit =
        normalized.includes('limit') && params.length > 1
          ? Number(params[1])
          : undefined;
      const due = flashcards
        .filter(card => card.is_saved === 1)
        .map(card => ({
          card,
          schedule: reviewSchedule.find(
            schedule => schedule.card_id === card.id,
          ),
        }))
        .filter(item => item.schedule && item.schedule.next_review_at <= dueBy)
        .sort((a, b) =>
          String(a.schedule.next_review_at).localeCompare(
            String(b.schedule.next_review_at),
          ),
        )
        .map(item => item.card);
      return toRows(typeof limit === 'number' ? due.slice(0, limit) : due);
    }

    if (normalized.includes('from flashcards')) {
      let rows = [...flashcards];
      if (normalized.includes('is_saved = 1')) {
        rows = rows.filter(row => row.is_saved === 1);
      }
      if (normalized.includes('lesson_id = ?')) {
        const lessonId = params[params.length - 1];
        rows = rows.filter(row => row.lesson_id === lessonId);
      }
      rows.sort((a, b) =>
        String(a.created_at).localeCompare(String(b.created_at)),
      );
      return toRows(rows);
    }

    if (normalized.includes('from lessons order by')) {
      const sorted = [...lessons].sort((a, b) =>
        String(b.created_at).localeCompare(String(a.created_at)),
      );
      const limited =
        normalized.includes('limit') && params.length > 0
          ? sorted.slice(0, Number(params[0]))
          : sorted;
      return toRows(limited);
    }

    if (normalized === 'delete from lessons;') {
      const count = lessons.length;
      lessons.length = 0;
      return { rowsAffected: count };
    }

    if (normalized === 'delete from app_settings;') {
      const count = appSettings.length;
      appSettings.length = 0;
      return { rowsAffected: count };
    }

    if (normalized === 'delete from flashcards;') {
      const count = flashcards.length;
      flashcards.length = 0;
      return { rowsAffected: count };
    }

    if (normalized === 'delete from review_schedule;') {
      const count = reviewSchedule.length;
      reviewSchedule.length = 0;
      return { rowsAffected: count };
    }

    if (normalized === 'delete from review_sessions;') {
      const count = reviewSessions.length;
      reviewSessions.length = 0;
      return { rowsAffected: count };
    }

    if (normalized.includes('from app_settings where key')) {
      const key = params[0];
      return toRows(appSettings.filter(row => row.key === key));
    }

    return { rowsAffected: 0 };
  };

  return { execute };
}

function open({ name }) {
  if (!databases.has(name)) {
    databases.set(name, createMockDatabase());
  }

  return databases.get(name);
}

function __resetMockDatabases() {
  databases.clear();
}

module.exports = {
  open,
  __resetMockDatabases,
};
