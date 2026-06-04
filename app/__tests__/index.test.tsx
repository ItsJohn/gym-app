import { render, screen } from "@testing-library/react";
import React from "react";
import HomeScreen from "../(tabs)/index";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
}));

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useFocusEffect: jest.fn(),
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
jest.mock("@/components/home", () => ({
  HomeHeader: () => <div data-testid="home-header" />,
  NextWorkout: () => <div data-testid="next-workout" />,
  QuickStats: () => <div data-testid="quick-stats" />,
  RecentActivity: () => <div data-testid="recent-activity" />,
  WorkoutRenewalBanner: () => <div data-testid="renewal-banner" />,
}));
jest.mock("@/components/home/ContinueWorkoutButton", () => () => (
  <div data-testid="continue-workout" />
));
jest.mock("@/components/home/SchedulePreview", () => () => (
  <div data-testid="schedule-preview" />
));
jest.mock("@/components/home/TodaysWorkoutButton", () => () => (
  <div data-testid="todays-workout" />
));
jest.mock("@/components/home/WorkoutCompleteButton", () => ({
  WorkoutCompleteButton: () => <div data-testid="workout-complete" />,
}));
jest.mock("@/components/landing/EmptyState", () => ({
  EmptyState: () => <div data-testid="empty-state" />,
}));

jest.mock("@/hooks/useStravaSync", () => ({
  useStravaSync: () => ({ syncing: false, lastSyncCount: null, error: null }),
}));

const mockUseHomeData = jest.fn();
jest.mock("@/hooks/useHomeData", () => ({
  useHomeData: () => mockUseHomeData(),
}));

const mockHooks: Record<string, jest.Mock> = {
  useTodaysWorkout: jest.fn(),
  useNextWorkout: jest.fn(),
  useMostRecentIncompleteSession: jest.fn(),
  useTodaysWorkoutCompletion: jest.fn(),
  useWorkoutRenewalNotice: jest.fn(),
};
jest.mock("@/hooks", () => ({
  useTodaysWorkout: () => mockHooks.useTodaysWorkout(),
  useNextWorkout: () => mockHooks.useNextWorkout(),
  useMostRecentIncompleteSession: () =>
    mockHooks.useMostRecentIncompleteSession(),
  useTodaysWorkoutCompletion: () => mockHooks.useTodaysWorkoutCompletion(),
  useWorkoutRenewalNotice: () => mockHooks.useWorkoutRenewalNotice(),
}));

describe("HomeScreen", () => {
  beforeEach(() => {
    mockHooks.useTodaysWorkout.mockReturnValue({
      data: null,
      isLoading: false,
    });
    mockHooks.useNextWorkout.mockReturnValue({ data: null, isLoading: false });
    mockHooks.useMostRecentIncompleteSession.mockReturnValue({
      data: null,
      isLoading: false,
    });
    mockHooks.useTodaysWorkoutCompletion.mockReturnValue({
      data: false,
      isLoading: false,
    });
    mockHooks.useWorkoutRenewalNotice.mockReturnValue({ data: null });
  });

  it("shows loading state when data is loading", () => {
    mockUseHomeData.mockReturnValue({
      stats: { totalWorkouts: 0, recentSessions: 0, thisWeekSessions: 0 },
      recentSession: null,
      isLoading: true,
    });

    render(<HomeScreen />);
    expect(screen.getByText("Loading your fitness data...")).toBeDefined();
  });

  it("renders main content when loaded with workouts", () => {
    mockUseHomeData.mockReturnValue({
      stats: { totalWorkouts: 3, recentSessions: 5, thisWeekSessions: 2 },
      recentSession: null,
      isLoading: false,
    });

    render(<HomeScreen />);
    expect(screen.getByTestId("home-header")).toBeDefined();
    expect(screen.getByTestId("quick-stats")).toBeDefined();
    expect(screen.getByTestId("schedule-preview")).toBeDefined();
  });
});
