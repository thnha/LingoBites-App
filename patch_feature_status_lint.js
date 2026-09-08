const fs = require('fs');

let content = fs.readFileSync('src/modules/settings/FeatureStatusScreen.tsx', 'utf8');

content = content.replace(
  "import {featureRegistry, useFeatureEnabled} from '@/release';",
  "import {featureRegistry, useFeatureFlags} from '@/release';"
);

content = content.replace(
  "const themedStyles = makeStyles(theme);",
  "const themedStyles = makeStyles(theme);\n  const { isFeatureEnabled } = useFeatureFlags();"
);

content = content.replace(
  "const isEnabled = useFeatureEnabled(entry.key as any);",
  "const isEnabled = isFeatureEnabled(entry.key as any);"
);

fs.writeFileSync('src/modules/settings/FeatureStatusScreen.tsx', content);
