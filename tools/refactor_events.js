const fs = require('fs');

function refactorEvents(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/typeof fetch/g, 'typeof authenticatedFetch');
  content = content.replace(/deps\.fetchImpl \?\? fetch/g, 'deps.fetchImpl ?? authenticatedFetch');
  content = content.replace(/  anonymous_user_id: string;\n/, '');
  
  if (!content.includes('authenticatedFetch')) {
    content = content.replace(/import /, "import { authenticatedFetch } from './authenticatedFetch';\nimport ");
  }

  // Remove `anonymous_user_id: input.anonymousUserId,` and `anonymousUserId: string;`
  content = content.replace(/  anonymousUserId: string;\n/, '');
  content = content.replace(/        anonymous_user_id: input\.anonymousUserId,\n/, '');
  content = content.replace(/      anonymous_user_id: input\.anonymousUserId,\n/, '');

  fs.writeFileSync(file, content);
}

refactorEvents('src/shared/api/practiceEventsClient.ts');
refactorEvents('src/shared/api/reviewEventsClient.ts');
