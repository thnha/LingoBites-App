module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['src/components/**/*.tsx', 'src/modules/**/*.tsx'],
      rules: {
        'react-native/no-color-literals': 'error',
      },
    },
  ],
};
