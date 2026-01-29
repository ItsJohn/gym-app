import { render, screen } from "@testing-library/react";
import React from "react";
import SettingsScreen from "../(tabs)/settings";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
  ScrollView: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/GymLogo", () => () => <div data-testid="gym-logo" />);
jest.mock("@/components/ParallaxScrollView", () => ({ children }: any) => (
  <div data-testid="parallax-scroll">{children}</div>
));
jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children }: any) => <span>{children}</span>,
}));
jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/settings/SettingItem", () => ({ title }: any) => (
  <div data-testid={`setting-item-${title}`}>{title}</div>
));
jest.mock(
  "@/components/settings/SettingSection",
  () =>
    ({ children, title }: any) => (
      <div data-testid={`setting-section-${title}`}>{children}</div>
    ),
);
jest.mock("@/components/settings/SettingSwitch", () => ({ title }: any) => (
  <div data-testid={`setting-switch-${title}`}>{title}</div>
));

const mockUseSettingsActions = jest.fn();
jest.mock("@/hooks/useSettingsActions", () => ({
  useSettingsActions: () => mockUseSettingsActions(),
  formatRestTime: (v: number) => `${v}s`,
  formatWeightUnit: (v: string) => v,
  formatRestSound: (v: string) => v,
  formatTheme: (v: string) => v,
}));

describe("SettingsScreen", () => {
  beforeEach(() => {
    mockUseSettingsActions.mockReturnValue({
      settings: {
        weightUnit: "kg",
        defaultRestTime: 60,
        autoAdvanceAfterSet: false,
        showExerciseDescriptions: true,
        restTimerSound: "beep",
        vibrationEnabled: true,
        theme: "system",
      },
      updateSetting: jest.fn(),
      handleWeightUnitChange: jest.fn(),
      handleRestTimeChange: jest.fn(),
      handleRestSoundChange: jest.fn(),
      handleThemeChange: jest.fn(),
      handleResetSettings: jest.fn(),
      handleClearDatabase: jest.fn(),
    });
  });

  it("renders the settings title", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("Settings")).toBeDefined();
  });

  it("renders all setting sections", () => {
    render(<SettingsScreen />);
    expect(
      screen.getByTestId("setting-section-Workout Preferences"),
    ).toBeDefined();
    expect(
      screen.getByTestId("setting-section-Notifications & Feedback"),
    ).toBeDefined();
    expect(screen.getByTestId("setting-section-Appearance")).toBeDefined();
    expect(screen.getByTestId("setting-section-Advanced")).toBeDefined();
  });
});
