const fs = require('fs');
const file = 'src/release/types.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "export type FeatureStatus = 'not_implemented' | 'experimental' | 'stable';",
  "export type FeatureStatus = 'ready' | 'beta' | 'incomplete' | 'not_implemented' | 'blocked';"
);

fs.writeFileSync(file, content);
