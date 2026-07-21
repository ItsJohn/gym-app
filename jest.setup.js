/* eslint-env jest */

// Import jest-dom for DOM matchers
require("@testing-library/jest-dom");

// Mock expo-sqlite
jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn(),
  deleteDatabaseAsync: jest.fn(),
}));

// Mock expo-web-browser
jest.mock("expo-web-browser", () => ({
  openAuthSessionAsync: jest.fn().mockResolvedValue({ type: "cancel" }),
  openBrowserAsync: jest.fn().mockResolvedValue({ type: "cancel" }),
}));

// Mock expo file-system / sharing native modules used by data export
jest.mock("expo-file-system", () => ({
  File: class {
    constructor() {
      this.uri = "file://mock";
      this.exists = false;
    }
    create() {}
    delete() {}
    write() {}
  },
  Paths: { cache: "file://cache" },
}));
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(false),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock react-native (only the bits used in unit tests). Default OS is non-android
// so notification side effects are no-ops unless a test overrides it.
jest.mock("react-native", () => ({
  Platform: { OS: "web", select: (obj) => obj.web ?? obj.default },
}));

// Mock expo-notifications native module
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue("notification-id"),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  dismissNotificationAsync: jest.fn().mockResolvedValue(undefined),
  AndroidImportance: { LOW: 2, HIGH: 4 },
  AndroidNotificationVisibility: { PUBLIC: 1 },
  SchedulableTriggerInputTypes: { DATE: "date" },
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
