import { render, screen } from "@testing-library/react";
import React from "react";
import WorkoutPreviewScreen from "../workout-preview";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
}));

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ workoutId: "1" }),
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
jest.mock("@/components/workout-preview/ExerciseList", () => () => (
  <div data-testid="exercise-list" />
));
jest.mock("@/components/workout-preview/StartWorkoutButton", () => () => (
  <div data-testid="start-workout-button" />
));
jest.mock(
  "@/components/workout-preview/WorkoutHeader",
  () =>
    ({ title }: any) => <div data-testid="workout-header">{title}</div>,
);
jest.mock("@/components/workout-preview/WorkoutInfoCards", () => () => (
  <div data-testid="workout-info-cards" />
));

const mockUseWorkout = jest.fn();
const mockUseExercisesByWorkout = jest.fn();
jest.mock("@/hooks", () => ({
  useWorkout: (...args: any[]) => mockUseWorkout(...args),
  useExercisesByWorkout: (...args: any[]) => mockUseExercisesByWorkout(...args),
}));

describe("WorkoutPreviewScreen", () => {
  it("shows loading state", () => {
    mockUseWorkout.mockReturnValue({ data: null, isLoading: true });
    mockUseExercisesByWorkout.mockReturnValue({ data: null, isLoading: true });

    render(<WorkoutPreviewScreen />);
    expect(screen.getByText("Loading Workout...")).toBeDefined();
  });

  it("renders workout preview content when loaded", () => {
    mockUseWorkout.mockReturnValue({
      data: { title: "Leg Day", description: "Lower body" },
      isLoading: false,
    });
    mockUseExercisesByWorkout.mockReturnValue({
      data: [{ name: "Squat" }],
      isLoading: false,
    });

    render(<WorkoutPreviewScreen />);
    expect(screen.getByTestId("workout-header")).toBeDefined();
    expect(screen.getByTestId("exercise-list")).toBeDefined();
    expect(screen.getByTestId("start-workout-button")).toBeDefined();
  });
});
