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

// Native device-integration modules (SETE-90). Each adapter injects its own
// fake in its unit tests; these global mocks only keep imports safe under Jest
// (the real modules touch native bindings that do not exist in the JS runtime).
jest.mock('@notifee/react-native', () => {
  const AuthorizationStatus = {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  };
  return {
    __esModule: true,
    default: {
      getNotificationSettings: jest.fn(),
      requestPermission: jest.fn(),
      createChannel: jest.fn(),
      getTriggerNotifications: jest.fn(),
      createTriggerNotification: jest.fn(),
      cancelTriggerNotification: jest.fn(),
    },
    AuthorizationStatus,
    AndroidImportance: { DEFAULT: 3, HIGH: 4 },
    TriggerType: { TIMESTAMP: 0 },
  };
});

jest.mock('@dr.pogodin/react-native-fs', () => ({
  __esModule: true,
  DocumentDirectoryPath: '/mock/Documents',
  exists: jest.fn(),
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
}));

jest.mock('react-native-sound', () => {
  class MockSound {
    static setActive() {}
    static setCategory() {}
    constructor(filename, _basePath, cb) {
      this.filename = filename;
      this.cb = cb;
    }
    play() {
      return this;
    }
    stop() {
      return this;
    }
    release() {
      return this;
    }
  }
  return MockSound;
});

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
