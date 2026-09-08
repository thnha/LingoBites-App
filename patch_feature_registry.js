const fs = require('fs');

const entryPoints = {
  pasteTextInput: 'HomeScreen -> PasteText',
  imageInput: 'HomeScreen -> ImageCapture',
  ocrScanner: 'ImageCaptureScreen',
  ocrReviewEdit: 'OCRReviewScreen',
  aiLessonAnalysis: 'AnalyzingScreen',
  lessonResultView: 'LessonResultScreen',
  lessonSave: 'LessonResultScreen -> Save button',
  lessonHistory: 'LessonsTab -> LessonsHistoryScreen',
  lingobitesMvpReviewFlow: 'N/A (Routing Config)',
  shortPractice: 'LessonResultScreen -> Practice button',
  themeSystem: 'App root (ThemeProvider)',
  themeSwitcher: 'ProfileScreen -> ThemePicker',
  darkTheme: 'ThemePicker option',
  pastelKidsTheme: 'ThemePicker option',
  coreTheme: 'ThemePicker option',
  neoTheme: 'ThemePicker option',
  comicTheme: 'ThemePicker option',
  cartoonTheme: 'ThemePicker option',
  reviewSystem: 'DailyReviewScreen'
};

let content = fs.readFileSync('src/release/feature-registry.ts', 'utf8');

// replace stable with ready
content = content.replace(/status: 'stable'/g, "status: 'ready'");

// add entryPoint to each entry that has one in the map
content = content.replace(/status: 'ready',/g, (match, offset, str) => {
  // extract key from context
  const pre = str.substring(0, offset);
  const keyMatch = pre.match(/key:\s*'([^']+)'/);
  if (keyMatch) {
    const key = keyMatch[1];
    if (entryPoints[key]) {
      return `status: 'ready',\n    entryPoint: '${entryPoints[key]}',`;
    }
  }
  return match;
});

fs.writeFileSync('src/release/feature-registry.ts', content);
