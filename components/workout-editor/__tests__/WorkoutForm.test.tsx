import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { WorkoutForm } from "../WorkoutForm";
import { Workout } from "@/validation/schemas";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
  TextInput: (props: any) => <input {...props} />,
  TouchableOpacity: ({ children, onPress }: any) => (
    <button onClick={onPress}>{children}</button>
  ),
  Alert: { alert: jest.fn(), prompt: jest.fn() },
}));

jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children }: any) => <span>{children}</span>,
}));
jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/hooks/useThemeColor", () => ({ useThemeColor: () => "#000" }));
jest.mock("../ExerciseCard", () => ({ ExerciseCard: () => <div /> }));

const baseWorkout = {
  title: "Push Day",
  description: "",
  day_of_week: null,
  exercises: [],
} as unknown as Workout;

describe("WorkoutForm day picker", () => {
  it("assigns a day when a day chip is tapped", () => {
    const onWorkoutChange = jest.fn();
    render(
      <WorkoutForm workout={baseWorkout} onWorkoutChange={onWorkoutChange} />,
    );

    fireEvent.click(screen.getByText("Mon"));

    expect(onWorkoutChange).toHaveBeenCalledWith(
      expect.objectContaining({ day_of_week: "Monday" }),
    );
  });

  it("clears the day when Rest is tapped", () => {
    const onWorkoutChange = jest.fn();
    render(
      <WorkoutForm
        workout={{ ...baseWorkout, day_of_week: "Monday" } as Workout}
        onWorkoutChange={onWorkoutChange}
      />,
    );

    fireEvent.click(screen.getByText("Rest"));

    expect(onWorkoutChange).toHaveBeenCalledWith(
      expect.objectContaining({ day_of_week: null }),
    );
  });
});
