import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { useExerciseStats } from "../useExerciseStats";
import * as database from "@/database/database";

jest.mock("@/database/database", () => ({
  getFirstRow: jest.fn(),
}));

const mockGetFirstRow = database.getFirstRow as jest.Mock;

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

    const { result } = renderHook(() => useExerciseStats("ex-1"), {
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

    const { result } = renderHook(() => useExerciseStats("ex-2"), {
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

    const { result } = renderHook(() => useExerciseStats("ex-3"), {
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

    const { result } = renderHook(() => useExerciseStats("ex-4"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      personalRecord: null,
      averageWeight: null,
      totalSetsCompleted: 0,
    });
  });

  it("should not fetch when exerciseId is empty", () => {
    const { result } = renderHook(() => useExerciseStats(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(mockGetFirstRow).not.toHaveBeenCalled();
  });

  it("should call getFirstRow with the correct SQL and params", async () => {
    mockGetFirstRow.mockResolvedValueOnce({
      personal_record: 50,
      average_weight: 40,
      total_sets: 5,
    });

    const { result } = renderHook(() => useExerciseStats("ex-5"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetFirstRow).toHaveBeenCalledWith(
      expect.stringContaining("MAX(CAST(json_extract"),
      ["ex-5"],
    );
    expect(mockGetFirstRow).toHaveBeenCalledWith(
      expect.stringContaining("AVG(CAST(json_extract"),
      ["ex-5"],
    );
    expect(mockGetFirstRow).toHaveBeenCalledWith(
      expect.stringContaining("COUNT(*)"),
      ["ex-5"],
    );
  });

  it("should treat zero average weight as null", async () => {
    mockGetFirstRow.mockResolvedValueOnce({
      personal_record: 50,
      average_weight: 0,
      total_sets: 3,
    });

    const { result } = renderHook(() => useExerciseStats("ex-6"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.averageWeight).toBeNull();
  });
});
