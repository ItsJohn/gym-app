import { render, screen } from "@testing-library/react";
import React from "react";
import WorkoutsScreen from "../(tabs)/workouts";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
  Alert: { alert: jest.fn() },
  Modal: ({ children }: any) => <div>{children}</div>,
  TouchableOpacity: ({ children, onPress }: any) => (
    <div onClick={onPress}>{children}</div>
  ),
}));

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
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
jest.mock("@/components/workout/EmptyState", () => ({
  EmptyState: () => <div data-testid="empty-state" />,
}));
jest.mock("@/components/workout/ScheduleInfo", () => ({
  ScheduleInfo: () => <div data-testid="schedule-info" />,
}));
jest.mock("@/components/workout/WorkoutCard", () => ({
  WorkoutCard: ({ workout }: any) => (
    <div data-testid={`workout-card-${workout.id}`}>{workout.title}</div>
  ),
}));
jest.mock("@/components/workout/TrainingPlanSection", () => ({
  TrainingPlanSection: () => <div data-testid="training-plan-section" />,
}));
jest.mock("@/components/workout/WorkoutScheduleManager", () => () => (
  <div data-testid="schedule-manager" />
));

const mockUseActiveWorkouts = jest.fn();
const mockUseDeleteWorkout = jest.fn();
jest.mock("@/hooks", () => ({
  useActiveWorkouts: () => mockUseActiveWorkouts(),
  useDeleteWorkout: () => mockUseDeleteWorkout(),
}));

describe("WorkoutsScreen", () => {
  beforeEach(() => {
    mockUseDeleteWorkout.mockReturnValue({ mutateAsync: jest.fn() });
  });

  it("shows loading state", () => {
    mockUseActiveWorkouts.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<WorkoutsScreen />);
    expect(screen.getByText("Loading...")).toBeDefined();
  });

  it("renders workout cards when loaded", () => {
    mockUseActiveWorkouts.mockReturnValue({
      data: [
        { id: 1, title: "Push Day", exercises: [] },
        { id: 2, title: "Pull Day", exercises: [] },
      ],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<WorkoutsScreen />);
    expect(screen.getByText("My Workouts")).toBeDefined();
    expect(screen.getByTestId("workout-card-1")).toBeDefined();
    expect(screen.getByTestId("workout-card-2")).toBeDefined();
  });
});
