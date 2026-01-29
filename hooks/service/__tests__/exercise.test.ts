import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useCreateExercise,
  useDeleteExercise,
  exerciseKeys,
} from "../exercise";
import { ExerciseService } from "@/database/services/exerciseService";

jest.mock("@/database/services/exerciseService");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("exercise hooks", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("exerciseKeys", () => {
    it("should generate correct query keys", () => {
      expect(exerciseKeys.exercises()).toEqual(["exercise"]);
      expect(exerciseKeys.exercise("ex-1")).toEqual(["exercise", "ex-1"]);
    });
  });

  describe("useCreateExercise", () => {
    it("should call ExerciseService.createExercise on mutate", async () => {
      (ExerciseService.createExercise as jest.Mock).mockResolvedValue(
        undefined,
      );

      const { result } = renderHook(() => useCreateExercise(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: "Bench Press",
        type: "reps",
        target: { reps: "10", sets: "3" },
        muscle_group: "chest",
        difficulty: "intermediate",
      } as any);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(ExerciseService.createExercise).toHaveBeenCalledTimes(1);
    });
  });

  describe("useDeleteExercise", () => {
    it("should call ExerciseService.deleteExercise on mutate", async () => {
      (ExerciseService.deleteExercise as jest.Mock).mockResolvedValue(
        undefined,
      );

      const { result } = renderHook(() => useDeleteExercise(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("ex-1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(ExerciseService.deleteExercise).toHaveBeenCalledWith("ex-1");
    });
  });
});
