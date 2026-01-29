import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useLatestWorkoutStats } from "../useLatestWorkoutStats";
import { WorkoutService } from "@/database/services/workoutService";
import { SessionService } from "@/database/services/sessionService";
import { SessionSetService } from "@/database/services/sessionSetService";

jest.mock("@/database/services/workoutService");
jest.mock("@/database/services/sessionService");
jest.mock("@/database/services/sessionSetService");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useLatestWorkoutStats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should aggregate stats across active workouts", async () => {
    (WorkoutService.getActiveWorkouts as jest.Mock).mockResolvedValue([
      { id: 1, title: "Push Day" },
    ]);
    (SessionService.getSessionsByWorkoutId as jest.Mock).mockResolvedValue([
      {
        id: 1,
        is_completed: true,
        started_at: "2024-01-01T10:00:00Z",
        completed_at: "2024-01-01T11:00:00Z",
      },
    ]);
    (
      SessionSetService.getSessionSetsBySessionId as jest.Mock
    ).mockResolvedValue([
      {
        exercise_id: "ex1",
        is_completed: true,
        target: { weight: 80, reps: 10 },
      },
    ]);

    const { result } = renderHook(() => useLatestWorkoutStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.total_sessions).toBe(1);
    expect(result.current.data?.completed_sessions).toBe(1);
    expect(result.current.data?.total_weight).toBe(80);
  });

  it("should return zeros when no active workouts exist", async () => {
    (WorkoutService.getActiveWorkouts as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useLatestWorkoutStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.total_sessions).toBe(0);
    expect(result.current.data?.total_workouts).toBe(0);
  });
});
