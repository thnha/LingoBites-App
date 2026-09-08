module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@shared': './src/shared',
          '@modules': './src/modules',
          '@components': './src/components',
          '@theme': './src/theme',
        },
      },
    ],
    'react-native-worklets/plugin', // must be last
  ],
};
