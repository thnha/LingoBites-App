const fs = require('fs');
let content = fs.readFileSync('src/shared/api/lessonV2Client.ts', 'utf8');

content = content.replace(
  /async function request\(\n  fetchImpl: FetchImpl,\n  url: string,\n  init: RequestInit,\n  signal: AbortSignal \| undefined,\n  timeoutMs: number,\n\): Promise<\{response\?: Response; error\?: LessonV2ClientError\}> \{\n  const timeout = withTimeout\(timeoutMs, signal\);\n  try \{\n    return \{response: await fetchImpl\(url, \{\.\.\.init, signal: timeout\.signal\}\)\};\n  \} catch \{/g,
  `async function request(
  fetchImpl: FetchImpl | undefined,
  url: string,
  init: RequestInit,
  signal: AbortSignal | undefined,
  timeoutMs: number,
): Promise<{response?: Response; error?: LessonV2ClientError}> {
  const timeout = withTimeout(timeoutMs, signal);
  try {
    return {response: await authenticatedFetch(url, {...init, signal: timeout.signal}, fetchImpl)};
  } catch {`
);

// We need to pass options.fetchImpl down to request instead of options.fetchImpl ?? authenticatedFetch
content = content.replace(
  /options\.fetchImpl \?\? authenticatedFetch,/g,
  "options.fetchImpl,"
);

fs.writeFileSync('src/shared/api/lessonV2Client.ts', content);
