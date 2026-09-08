const fs = require('fs');

let content = fs.readFileSync('src/modules/settings/ProfileScreen.tsx', 'utf8');

content = content.replace(
  "accessibilityHint={t('settings.feature_status_desc')}\\n            accessibilityLabel={t('settings.feature_status')}",
  "accessibilityLabel={t('settings.feature_status')}"
);

// fix the actual string
content = content.replace(
  "accessibilityHint={t('settings.feature_status_desc')}\n            accessibilityLabel={t('settings.feature_status')}",
  "accessibilityLabel={t('settings.feature_status')}"
);

fs.writeFileSync('src/modules/settings/ProfileScreen.tsx', content);
