import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useWorkoutRenewalNotice } from "../useWorkoutRenewalNotice";
import { WorkoutService } from "@/database/services/workoutService";

jest.mock("@/database/services/workoutService");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useWorkoutRenewalNotice", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should show notice when workout is 6+ weeks old", async () => {
    const sevenWeeksAgo = new Date();
    sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49);

    (WorkoutService.getLatestActiveWorkout as jest.Mock).mockResolvedValue({
      id: 1,
      created_at: sevenWeeksAgo.toISOString(),
    });

    const { result } = renderHook(() => useWorkoutRenewalNotice(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.shouldShowNotice).toBe(true);
    expect(result.current.data?.weeksOld).toBe(7);
  });

  it("should not show notice when no active workout exists", async () => {
    (WorkoutService.getLatestActiveWorkout as jest.Mock).mockResolvedValue(
      null,
    );

    const { result } = renderHook(() => useWorkoutRenewalNotice(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.shouldShowNotice).toBe(false);
    expect(result.current.data?.weeksOld).toBe(0);
  });
});
