import { render, screen } from "@testing-library/react";
import React from "react";
import HistoryScreen from "../(tabs)/history";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
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
jest.mock("@/components/history/SessionsSection", () => ({
  SessionsSection: () => <div data-testid="sessions-section" />,
}));
jest.mock("@/components/history/StatsSection", () => ({
  StatsSection: () => <div data-testid="stats-section" />,
}));

const mockUseHistoryData = jest.fn();
jest.mock("@/hooks/useHistoryData", () => ({
  useHistoryData: () => mockUseHistoryData(),
}));

describe("HistoryScreen", () => {
  it("shows loading state", () => {
    mockUseHistoryData.mockReturnValue({
      stats: {},
      feed: [],
      isLoading: true,
      handleSessionPress: jest.fn(),
      handleRunPress: jest.fn(),
    });

    render(<HistoryScreen />);
    expect(screen.getByText("Loading...")).toBeDefined();
  });

  it("renders history content when loaded", () => {
    mockUseHistoryData.mockReturnValue({
      stats: { totalWorkouts: 2 },
      feed: [],
      isLoading: false,
      handleSessionPress: jest.fn(),
      handleRunPress: jest.fn(),
    });

    render(<HistoryScreen />);
    expect(screen.getByText("History")).toBeDefined();
    expect(screen.getByTestId("stats-section")).toBeDefined();
    expect(screen.getByTestId("sessions-section")).toBeDefined();
  });
});
