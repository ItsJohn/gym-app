import { render, screen } from "@testing-library/react";
import React from "react";
import SetHeader from "../SetHeader";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
}));

jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children }: any) => <div>{children}</div>,
}));

const makeExercise = (overrides: any) => ({
  id: "ex-1",
  name: "Side Plank",
  muscle_group: "Core",
  type: "duration",
  target: {},
  ...overrides,
});

describe("SetHeader", () => {
  it("shows sets and duration when target.sets is present", () => {
    const exercise = makeExercise({ target: { sets: "3", duration: "45" } });
    render(<SetHeader setNumber={1} exercise={exercise} />);
    expect(screen.getByText("Target: 3 sets of 45s")).toBeDefined();
  });

  it("falls back to plain duration when target.sets is absent", () => {
    const exercise = makeExercise({ target: { duration: "45" } });
    render(<SetHeader setNumber={1} exercise={exercise} />);
    expect(screen.getByText("Target: 45s duration")).toBeDefined();
  });
});
