import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import {
  useExercisesWithData,
  useWeightProgression,
  usePersonalRecords,
  useWorkoutFrequency,
  analyticsKeys,
} from "../useAnalyticsData";
import * as database from "@/database/database";

jest.mock("@/database/database", () => ({
  getAllRows: jest.fn(),
}));

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

describe("useAnalyticsData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("analyticsKeys", () => {
    it("should generate correct query keys", () => {
      expect(analyticsKeys.analytics()).toEqual(["analytics"]);
      expect(analyticsKeys.weightProgression("ex-1")).toEqual([
        "analytics",
        "weightProgression",
        "ex-1",
      ]);
      expect(analyticsKeys.personalRecords()).toEqual([
        "analytics",
        "personalRecords",
      ]);
      expect(analyticsKeys.workoutFrequency("week")).toEqual([
        "analytics",
        "workoutFrequency",
        "week",
      ]);
      expect(analyticsKeys.exercisesWithData()).toEqual([
        "analytics",
        "exercisesWithData",
      ]);
    });
  });

  describe("useExercisesWithData", () => {
    it("should return exercises that have weight data", async () => {
      const mockExercises = [
        { id: "ex-1", name: "Bench Press" },
        { id: "ex-2", name: "Squat" },
      ];
      mockGetAllRows.mockResolvedValueOnce(mockExercises);

      const { result } = renderHook(() => useExercisesWithData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockExercises);
      expect(mockGetAllRows).toHaveBeenCalledWith(
        expect.stringContaining("SELECT DISTINCT"),
      );
    });

    it("should return empty array when no exercises have data", async () => {
      mockGetAllRows.mockResolvedValueOnce([]);

      const { result } = renderHook(() => useExercisesWithData(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });
  });

  describe("useWeightProgression", () => {
    it("should return weight progression data for an exercise", async () => {
      const mockData = [
        { weight: 50, reps: "10", completed_at: "2024-01-01T10:00:00Z" },
        { weight: 55, reps: "8", completed_at: "2024-01-08T10:00:00Z" },
      ];
      mockGetAllRows.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useWeightProgression("ex-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].weight).toBe(50);
      expect(result.current.data?.[0].reps).toBe(10);
      expect(result.current.data?.[1].weight).toBe(55);
    });

    it("should filter out entries with zero or null weight", async () => {
      const mockData = [
        { weight: 50, reps: "10", completed_at: "2024-01-01T10:00:00Z" },
        { weight: 0, reps: "10", completed_at: "2024-01-02T10:00:00Z" },
        { weight: null, reps: "10", completed_at: "2024-01-03T10:00:00Z" },
      ];
      mockGetAllRows.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useWeightProgression("ex-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].weight).toBe(50);
    });

    it("should not fetch when exerciseId is empty", () => {
      const { result } = renderHook(() => useWeightProgression(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
    });
  });

  describe("usePersonalRecords", () => {
    it("should return personal records with exercise names", async () => {
      const mockMaxWeights = [
        {
          exercise_id: "ex-1",
          exercise_name: "Bench Press",
          max_weight: 100,
          achieved_at: "2024-01-01T10:00:00Z",
        },
      ];
      const mockPrDate = [{ completed_at: "2024-01-01T10:00:00Z" }];

      mockGetAllRows
        .mockResolvedValueOnce(mockMaxWeights)
        .mockResolvedValueOnce(mockPrDate);

      const { result } = renderHook(() => usePersonalRecords(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].exerciseName).toBe("Bench Press");
      expect(result.current.data?.[0].weight).toBe(100);
    });

    it("should return empty array when no PRs exist", async () => {
      mockGetAllRows.mockResolvedValueOnce([]);

      const { result } = renderHook(() => usePersonalRecords(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });
  });

  describe("useWorkoutFrequency", () => {
    it("should return weekly frequency data", async () => {
      mockGetAllRows.mockResolvedValue([{ count: 3 }]);

      const { result } = renderHook(() => useWorkoutFrequency("week"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(12);
      expect(result.current.data?.[0]).toHaveProperty("period");
      expect(result.current.data?.[0]).toHaveProperty("count");
      expect(result.current.data?.[0]).toHaveProperty("label");
    });

    it("should return monthly frequency data", async () => {
      mockGetAllRows.mockResolvedValue([{ count: 10 }]);

      const { result } = renderHook(() => useWorkoutFrequency("month"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(12);
      const labels = result.current.data?.map((d) => d.label);
      expect(labels).toContain("Jan");
    });

    it("should handle zero counts", async () => {
      mockGetAllRows.mockResolvedValue([{ count: 0 }]);

      const { result } = renderHook(() => useWorkoutFrequency("week"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.every((d) => d.count === 0)).toBe(true);
    });
  });
});
