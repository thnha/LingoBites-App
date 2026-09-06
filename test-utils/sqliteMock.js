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
  const audioAssets = [];
  const gamificationEvents = [];
  const syncOutbox = [];
  // SETE-107 / M2: content package tables
  const contentPackages = [];
  const contentLessons = [];
  const contentItems = [];
  const contentUnits = [];
  const contentActivities = [];
  const contentAudioAssets = [];
  // SETE-108 / M3: lesson runtime review items
  const contentReviewItems = [];

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

    if (normalized.startsWith('insert into gamification_events')) {
      gamificationEvents.push({
        id: params[0],
        event_type: params[1],
        source_event_id: params[2],
        points: params[3],
        created_at: params[4],
      });
      return { rowsAffected: 1, insertId: gamificationEvents.length };
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

    if (normalized.startsWith('update review_schedule')) {
      const intervalDays = params[0];
      const nextReviewAt = params[1];
      const lastReviewedAt = params[2];
      const updatedAt = params[3];
      const cardId = params[4];
      const row = reviewSchedule.find(schedule => schedule.card_id === cardId);
      if (!row) {
        return { rowsAffected: 0 };
      }
      row.interval_days = intervalDays;
      row.next_review_at = nextReviewAt;
      row.last_reviewed_at = lastReviewedAt;
      row.updated_at = updatedAt;
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

    if (normalized === 'delete from audio_assets;') {
      const count = audioAssets.length;
      audioAssets.length = 0;
      return { rowsAffected: count };
    }

    if (normalized.startsWith('insert into audio_assets')) {
      audioAssets.push({
        id: params[0],
        chapter_id: params[1],
        url: params[2],
        local_path: params[3],
        bytes: params[4],
        checksum: params[5],
        download_status: params[6],
        updated_at: params[7],
      });
      return { rowsAffected: 1, insertId: audioAssets.length };
    }

    if (
      normalized.includes('update audio_assets') &&
      normalized.includes("download_status = 'ready'")
    ) {
      const localPath = params[0];
      const bytes = params[1];
      const updatedAt = params[2];
      const id = params[3];
      const row = audioAssets.find(asset => asset.id === id);
      if (!row) {
        return { rowsAffected: 0 };
      }
      row.download_status = 'ready';
      row.local_path = localPath;
      row.bytes = bytes;
      row.updated_at = updatedAt;
      return { rowsAffected: 1 };
    }

    if (
      normalized.includes('update audio_assets') &&
      normalized.includes("download_status = 'failed'")
    ) {
      const updatedAt = params[0];
      const id = params[1];
      const row = audioAssets.find(asset => asset.id === id);
      if (!row) {
        return { rowsAffected: 0 };
      }
      row.download_status = 'failed';
      row.updated_at = updatedAt;
      return { rowsAffected: 1 };
    }

    if (
      normalized.includes('update audio_assets') &&
      normalized.includes("download_status = 'downloading'")
    ) {
      const updatedAt = params[0];
      const id = params[1];
      const row = audioAssets.find(asset => asset.id === id);
      if (!row) {
        return { rowsAffected: 0 };
      }
      row.download_status = 'downloading';
      row.updated_at = updatedAt;
      return { rowsAffected: 1 };
    }

    if (
      normalized.includes('update audio_assets') &&
      normalized.includes("download_status = 'pending'")
    ) {
      const updatedAt = params[0];
      const id = params[1];
      const row = audioAssets.find(asset => asset.id === id);
      if (!row) {
        return { rowsAffected: 0 };
      }
      row.download_status = 'pending';
      row.local_path = null;
      row.bytes = 0;
      row.updated_at = updatedAt;
      return { rowsAffected: 1 };
    }

    if (
      normalized.includes('update audio_assets') &&
      normalized.includes('set url = ?')
    ) {
      const url = params[0];
      const checksum = params[1];
      const updatedAt = params[2];
      const id = params[3];
      const row = audioAssets.find(asset => asset.id === id);
      if (!row) {
        return { rowsAffected: 0 };
      }
      row.url = url;
      row.checksum = checksum;
      row.updated_at = updatedAt;
      return { rowsAffected: 1 };
    }

    if (
      normalized.includes('update audio_assets') &&
      normalized.includes('where chapter_id')
    ) {
      const updatedAt = params[0];
      const chapterId = params[1];
      let affected = 0;
      for (const row of audioAssets) {
        if (row.chapter_id === chapterId) {
          row.updated_at = updatedAt;
          affected += 1;
        }
      }
      return { rowsAffected: affected };
    }

    if (normalized.includes('delete from audio_assets where id')) {
      const id = params[0];
      const before = audioAssets.length;
      const remaining = audioAssets.filter(row => row.id !== id);
      audioAssets.length = 0;
      audioAssets.push(...remaining);
      return { rowsAffected: before - audioAssets.length };
    }

    if (normalized.includes('delete from audio_assets where chapter_id')) {
      const chapterId = params[0];
      const before = audioAssets.length;
      const remaining = audioAssets.filter(row => row.chapter_id !== chapterId);
      audioAssets.length = 0;
      audioAssets.push(...remaining);
      return { rowsAffected: before - audioAssets.length };
    }

    if (
      normalized.startsWith('select') &&
      normalized.includes('from audio_assets') &&
      normalized.includes('where download_status')
    ) {
      const status = params[0] || 'ready';
      return toRows(audioAssets.filter(row => row.download_status === status));
    }

    if (
      normalized.startsWith('select') &&
      normalized.includes('from audio_assets') &&
      normalized.includes('where chapter_id')
    ) {
      const chapterId = params[0];
      return toRows(audioAssets.filter(row => row.chapter_id === chapterId));
    }

    if (
      normalized.startsWith('select') &&
      normalized.includes('from audio_assets')
    ) {
      return toRows(audioAssets);
    }

    if (
      normalized.startsWith('select') &&
      normalized.includes('from review_schedule') &&
      normalized.includes('inner join flashcards')
    ) {
      // Upcoming-review reminders: schedule joined with flashcard word.
      const now = params[0];
      const rows = reviewSchedule
        .filter(row => row.next_review_at > now)
        .map(row => {
          const matched = flashcards.find(
            item => item.id === row.card_id,
          );
          return {
            card_id: row.card_id,
            word: matched && matched.is_saved === 1 ? matched.word : '',
            next_review_at: row.next_review_at,
          };
        })
        .filter(item => item.word !== '');
      return toRows(rows);
    }

    if (
      normalized.startsWith('select') &&
      normalized.includes('from review_sessions')
    ) {
      return toRows([...reviewSessions]);
    }

    if (
      normalized.includes('from gamification_events') &&
      normalized.startsWith('select')
    ) {
      return toRows([...gamificationEvents]);
    }

    if (normalized === 'delete from gamification_events;') {
      const count = gamificationEvents.length;
      gamificationEvents.length = 0;
      return { rowsAffected: count };
    }

    if (normalized.includes('from app_settings where key')) {
      const key = params[0];
      return toRows(appSettings.filter(row => row.key === key));
    }

    // ---- SETE-107 / M2 content package tables ----
    if (normalized.startsWith('insert into content_packages')) {
      contentPackages.push({
        id: params[0],
        slug: params[1],
        schema_version: params[2],
        source_url: params[3],
        sha256: params[4],
        is_active: params[5],
        imported_at: params[6],
        deactivated_at: params[7],
      });
      return { rowsAffected: 1, insertId: contentPackages.length };
    }

    if (normalized.startsWith('insert into content_lessons')) {
      contentLessons.push({
        id: params[0],
        package_id: params[1],
        slug: params[2],
        schema_version: params[3],
        title_en: params[4],
        title_vi: params[5],
        blurb_vi: params[6],
        level: params[7],
        target_skills_json: params[8],
        estimated_duration_minutes: params[9],
      });
      return { rowsAffected: 1, insertId: contentLessons.length };
    }

    if (normalized.startsWith('insert into content_items')) {
      contentItems.push({
        id: params[0],
        lesson_id: params[1],
        package_id: params[2],
        slug: params[3],
        chunk_order: params[4],
        phrase_en: params[5],
        phrase_vi: params[6],
        explanation_vi: params[7],
        context_sentence_en: params[8],
        context_sentence_vi: params[9],
        payload_json: params[10],
      });
      return { rowsAffected: 1, insertId: contentItems.length };
    }

    if (normalized.startsWith('insert into content_units')) {
      contentUnits.push({
        id: params[0],
        lesson_id: params[1],
        package_id: params[2],
        unit_type: params[3],
        slug: params[4],
        payload_json: params[5],
      });
      return { rowsAffected: 1, insertId: contentUnits.length };
    }

    if (normalized.startsWith('insert into content_activities')) {
      contentActivities.push({
        id: params[0],
        lesson_id: params[1],
        package_id: params[2],
        slug: params[3],
        activity_type: params[4],
        title_vi: params[5],
        chunk_ref_ids_json: params[6],
        qa_ref_ids_json: params[7],
        instructions_vi: params[8],
      });
      return { rowsAffected: 1, insertId: contentActivities.length };
    }

    if (normalized.startsWith('insert into content_audio_assets')) {
      contentAudioAssets.push({
        id: params[0],
        lesson_id: params[1],
        package_id: params[2],
        slug: params[3],
        url: params[4],
        checksum: params[5],
        bytes: params[6],
        locale: params[7],
        transcript: params[8],
      });
      return { rowsAffected: 1, insertId: contentAudioAssets.length };
    }

    if (
      normalized.startsWith('update content_packages') &&
      normalized.includes('is_active = 0')
    ) {
      const deactivatedAt = params[0];
      const id = params[1];
      const row = contentPackages.find(p => p.id === id);
      if (!row) return { rowsAffected: 0 };
      row.is_active = 0;
      row.deactivated_at = deactivatedAt;
      return { rowsAffected: 1 };
    }

    if (
      normalized.startsWith('update content_packages') &&
      normalized.includes('is_active = 1')
    ) {
      const id = params[0];
      const row = contentPackages.find(p => p.id === id);
      if (!row) return { rowsAffected: 0 };
      row.is_active = 1;
      row.deactivated_at = null;
      return { rowsAffected: 1 };
    }

    if (normalized.includes('from content_packages where is_active = 1')) {
      return toRows(contentPackages.filter(p => p.is_active === 1));
    }

    if (
      normalized.startsWith('select') &&
      normalized.includes('from content_packages where id') &&
      !normalized.includes('count(*)')
    ) {
      const id = params[0];
      return toRows(contentPackages.filter(p => p.id === id));
    }

    if (normalized.includes('from content_packages order by')) {
      const sorted = [...contentPackages].sort((a, b) =>
        String(b.imported_at).localeCompare(String(a.imported_at)),
      );
      return toRows(sorted);
    }

    if (
      normalized.includes('from content_packages') &&
      normalized.includes('where is_active = 0') &&
      normalized.includes('order by datetime(deactivated_at) desc')
    ) {
      const sorted = contentPackages
        .filter(p => p.is_active === 0 && p.deactivated_at !== null)
        .sort((a, b) =>
          String(b.deactivated_at).localeCompare(String(a.deactivated_at)),
        );
      return toRows(sorted.slice(0, 1));
    }

    if (normalized.startsWith('select count(*)') && normalized.includes('from content_lessons')) {
      const packageId = params[0];
      const n = contentLessons.filter(l => l.package_id === packageId).length;
      return toRows([{ n }]);
    }

    if (normalized.startsWith('select count(*)') && normalized.includes('from content_items')) {
      let rows = contentItems;
      if (normalized.includes('where lesson_id')) {
        const lessonId = params[0];
        rows = contentItems.filter(i => i.lesson_id === lessonId);
      }
      return toRows([{ n: rows.length }]);
    }

    if (normalized.startsWith('select') && normalized.includes('from content_items')) {
      let rows = [...contentItems];
      if (normalized.includes('where lesson_id = ?')) {
        const lessonId = params[params.length - 1];
        rows = rows.filter(i => i.lesson_id === lessonId);
      }
      if (normalized.includes('order by chunk_order')) {
        rows.sort((a, b) => a.chunk_order - b.chunk_order);
      }
      return toRows(rows);
    }

    if (normalized.startsWith('select') && normalized.includes('from content_lessons')) {
      let rows = [...contentLessons];
      if (normalized.includes('where package_id = ?')) {
        const packageId = params[0];
        rows = rows.filter(l => l.package_id === packageId);
      }
      if (normalized.includes('where id = ?')) {
        const id = params[0];
        rows = rows.filter(l => l.id === id);
      }
      return toRows(rows);
    }

    if (normalized.startsWith('select count(*)') && normalized.includes('from content_packages')) {
      const id = params[0];
      const n = contentPackages.filter(p => p.id === id).length;
      return toRows([{ n }]);
    }

    if (normalized.startsWith('delete from content_audio_assets where package_id')) {
      const packageId = params[0];
      const before = contentAudioAssets.length;
      const remaining = contentAudioAssets.filter(a => a.package_id !== packageId);
      contentAudioAssets.length = 0;
      contentAudioAssets.push(...remaining);
      return { rowsAffected: before - remaining.length };
    }
    if (normalized.startsWith('delete from content_activities where package_id')) {
      const packageId = params[0];
      const before = contentActivities.length;
      const remaining = contentActivities.filter(a => a.package_id !== packageId);
      contentActivities.length = 0;
      contentActivities.push(...remaining);
      return { rowsAffected: before - remaining.length };
    }
    if (normalized.startsWith('delete from content_units where package_id')) {
      const packageId = params[0];
      const before = contentUnits.length;
      const remaining = contentUnits.filter(a => a.package_id !== packageId);
      contentUnits.length = 0;
      contentUnits.push(...remaining);
      return { rowsAffected: before - remaining.length };
    }
    if (normalized.startsWith('delete from content_items where package_id')) {
      const packageId = params[0];
      const before = contentItems.length;
      const remaining = contentItems.filter(a => a.package_id !== packageId);
      contentItems.length = 0;
      contentItems.push(...remaining);
      return { rowsAffected: before - remaining.length };
    }
    if (normalized.startsWith('delete from content_lessons where package_id')) {
      const packageId = params[0];
      const before = contentLessons.length;
      const remaining = contentLessons.filter(a => a.package_id !== packageId);
      contentLessons.length = 0;
      contentLessons.push(...remaining);
      return { rowsAffected: before - remaining.length };
    }
    if (normalized.startsWith('delete from content_packages where id')) {
      const id = params[0];
      const before = contentPackages.length;
      const remaining = contentPackages.filter(p => p.id !== id);
      contentPackages.length = 0;
      contentPackages.push(...remaining);
      return { rowsAffected: before - remaining.length };
    }

    if (
      normalized.startsWith('select') &&
      normalized.includes('from content_activities')
    ) {
      const lessonId = params[0];
      return toRows(contentActivities.filter(a => a.lesson_id === lessonId));
    }

    if (
      normalized.startsWith('select') &&
      normalized.includes('from content_audio_assets')
    ) {
      const lessonId = params[0];
      return toRows(contentAudioAssets.filter(a => a.lesson_id === lessonId));
    }

    if (
      normalized.startsWith('select') &&
      normalized.includes('from content_units')
    ) {
      const lessonId = params[0];
      let rows = contentUnits.filter(u => u.lesson_id === lessonId);
      if (normalized.includes("unit_type = 'srs'")) {
        rows = rows.filter(u => u.unit_type === 'srs');
      }
      return toRows(rows);
    }

    // ---- SETE-108 / M3 lesson runtime review items ----
    if (normalized.startsWith('insert or ignore into content_review_items')) {
      const srsItemId = params[1];
      if (contentReviewItems.some(r => r.srs_item_id === srsItemId)) {
        return { rowsAffected: 0 };
      }
      contentReviewItems.push({
        id: params[0],
        srs_item_id: params[1],
        lesson_id: params[2],
        package_id: params[3],
        item_type: params[4],
        source_ref_id: params[5],
        front: params[6],
        back: params[7],
        hint_vi: params[8],
        mastery_state: 'new',
        next_review_at: params[9],
        created_at: params[10],
        updated_at: params[11],
      });
      return { rowsAffected: 1, insertId: contentReviewItems.length };
    }

    if (
      normalized.startsWith('select') &&
      normalized.includes('from content_review_items')
    ) {
      if (normalized.includes('where lesson_id = ?')) {
        const lessonId = params[0];
        return toRows(contentReviewItems.filter(r => r.lesson_id === lessonId));
      }
      if (normalized.includes('where id = ?')) {
        const id = params[0];
        return toRows(contentReviewItems.filter(r => r.id === id));
      }
      return toRows([...contentReviewItems]);
    }

    // ---- SETE-109 / M4 content review scheduling ----
    if (normalized.startsWith('update content_review_items')) {
      const masteryState = params[0];
      const nextReviewAt = params[1];
      const updatedAt = params[2];
      const id = params[3];
      const row = contentReviewItems.find(r => r.id === id);
      if (!row) {
        return { rowsAffected: 0 };
      }
      row.mastery_state = masteryState;
      row.next_review_at = nextReviewAt;
      row.updated_at = updatedAt;
      return { rowsAffected: 1 };
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
