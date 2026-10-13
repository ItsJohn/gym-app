import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Exercise } from "@/validation/schemas";
import { ExerciseEditModal } from "../ExerciseEditModal";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
  Modal: ({ children }: any) => <div>{children}</div>,
  TextInput: ({ onChangeText, accessibilityLabel, value }: any) => (
    <input
      aria-label={accessibilityLabel}
      value={value}
      onChange={(e) => onChangeText(e.target.value)}
    />
  ),
  TouchableOpacity: ({ children, onPress, disabled }: any) => (
    <button onClick={onPress} disabled={disabled}>
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
jest.mock("@/hooks/useThemeColor", () => ({ useThemeColor: () => "#000" }));

const plank: Exercise = {
  id: "plank",
  name: "Plank",
  type: "duration",
  target: { sets: "3", duration: "45" },
  muscle_group: "Core",
  difficulty: "beginner",
};

describe("ExerciseEditModal", () => {
  it("saves a timed exercise as sets × reps", () => {
    const onSave = jest.fn();
    render(
      <ExerciseEditModal
        exercise={plank}
        onSave={onSave}
        onClose={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Sets × Reps"));
    fireEvent.change(screen.getByLabelText("Reps"), {
      target: { value: "12" },
    });
    fireEvent.click(screen.getByText("Save"));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "reps-sets",
        target: { sets: "3", reps: "12", weight: undefined },
      }),
    );
  });
});
