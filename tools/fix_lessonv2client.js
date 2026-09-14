const fs = require('fs');
let content = fs.readFileSync('src/shared/api/lessonV2Client.ts', 'utf8');

// For createLessonV2
content = content.replace(
  /const fetchImpl = options\.fetchImpl \?\? authenticatedFetch;\n  const response = await fetchImpl\(/,
  "const response = await authenticatedFetch("
);
content = content.replace(
  /        'Idempotency-Key': idempotencyKey,\n      \},\n      body: JSON.stringify\(\{input_hash: inputHash, source_type: sourceType\}\),\n      signal: options\.signal,\n    \},\n  \);/,
  "        'Idempotency-Key': idempotencyKey,\n      },\n      body: JSON.stringify({input_hash: inputHash, source_type: sourceType}),\n      signal: options.signal,\n    },\n    options.fetchImpl\n  );"
);

// For pollLessonV2
content = content.replace(
  /const fetchImpl = options\.fetchImpl \?\? authenticatedFetch;\n  const response = await fetchImpl\(/,
  "const response = await authenticatedFetch("
);
content = content.replace(
  /      headers: \{Accept: 'application\/json'\},\n      signal: options\.signal,\n    \},\n  \);/,
  "      headers: {Accept: 'application/json'},\n      signal: options.signal,\n    },\n    options.fetchImpl\n  );"
);

// For retryLessonV2Chunk
content = content.replace(
  /const fetchImpl = options\.fetchImpl \?\? authenticatedFetch;\n\n  const response = await fetchImpl\(/,
  "const response = await authenticatedFetch("
);
content = content.replace(
  /      headers: \{\n        Accept: 'application\/json',\n        'Idempotency-Key': idempotencyKey,\n      \},\n      signal: options\.signal,\n    \},\n  \);/,
  "      headers: {\n        Accept: 'application/json',\n        'Idempotency-Key': idempotencyKey,\n      },\n      signal: options.signal,\n    },\n    options.fetchImpl\n  );"
);

fs.writeFileSync('src/shared/api/lessonV2Client.ts', content);
