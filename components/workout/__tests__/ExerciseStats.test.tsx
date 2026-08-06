import { render, screen } from "@testing-library/react";
import React from "react";
import ExerciseStats from "../ExerciseStats";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
  View: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  ActivityIndicator: (props: any) => (
    <div data-testid="activity-indicator" {...props} />
  ),
}));

jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("@/components/workout/WeightProgressionChart", () => ({
  WeightProgressionChart: () => <div data-testid="weight-progression-chart" />,
}));

const mockUseExerciseStats = jest.fn();
const mockUseWeightProgression = jest.fn();

jest.mock("@/hooks/useExerciseStats", () => ({
  useExerciseStats: (...args: any[]) => mockUseExerciseStats(...args),
  useWeightProgression: (...args: any[]) => mockUseWeightProgression(...args),
}));

describe("ExerciseStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading spinner when stats are loading", () => {
    mockUseExerciseStats.mockReturnValue({ data: null, isLoading: true });
    mockUseWeightProgression.mockReturnValue({ data: null, isLoading: false });

    render(
      <ExerciseStats
        exerciseId="ex-1"
        exerciseName="Bench Press"
        weightUnit="kg"
      />,
    );

    expect(screen.getByTestId("activity-indicator")).toBeDefined();
  });

  it("shows loading spinner when chart data is loading", () => {
    mockUseExerciseStats.mockReturnValue({ data: null, isLoading: false });
    mockUseWeightProgression.mockReturnValue({ data: null, isLoading: true });

    render(
      <ExerciseStats
        exerciseId="ex-1"
        exerciseName="Bench Press"
        weightUnit="kg"
      />,
    );

    expect(screen.getByTestId("activity-indicator")).toBeDefined();
  });

  it("shows empty state when no data exists", () => {
    mockUseExerciseStats.mockReturnValue({
      data: {
        personalRecord: null,
        averageWeight: null,
        totalSetsCompleted: 0,
      },
      isLoading: false,
    });
    mockUseWeightProgression.mockReturnValue({ data: [], isLoading: false });

    render(
      <ExerciseStats
        exerciseId="ex-1"
        exerciseName="Bench Press"
        weightUnit="kg"
      />,
    );

    expect(screen.getByText("No historical data yet")).toBeDefined();
  });

  it("displays stats with kg unit", () => {
    mockUseExerciseStats.mockReturnValue({
      data: {
        personalRecord: 100,
        averageWeight: 82.5,
        totalSetsCompleted: 45,
      },
      isLoading: false,
    });
    mockUseWeightProgression.mockReturnValue({
      data: [{ date: new Date(), weight: 100 }],
      isLoading: false,
    });

    render(
      <ExerciseStats
        exerciseId="ex-1"
        exerciseName="Bench Press"
        weightUnit="kg"
      />,
    );

    expect(screen.getByText("100 kg")).toBeDefined();
    expect(screen.getByText("82.5 kg")).toBeDefined();
    expect(screen.getByText("45")).toBeDefined();
    expect(screen.getByText("PR")).toBeDefined();
    expect(screen.getByText("Avg Weight")).toBeDefined();
    expect(screen.getByText("Sets Done")).toBeDefined();
  });

  it("displays stats with lbs unit", () => {
    mockUseExerciseStats.mockReturnValue({
      data: {
        personalRecord: 225,
        averageWeight: 180.3,
        totalSetsCompleted: 30,
      },
      isLoading: false,
    });
    mockUseWeightProgression.mockReturnValue({
      data: [{ date: new Date(), weight: 225 }],
      isLoading: false,
    });

    render(
      <ExerciseStats
        exerciseId="ex-1"
        exerciseName="Bench Press"
        weightUnit="lbs"
      />,
    );

    expect(screen.getByText("225 lbs")).toBeDefined();
    expect(screen.getByText("180.3 lbs")).toBeDefined();
    expect(screen.getByText("30")).toBeDefined();
  });

  it("renders weight progression chart when data exists", () => {
    mockUseExerciseStats.mockReturnValue({
      data: {
        personalRecord: 100,
        averageWeight: 80,
        totalSetsCompleted: 10,
      },
      isLoading: false,
    });
    mockUseWeightProgression.mockReturnValue({
      data: [
        { date: new Date("2024-01-01"), weight: 80 },
        { date: new Date("2024-01-08"), weight: 85 },
      ],
      isLoading: false,
    });

    render(
      <ExerciseStats
        exerciseId="ex-1"
        exerciseName="Bench Press"
        weightUnit="kg"
      />,
    );

    expect(screen.getByTestId("weight-progression-chart")).toBeDefined();
  });

  it("does not render chart when weight data is empty", () => {
    mockUseExerciseStats.mockReturnValue({
      data: {
        personalRecord: 100,
        averageWeight: 80,
        totalSetsCompleted: 10,
      },
      isLoading: false,
    });
    mockUseWeightProgression.mockReturnValue({ data: [], isLoading: false });

    render(
      <ExerciseStats
        exerciseId="ex-1"
        exerciseName="Bench Press"
        weightUnit="kg"
      />,
    );

    expect(screen.queryByTestId("weight-progression-chart")).toBeNull();
  });

  it("shows dash for null PR and average weight", () => {
    mockUseExerciseStats.mockReturnValue({
      data: {
        personalRecord: null,
        averageWeight: null,
        totalSetsCompleted: 5,
      },
      isLoading: false,
    });
    mockUseWeightProgression.mockReturnValue({ data: [], isLoading: false });

    render(
      <ExerciseStats
        exerciseId="ex-1"
        exerciseName="Bench Press"
        weightUnit="kg"
      />,
    );

    const dashes = screen.getAllByText("-");
    expect(dashes).toHaveLength(2);
    expect(screen.getByText("5")).toBeDefined();
  });
});
