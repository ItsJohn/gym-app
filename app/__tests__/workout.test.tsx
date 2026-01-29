import { render, screen } from "@testing-library/react";
import React from "react";
import WorkoutScreen from "../workout";

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
jest.mock("@/components/workout/SingleExerciseStep", () => () => (
  <div data-testid="single-exercise-step" />
));
jest.mock("@/components/workout/WorkoutComplete", () => () => (
  <div data-testid="workout-complete" />
));
jest.mock("@/components/workout/WorkoutProgressBar", () => () => (
  <div data-testid="workout-progress-bar" />
));

const mockUseWorkoutSession = jest.fn();
jest.mock("@/hooks/useWorkoutSession", () => ({
  useWorkoutSession: () => mockUseWorkoutSession(),
}));

const baseReturn = {
  workoutId: "1",
  workout: { title: "Push Day", description: "Upper body push" },
  exerciseList: [{ name: "Bench Press", target: { sets: 3, reps: 10 } }],
  isLoading: false,
  currentStepIndex: 0,
  currentStep: { type: "exercise" as const },
  sessionSteps: [{ type: "exercise" as const }, { type: "complete" as const }],
  showDescription: false,
  setShowDescription: jest.fn(),
  canGoBack: false,
  canGoForward: true,
  handleSetValueChange: jest.fn(),
  handleSetComplete: jest.fn(),
  handlePrevious: jest.fn(),
  handleNext: jest.fn(),
  finishWorkout: jest.fn(),
};

describe("WorkoutScreen", () => {
  it("shows no workout ID message when workoutId is missing", () => {
    mockUseWorkoutSession.mockReturnValue({ ...baseReturn, workoutId: "" });

    render(<WorkoutScreen />);
    expect(screen.getByText("No workout ID")).toBeDefined();
  });

  it("renders workout session with exercise step", () => {
    mockUseWorkoutSession.mockReturnValue(baseReturn);

    render(<WorkoutScreen />);
    expect(screen.getByText("Push Day")).toBeDefined();
    expect(screen.getByTestId("workout-progress-bar")).toBeDefined();
    expect(screen.getByTestId("single-exercise-step")).toBeDefined();
  });
});
