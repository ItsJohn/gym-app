import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useInitializeSessionSets,
  useSessionSet,
  useSessionSetsBySessionId,
  useSessionSetByExerciseId,
  useUpdateSessionSet,
  sessionSetKeys,
} from "../sessionSet";
import { SessionSetService } from "@/database/services/sessionSetService";

jest.mock("@/database/services/sessionSetService");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("sessionSet hooks", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("sessionSetKeys", () => {
    it("should generate correct query keys", () => {
      expect(sessionSetKeys.sessionSets()).toEqual(["sessionSets"]);
      expect(sessionSetKeys.sessionSet(1)).toEqual(["sessionSets", 1]);
      expect(sessionSetKeys.sessionSetsBySessionId(1)).toEqual([
        "sessionSets",
        "session",
        1,
      ]);
      expect(sessionSetKeys.sessionSetByExerciseId(1, "ex1")).toEqual([
        "sessionSets",
        "session",
        1,
        "exercise",
        "ex1",
      ]);
    });
  });

  describe("useInitializeSessionSets", () => {
    it("should call initializeSessionSets on mutate", async () => {
      (SessionSetService.initializeSessionSets as jest.Mock).mockResolvedValue([
        1, 2, 3,
      ]);

      const { result } = renderHook(() => useInitializeSessionSets(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ sessionId: 1, workoutId: 1 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(SessionSetService.initializeSessionSets).toHaveBeenCalledWith(
        1,
        1,
      );
    });
  });

  describe("useSessionSet", () => {
    it("should fetch a single session set", async () => {
      (SessionSetService.getSessionSet as jest.Mock).mockResolvedValue({
        id: 1,
        exercise_id: "ex1",
        is_completed: false,
      });

      const { result } = renderHook(() => useSessionSet(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.id).toBe(1);
    });
  });

  describe("useSessionSetsBySessionId", () => {
    it("should fetch all sets for a session", async () => {
      (
        SessionSetService.getSessionSetsBySessionId as jest.Mock
      ).mockResolvedValue([
        { id: 1, exercise_id: "ex1" },
        { id: 2, exercise_id: "ex1" },
      ]);

      const { result } = renderHook(() => useSessionSetsBySessionId(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(2);
    });
  });

  describe("useSessionSetByExerciseId", () => {
    it("should fetch sets for a specific exercise in a session", async () => {
      (
        SessionSetService.getSessionSetsBySessionIdAndExerciseId as jest.Mock
      ).mockResolvedValue([{ id: 1, exercise_id: "ex1" }]);

      const { result } = renderHook(() => useSessionSetByExerciseId(1, "ex1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
    });
  });

  describe("useUpdateSessionSet", () => {
    it("should call updateSessionSet on mutate", async () => {
      (SessionSetService.updateSessionSet as jest.Mock).mockResolvedValue(
        undefined,
      );

      const { result } = renderHook(() => useUpdateSessionSet(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: 1, is_completed: true });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(SessionSetService.updateSessionSet).toHaveBeenCalledWith(1, {
        id: 1,
        is_completed: true,
      });
    });
  });
});
