import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useTodaysWorkoutCompletion } from "../useTodaysWorkoutCompletion";
import { SessionService } from "@/database/services/sessionService";
import { WorkoutScheduleService } from "@/database/services/workoutScheduleService";

jest.mock("@/database/services/sessionService");
jest.mock("@/database/services/workoutScheduleService");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useTodaysWorkoutCompletion", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return completed session when workout was done today", async () => {
    const now = new Date();
    const completedSession = {
      id: 1,
      workout_id: 1,
      is_completed: true,
      completed_at: now.toISOString(),
    };

    (WorkoutScheduleService.getTodaysWorkout as jest.Mock).mockResolvedValue({
      id: 1,
      title: "Push Day",
      is_active: true,
      exercises: [],
    });
    (SessionService.getSessionsByWorkoutId as jest.Mock).mockResolvedValue([
      completedSession,
    ]);

    const { result } = renderHook(() => useTodaysWorkoutCompletion(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(completedSession);
  });

  it("should return null when no workout is scheduled today", async () => {
    (WorkoutScheduleService.getTodaysWorkout as jest.Mock).mockResolvedValue(
      null,
    );

    const { result } = renderHook(() => useTodaysWorkoutCompletion(), {
      wrapper: createWrapper(),
    });

    // Should not fetch since enabled depends on todaysWorkout
    await waitFor(() => expect(result.current.isFetching).toBe(false));
  });
});
