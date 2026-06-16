/* eslint-env jest */

// Import jest-dom for DOM matchers
require('@testing-library/jest-dom');

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
  deleteDatabaseAsync: jest.fn(),
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn().mockResolvedValue({ type: 'cancel' }),
  openBrowserAsync: jest.fn().mockResolvedValue({ type: 'cancel' }),
}));

// Mock react-native (only the bits used in unit tests). Default OS is non-android
// so notification side effects are no-ops unless a test overrides it.
jest.mock('react-native', () => ({
  Platform: { OS: 'web', select: (obj) => obj.web ?? obj.default },
}));

// Mock Notifee native module
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn().mockResolvedValue('rest-timer'),
    displayNotification: jest.fn().mockResolvedValue(undefined),
    createTriggerNotification: jest.fn().mockResolvedValue('rest-timer-done'),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
    requestPermission: jest.fn().mockResolvedValue({ authorizationStatus: 1 }),
  },
  AndroidImportance: { LOW: 2, HIGH: 4 },
  AndroidVisibility: { PUBLIC: 1 },
  AuthorizationStatus: { DENIED: 0, AUTHORIZED: 1 },
  TriggerType: { TIMESTAMP: 0 },
  AlarmType: { SET_AND_ALLOW_WHILE_IDLE: 1 },
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set up global test timeout
jest.setTimeout(10000);