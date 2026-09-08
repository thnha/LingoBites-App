const {evaluateWarningBudget} = require('../check-eslint-warning-budget');

const baseResults = [
  {
    filePath: '/repo/src/components/AppButton.tsx',
    warningCount: 1,
    messages: [
      {
        severity: 1,
        ruleId: 'react-native-a11y/has-accessibility-hint',
      },
    ],
  },
  {
    filePath: '/repo/src/modules/lesson/LessonResultView.tsx',
    warningCount: 2,
    messages: [
      {
        severity: 1,
        ruleId: 'react-native/no-inline-styles',
      },
      {
        severity: 1,
        ruleId: 'no-void',
      },
    ],
  },
];

describe('evaluateWarningBudget', () => {
  it('passes when warning totals stay within the configured budget', () => {
    const result = evaluateWarningBudget(baseResults, {
      totalWarnings: 3,
      rules: {
        'react-native-a11y/has-accessibility-hint': 1,
        'react-native/no-inline-styles': 1,
        'no-void': 1,
      },
    });

    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.summary.totalWarnings).toBe(3);
  });

  it('fails when a rule-specific warning count grows above budget', () => {
    const result = evaluateWarningBudget(baseResults, {
      totalWarnings: 3,
      rules: {
        'react-native-a11y/has-accessibility-hint': 0,
        'react-native/no-inline-styles': 1,
        'no-void': 1,
      },
    });

    expect(result.ok).toBe(false);
    expect(result.failures).toEqual([
      'react-native-a11y/has-accessibility-hint warnings 1 exceed budget 0',
    ]);
  });
});
