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

  const execute = (sql, params = []) => {
    const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase();

    if (normalized.startsWith('create table') || normalized.startsWith('create index')) {
      return {rowsAffected: 0};
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
      });
      return {rowsAffected: 1, insertId: lessons.length};
    }

    if (normalized.startsWith('insert into app_settings')) {
      appSettings.push({
        key: params[0],
        value: params[1],
        updated_at: params[2],
      });
      return {rowsAffected: 1};
    }

    if (normalized.includes('delete from lessons where id')) {
      const id = params[0];
      const before = lessons.length;
      const remaining = lessons.filter(row => row.id !== id);
      lessons.length = 0;
      lessons.push(...remaining);
      return {rowsAffected: before - lessons.length};
    }

    if (normalized.includes('from lessons where lesson_input_hash')) {
      const hash = params[0];
      return toRows(lessons.filter(row => row.lesson_input_hash === hash));
    }

    if (normalized.includes('from lessons where id')) {
      const id = params[0];
      return toRows(lessons.filter(row => row.id === id));
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
      return {rowsAffected: count};
    }

    if (normalized === 'delete from app_settings;') {
      const count = appSettings.length;
      appSettings.length = 0;
      return {rowsAffected: count};
    }

    if (normalized.includes('from app_settings where key')) {
      const key = params[0];
      return toRows(appSettings.filter(row => row.key === key));
    }

    return {rowsAffected: 0};
  };

  return {execute};
}

function open({name}) {
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
