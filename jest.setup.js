import {jest} from '@jest/globals';

// Polyfill for global.fetch if not present (e.g., in some Jest environments)
if (typeof global !== 'undefined' && !global.fetch) {
  global.fetch = jest.fn();
}

// Mock the global.crypto for tests that might use it
if (typeof global !== 'undefined' && !global.crypto) {
  global.crypto = {
    randomUUID: () => 'mock-uuid',
  };
}

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    APP_ENV: 'local',
    API_BASE_URL: 'http://localhost:3000',
    USE_MOCK_AI: 'true',
    USE_MOCK_OCR: 'true',
    AI_SCHEMA_VERSION: 'ai-output-v1',
    SUPPORT_EMAIL: 'support@lingobites.app',
  },
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-quick-sqlite', () => require('./test-utils/sqliteMock'));

jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: callback => {
      React.useEffect(() => callback(), [callback]);
    },
    useNavigation: () => ({
      goBack: jest.fn(),
      navigate: jest.fn(),
    }),
  };
});
