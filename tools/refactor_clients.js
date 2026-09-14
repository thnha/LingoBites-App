const fs = require('fs');

function refactorLessonV2Client() {
  let content = fs.readFileSync('src/shared/api/lessonV2Client.ts', 'utf8');

  // Replace imports
  content = content.replace(
    /import \{\n  deleteLessonToken,\n  getLessonToken,\n  saveLessonToken,\n\} from '\.\.\/security\/lessonTokenStore';\n/,
    "import { authenticatedFetch } from './authenticatedFetch';\n"
  );
  
  // Remove anonymousUserId from LessonV2CreateInput
  content = content.replace(/  anonymousUserId\?: string;\n/, '');
  
  // Remove anonymous_user_id from payload
  content = content.replace(/, anonymous_user_id: input\.anonymousUserId/, '');

  // Remove tokenFor function
  content = content.replace(/async function tokenFor\([\s\S]*?\}\n\n/g, '');

  // In createLessonV2Skeleton
  content = content.replace(/options\.fetchImpl \?\? fetch/g, 'options.fetchImpl ?? authenticatedFetch');
  
  content = content.replace(
    /  const tokenResult = await saveLessonToken\([\s\S]*?\n    };\n/g,
    ''
  );

  // In pollLessonV2
  content = content.replace(
    /  const token = await tokenFor\(lessonId\);\n  if \(token\.error\) return token\.error;\n/,
    ''
  );
  content = content.replace(
    /      Authorization: `Bearer \$\{token\.token\}`,\n/,
    ''
  );
  
  // In mutateLessonV2
  content = content.replace(
    /  const token = await tokenFor\(lessonId\);\n  if \(token\.error\) return token\.error;\n/,
    ''
  );
  content = content.replace(
    /        Authorization: `Bearer \$\{token\.token\}`,\n/,
    ''
  );
  
  // In deleteLessonV2
  content = content.replace(
    /  const token = await tokenFor\(lessonId\);\n  if \(token\.error\) return token\.error;\n/,
    ''
  );
  content = content.replace(
    /        Authorization: `Bearer \$\{token\.token\}`,\n/,
    ''
  );
  content = content.replace(
    /  const keychainResult = await deleteLessonToken\(lessonId\);\n/g,
    ''
  );
  content = content.replace(
    /  if \(!keychainResult\.ok\)[\s\S]*?\n    };\n/g,
    ''
  );

  fs.writeFileSync('src/shared/api/lessonV2Client.ts', content);
}

refactorLessonV2Client();
