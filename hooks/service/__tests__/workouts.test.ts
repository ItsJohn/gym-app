import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useActiveWorkouts,
  useWorkouts,
  useWorkout,
  useTodaysWorkout,
  workoutKeys,
} from "../workouts";
import { WorkoutService } from "@/database/services/workoutService";
import { WorkoutScheduleService } from "@/database/services/workoutScheduleService";

jest.mock("@/database/services/workoutService");
jest.mock("@/database/services/workoutScheduleService");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("workout hooks", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("workoutKeys", () => {
    it("should generate correct query keys", () => {
      expect(workoutKeys.workouts()).toEqual(["workouts"]);
      expect(workoutKeys.workout(1)).toEqual(["workouts", 1]);
      expect(workoutKeys.activeWorkouts()).toEqual(["workouts", "active"]);
      expect(workoutKeys.todaysWorkout()).toEqual(["workouts", "todays"]);
    });
  });

  describe("useActiveWorkouts", () => {
    it("should fetch active workouts", async () => {
      (WorkoutService.getActiveWorkouts as jest.Mock).mockResolvedValue([
        { id: 1, title: "Push Day", is_active: true },
      ]);

      const { result } = renderHook(() => useActiveWorkouts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].title).toBe("Push Day");
    });
  });

  describe("useWorkouts", () => {
    it("should fetch all workouts", async () => {
      (WorkoutService.getAllWorkouts as jest.Mock).mockResolvedValue([
        { id: 1, title: "Push" },
        { id: 2, title: "Pull" },
      ]);

      const { result } = renderHook(() => useWorkouts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(2);
    });
  });

  describe("useWorkout", () => {
    it("should fetch a single workout by ID", async () => {
      (WorkoutService.getWorkoutById as jest.Mock).mockResolvedValue({
        id: 1,
        title: "Push Day",
      });

      const { result } = renderHook(() => useWorkout(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.title).toBe("Push Day");
    });
  });

  describe("useTodaysWorkout", () => {
    it("should fetch today's scheduled workout", async () => {
      (WorkoutScheduleService.getTodaysWorkout as jest.Mock).mockResolvedValue({
        id: 1,
        title: "Push Day",
        exercises: [],
      });

      const { result } = renderHook(() => useTodaysWorkout(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.title).toBe("Push Day");
    });
  });
});
