module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared$': '<rootDir>/src/shared',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@modules$': '<rootDir>/src/modules',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@components$': '<rootDir>/src/components',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@theme$': '<rootDir>/src/theme',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
  },
};
