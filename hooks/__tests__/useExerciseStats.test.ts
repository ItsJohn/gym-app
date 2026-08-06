import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { useExerciseStats, useWeightProgression } from "../useExerciseStats";
import * as database from "@/database/database";

jest.mock("@/database/database", () => ({
  getFirstRow: jest.fn(),
  getAllRows: jest.fn(),
}));

const mockGetFirstRow = database.getFirstRow as jest.Mock;
const mockGetAllRows = database.getAllRows as jest.Mock;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
};

describe("useExerciseStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return stats for an exercise with data", async () => {
    mockGetFirstRow.mockResolvedValueOnce({
      personal_record: 100,
      average_weight: 82.456,
      total_sets: 45,
    });

    const { result } = renderHook(() => useExerciseStats("Squat"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      personalRecord: 100,
      averageWeight: 82.5,
      totalSetsCompleted: 45,
    });
  });

  it("should round average weight to one decimal place", async () => {
    mockGetFirstRow.mockResolvedValueOnce({
      personal_record: 60,
      average_weight: 55.349,
      total_sets: 10,
    });

    const { result } = renderHook(() => useExerciseStats("Bench Press"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.averageWeight).toBe(55.3);
  });

  it("should return nulls when no completed sets exist", async () => {
    mockGetFirstRow.mockResolvedValueOnce({
      personal_record: null,
      average_weight: null,
      total_sets: 0,
    });

    const { result } = renderHook(() => useExerciseStats("Deadlift"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      personalRecord: null,
      averageWeight: null,
      totalSetsCompleted: 0,
    });
  });

  it("should handle null database result", async () => {
    mockGetFirstRow.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useExerciseStats("Overhead Press"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      personalRecord: null,
      averageWeight: null,
      totalSetsCompleted: 0,
    });
  });

  it("should not fetch when exerciseName is empty", () => {
    const { result } = renderHook(() => useExerciseStats(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(mockGetFirstRow).not.toHaveBeenCalled();
  });

  it("should call getFirstRow with name-based JOIN query and exercise name param", async () => {
    mockGetFirstRow.mockResolvedValueOnce({
      personal_record: 50,
      average_weight: 40,
      total_sets: 5,
    });

    const { result } = renderHook(() => useExerciseStats("Romanian Deadlift"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetFirstRow).toHaveBeenCalledWith(
      expect.stringContaining("JOIN exercises e ON ss.exercise_id = e.id"),
      ["Romanian Deadlift"],
    );
    expect(mockGetFirstRow).toHaveBeenCalledWith(
      expect.stringContaining("e.name = ?"),
      ["Romanian Deadlift"],
    );
    expect(mockGetFirstRow).toHaveBeenCalledWith(
      expect.stringContaining("MAX(CAST(json_extract"),
      ["Romanian Deadlift"],
    );
  });

  it("should treat zero average weight as null", async () => {
    mockGetFirstRow.mockResolvedValueOnce({
      personal_record: 50,
      average_weight: 0,
      total_sets: 3,
    });

    const { result } = renderHook(() => useExerciseStats("Leg Press"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.averageWeight).toBeNull();
  });
});

describe("useWeightProgression", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return weight progression data for an exercise", async () => {
    mockGetAllRows.mockResolvedValueOnce([
      { weight: 50, reps: "10", completed_at: "2024-01-01T10:00:00Z" },
      { weight: 55, reps: "8", completed_at: "2024-01-08T10:00:00Z" },
    ]);

    const { result } = renderHook(() => useWeightProgression("Squat"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].weight).toBe(50);
    expect(result.current.data?.[0].reps).toBe(10);
    expect(result.current.data?.[1].weight).toBe(55);
  });

  it("should filter out entries with zero or null weight", async () => {
    mockGetAllRows.mockResolvedValueOnce([
      { weight: 50, reps: "10", completed_at: "2024-01-01T10:00:00Z" },
      { weight: 0, reps: "10", completed_at: "2024-01-02T10:00:00Z" },
      { weight: null, reps: "10", completed_at: "2024-01-03T10:00:00Z" },
    ]);

    const { result } = renderHook(() => useWeightProgression("Squat"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].weight).toBe(50);
  });

  it("should not fetch when exerciseName is empty", () => {
    const { result } = renderHook(() => useWeightProgression(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(mockGetAllRows).not.toHaveBeenCalled();
  });
});
