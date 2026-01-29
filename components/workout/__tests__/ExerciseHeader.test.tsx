import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ExerciseHeader from "../ExerciseHeader";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
  TouchableOpacity: ({ children, onPress, ...props }: any) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("../ExerciseDescription", () => (props: any) => (
  <div data-testid="exercise-description">{props.description}</div>
));

jest.mock("../ExerciseStats", () => (props: any) => (
  <div data-testid="exercise-stats" data-exercise-id={props.exerciseId} />
));

describe("ExerciseHeader", () => {
  it("renders exercise name and muscle group", () => {
    render(<ExerciseHeader exerciseName="Bench Press" muscleGroup="Chest" />);

    expect(screen.getByText("Bench Press")).toBeDefined();
    expect(screen.getByText("Chest")).toBeDefined();
  });

  it("shows 'Show Exercise Info' button by default", () => {
    render(<ExerciseHeader exerciseName="Bench Press" muscleGroup="Chest" />);

    expect(screen.getByText("Show Exercise Info")).toBeDefined();
  });

  it("toggles to 'Hide Exercise Info' when clicked", () => {
    render(<ExerciseHeader exerciseName="Bench Press" muscleGroup="Chest" />);

    fireEvent.click(screen.getByText("Show Exercise Info"));

    expect(screen.getByText("Hide Exercise Info")).toBeDefined();
  });

  it("does not show description or stats when collapsed", () => {
    render(
      <ExerciseHeader
        exerciseName="Bench Press"
        muscleGroup="Chest"
        notes="Keep elbows tucked"
        exerciseId="ex-1"
      />,
    );

    expect(screen.queryByTestId("exercise-description")).toBeNull();
    expect(screen.queryByTestId("exercise-stats")).toBeNull();
  });

  it("shows description when expanded and notes are provided", () => {
    render(
      <ExerciseHeader
        exerciseName="Bench Press"
        muscleGroup="Chest"
        notes="Keep elbows tucked"
      />,
    );

    fireEvent.click(screen.getByText("Show Exercise Info"));

    expect(screen.getByTestId("exercise-description")).toBeDefined();
    expect(screen.getByText("Keep elbows tucked")).toBeDefined();
  });

  it("does not show description when expanded but no notes", () => {
    render(
      <ExerciseHeader
        exerciseName="Bench Press"
        muscleGroup="Chest"
        exerciseId="ex-1"
      />,
    );

    fireEvent.click(screen.getByText("Show Exercise Info"));

    expect(screen.queryByTestId("exercise-description")).toBeNull();
  });

  it("shows stats when expanded and exerciseId is provided", () => {
    render(
      <ExerciseHeader
        exerciseName="Bench Press"
        muscleGroup="Chest"
        exerciseId="ex-1"
        weightUnit="kg"
      />,
    );

    fireEvent.click(screen.getByText("Show Exercise Info"));

    expect(screen.getByTestId("exercise-stats")).toBeDefined();
  });

  it("does not show stats when expanded but no exerciseId", () => {
    render(
      <ExerciseHeader
        exerciseName="Bench Press"
        muscleGroup="Chest"
        notes="Some notes"
      />,
    );

    fireEvent.click(screen.getByText("Show Exercise Info"));

    expect(screen.queryByTestId("exercise-stats")).toBeNull();
    expect(screen.getByTestId("exercise-description")).toBeDefined();
  });

  it("shows both description and stats when expanded with notes and exerciseId", () => {
    render(
      <ExerciseHeader
        exerciseName="Bench Press"
        muscleGroup="Chest"
        notes="Keep elbows tucked"
        exerciseId="ex-1"
        weightUnit="lbs"
      />,
    );

    fireEvent.click(screen.getByText("Show Exercise Info"));

    expect(screen.getByTestId("exercise-description")).toBeDefined();
    expect(screen.getByTestId("exercise-stats")).toBeDefined();
  });

  it("hides everything when toggled back to collapsed", () => {
    render(
      <ExerciseHeader
        exerciseName="Bench Press"
        muscleGroup="Chest"
        notes="Keep elbows tucked"
        exerciseId="ex-1"
      />,
    );

    fireEvent.click(screen.getByText("Show Exercise Info"));
    expect(screen.getByTestId("exercise-description")).toBeDefined();
    expect(screen.getByTestId("exercise-stats")).toBeDefined();

    fireEvent.click(screen.getByText("Hide Exercise Info"));
    expect(screen.queryByTestId("exercise-description")).toBeNull();
    expect(screen.queryByTestId("exercise-stats")).toBeNull();
  });

  it("expands even when only exerciseId is provided (no notes)", () => {
    render(
      <ExerciseHeader
        exerciseName="Squat"
        muscleGroup="Legs"
        exerciseId="ex-2"
        weightUnit="kg"
      />,
    );

    fireEvent.click(screen.getByText("Show Exercise Info"));

    expect(screen.queryByTestId("exercise-description")).toBeNull();
    expect(screen.getByTestId("exercise-stats")).toBeDefined();
  });
});
