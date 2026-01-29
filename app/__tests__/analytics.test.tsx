import { render, screen } from "@testing-library/react";
import React from "react";
import AnalyticsScreen from "../(tabs)/analytics";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
  View: ({ children }: any) => <div>{children}</div>,
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
jest.mock("@/components/analytics", () => ({
  WeightProgressionChart: () => <div data-testid="weight-progression-chart" />,
  PersonalRecordsChart: () => <div data-testid="personal-records-chart" />,
  WorkoutFrequencyChart: () => <div data-testid="workout-frequency-chart" />,
}));
jest.mock("@react-native-picker/picker", () => ({
  Picker: ({ children }: any) => <div data-testid="picker">{children}</div>,
}));
// Add Picker.Item mock
(jest.requireMock("@react-native-picker/picker") as any).Picker.Item = ({
  label,
}: any) => <option>{label}</option>;

jest.mock("@/hooks/useAnalyticsData", () => ({
  useExercisesWithData: () => ({
    data: [{ id: "1", name: "Bench Press" }],
    isLoading: false,
  }),
  useWeightProgression: () => ({ data: [], isLoading: false }),
  usePersonalRecords: () => ({ data: [], isLoading: false }),
  useWorkoutFrequency: () => ({ data: [], isLoading: false }),
}));

jest.mock("@/hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
}));

jest.mock("@/constants/Colors", () => ({
  Colors: {
    light: { text: "#000", tint: "#2196F3" },
    dark: { text: "#fff", tint: "#2196F3" },
  },
}));

describe("AnalyticsScreen", () => {
  it("renders the analytics title", () => {
    render(<AnalyticsScreen />);
    expect(screen.getByText("Analytics")).toBeDefined();
  });

  it("renders chart components", () => {
    render(<AnalyticsScreen />);
    expect(screen.getByTestId("weight-progression-chart")).toBeDefined();
    expect(screen.getByTestId("workout-frequency-chart")).toBeDefined();
  });
});
