module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
  overrides: [
    {
      files: ['src/components/**/*.tsx', 'src/modules/**/*.tsx'],
      rules: {
        'react-native/no-color-literals': 'error',
      },
    },
  ],
};
