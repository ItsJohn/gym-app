import { render, screen } from "@testing-library/react";
import React from "react";
import WorkoutEditorScreen from "../workout-editor";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
  TouchableOpacity: ({ children, onPress }: any) => (
    <div onClick={onPress}>{children}</div>
  ),
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
jest.mock("@/components/workout-editor/AIWorkoutCreator", () => () => (
  <div data-testid="ai-workout-creator" />
));
jest.mock("@/components/workout-editor/MultiWorkoutEditor", () => ({
  ProgramEditor: () => <div data-testid="program-editor" />,
}));
jest.mock("@/components/workout-editor/ToggleCreationType", () => ({
  ToggleCreationType: () => <div data-testid="toggle-creation-type" />,
}));
jest.mock("@/components/workout-editor/WorkoutForm", () => ({
  WorkoutForm: () => <div data-testid="workout-form" />,
}));

const mockUseWorkoutEditor = jest.fn();
jest.mock("@/hooks/useWorkoutEditor", () => ({
  useWorkoutEditor: () => mockUseWorkoutEditor(),
}));

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
}));

const baseReturn = {
  isEditing: false,
  workout: { title: "", exercises: [], end_date: "" },
  setWorkout: jest.fn(),
  generatedWorkouts: [],
  setGeneratedWorkouts: jest.fn(),
  isLoading: false,
  isSaving: false,
  isCreatingExercise: false,
  isDeletingExercise: false,
  isBusy: false,
  creationMode: "ai" as const,
  setCreationMode: jest.fn(),
  editMode: "single" as const,
  setEditMode: jest.fn(),
  handleAIWorkoutProgramGenerated: jest.fn(),
  handleSave: jest.fn(),
};

describe("WorkoutEditorScreen", () => {
  it("shows loading state", () => {
    mockUseWorkoutEditor.mockReturnValue({ ...baseReturn, isLoading: true });

    render(<WorkoutEditorScreen />);
    expect(screen.getByText("Loading...")).toBeDefined();
  });

  it("renders AI creator in ai creation mode", () => {
    mockUseWorkoutEditor.mockReturnValue(baseReturn);

    render(<WorkoutEditorScreen />);
    expect(screen.getByText("Create Workout")).toBeDefined();
    expect(screen.getByTestId("ai-workout-creator")).toBeDefined();
  });
});
