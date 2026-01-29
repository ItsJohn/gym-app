import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useSessionSetStats } from "../useSessionSetStats";
import { SessionSetService } from "@/database/services/sessionSetService";
import { sessionSetKeys } from "../service/sessionSet";

jest.mock("@/database/services/sessionSetService");

const mockSets = [
  {
    id: 1,
    session_id: 1,
    exercise_id: "ex1",
    is_completed: true,
    target: { weight: 80, reps: "10" },
  },
  {
    id: 2,
    session_id: 1,
    exercise_id: "ex1",
    is_completed: false,
    target: { weight: 80, reps: "10" },
  },
  {
    id: 3,
    session_id: 1,
    exercise_id: "ex2",
    is_completed: true,
    target: { weight: 60, reps: "12" },
  },
];

const createWrapper = (preload?: {
  key: readonly unknown[];
  data: unknown;
}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  if (preload) {
    queryClient.setQueryData(preload.key, preload.data);
  }
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useSessionSetStats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should compute stats from session sets", async () => {
    (
      SessionSetService.getSessionSetsBySessionId as jest.Mock
    ).mockResolvedValue(mockSets);

    const { result } = renderHook(() => useSessionSetStats(1), {
      wrapper: createWrapper({
        key: sessionSetKeys.sessionSetsBySessionId(1),
        data: mockSets,
      }),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.total_sets).toBe(3);
    });

    expect(result.current.data?.completed_sets).toBe(2);
    expect(result.current.data?.total_exercises).toBe(2);
    expect(result.current.data?.total_weight).toBe(140);
    expect(result.current.data?.total_reps).toBe(22);
    expect(result.current.data?.completion_rate).toBeCloseTo(66.67, 0);
  });

  it("should return zeros when no sets exist", async () => {
    (
      SessionSetService.getSessionSetsBySessionId as jest.Mock
    ).mockResolvedValue([]);

    const { result } = renderHook(() => useSessionSetStats(1), {
      wrapper: createWrapper({
        key: sessionSetKeys.sessionSetsBySessionId(1),
        data: [],
      }),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.total_sets).toBe(0);
    expect(result.current.data?.total_reps).toBe(0);
    expect(result.current.data?.total_weight).toBe(0);
    expect(result.current.data?.total_duration).toBe(0);
    expect(result.current.data?.total_distance).toBe(0);
    expect(result.current.data?.completion_rate).toBe(0);
  });

  it("should parse string reps correctly", async () => {
    const sets = [
      {
        id: 1,
        session_id: 1,
        exercise_id: "ex1",
        is_completed: true,
        target: { weight: 50, reps: "8" },
      },
      {
        id: 2,
        session_id: 1,
        exercise_id: "ex1",
        is_completed: true,
        target: { weight: 55, reps: "6" },
      },
    ];

    (
      SessionSetService.getSessionSetsBySessionId as jest.Mock
    ).mockResolvedValue(sets);

    const { result } = renderHook(() => useSessionSetStats(1), {
      wrapper: createWrapper({
        key: sessionSetKeys.sessionSetsBySessionId(1),
        data: sets,
      }),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.total_reps).toBe(14);
    expect(result.current.data?.total_weight).toBe(105);
  });

  it("should compute duration and distance from completed sets", async () => {
    const sets = [
      {
        id: 1,
        session_id: 1,
        exercise_id: "ex1",
        is_completed: true,
        target: { duration: "60" },
      },
      {
        id: 2,
        session_id: 1,
        exercise_id: "ex2",
        is_completed: true,
        target: { distance: "1000" },
      },
      {
        id: 3,
        session_id: 1,
        exercise_id: "ex1",
        is_completed: false,
        target: { duration: "45" },
      },
    ];

    (
      SessionSetService.getSessionSetsBySessionId as jest.Mock
    ).mockResolvedValue(sets);

    const { result } = renderHook(() => useSessionSetStats(1), {
      wrapper: createWrapper({
        key: sessionSetKeys.sessionSetsBySessionId(1),
        data: sets,
      }),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.total_duration).toBe(60);
    expect(result.current.data?.total_distance).toBe(1000);
    expect(result.current.data?.completed_sets).toBe(2);
  });

  it("should only count completed sets in totals", async () => {
    const sets = [
      {
        id: 1,
        session_id: 1,
        exercise_id: "ex1",
        is_completed: true,
        target: { weight: 100, reps: "5" },
      },
      {
        id: 2,
        session_id: 1,
        exercise_id: "ex1",
        is_completed: false,
        target: { weight: 100, reps: "5" },
      },
    ];

    (
      SessionSetService.getSessionSetsBySessionId as jest.Mock
    ).mockResolvedValue(sets);

    const { result } = renderHook(() => useSessionSetStats(1), {
      wrapper: createWrapper({
        key: sessionSetKeys.sessionSetsBySessionId(1),
        data: sets,
      }),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.total_weight).toBe(100);
    expect(result.current.data?.total_reps).toBe(5);
  });

  it("should handle null and undefined target values", async () => {
    const sets = [
      {
        id: 1,
        session_id: 1,
        exercise_id: "ex1",
        is_completed: true,
        target: { weight: null, reps: null },
      },
      {
        id: 2,
        session_id: 1,
        exercise_id: "ex1",
        is_completed: true,
        target: {},
      },
    ];

    (
      SessionSetService.getSessionSetsBySessionId as jest.Mock
    ).mockResolvedValue(sets);

    const { result } = renderHook(() => useSessionSetStats(1), {
      wrapper: createWrapper({
        key: sessionSetKeys.sessionSetsBySessionId(1),
        data: sets,
      }),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.total_weight).toBe(0);
    expect(result.current.data?.total_reps).toBe(0);
    expect(result.current.data?.completed_sets).toBe(2);
  });

  it("should track exercises_completed correctly", async () => {
    const sets = [
      {
        id: 1,
        session_id: 1,
        exercise_id: "ex1",
        is_completed: true,
        target: { weight: 80, reps: "10" },
      },
      {
        id: 2,
        session_id: 1,
        exercise_id: "ex1",
        is_completed: true,
        target: { weight: 80, reps: "10" },
      },
      {
        id: 3,
        session_id: 1,
        exercise_id: "ex2",
        is_completed: true,
        target: { weight: 60, reps: "12" },
      },
      {
        id: 4,
        session_id: 1,
        exercise_id: "ex2",
        is_completed: false,
        target: { weight: 60, reps: "12" },
      },
    ];

    (
      SessionSetService.getSessionSetsBySessionId as jest.Mock
    ).mockResolvedValue(sets);

    const { result } = renderHook(() => useSessionSetStats(1), {
      wrapper: createWrapper({
        key: sessionSetKeys.sessionSetsBySessionId(1),
        data: sets,
      }),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // ex1 has all sets completed, ex2 does not
    expect(result.current.data?.exercises_completed).toBe(1);
    expect(result.current.data?.total_exercises).toBe(2);
  });
});
