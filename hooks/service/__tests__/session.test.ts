import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useCreateSession,
  useRecentSessions,
  useMostRecentIncompleteSession,
  useSessionsByWorkoutId,
  useLatestWorkoutSessions,
  useLastSessionDataForExercise,
  useDeleteSession,
  sessionKeys,
} from "../session";
import { SessionService } from "@/database/services/sessionService";

jest.mock("@/database/services/sessionService");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("session hooks", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("sessionKeys", () => {
    it("should generate correct query keys", () => {
      expect(sessionKeys.sessions()).toEqual(["sessions"]);
      expect(sessionKeys.recentSessions(5)).toEqual(["sessions", "recent", 5]);
      expect(sessionKeys.sessionStats(1)).toEqual(["sessions", "stats", 1]);
    });
  });

  describe("useCreateSession", () => {
    it("should call SessionService.createSession on mutate", async () => {
      (SessionService.createSession as jest.Mock).mockResolvedValue(1);

      const { result } = renderHook(() => useCreateSession(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        workout_id: 1,
        notes: null,
        is_completed: false,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(SessionService.createSession).toHaveBeenCalledTimes(1);
    });
  });

  describe("useRecentSessions", () => {
    it("should fetch recent sessions with default limit", async () => {
      (SessionService.getRecentSessions as jest.Mock).mockResolvedValue([
        { id: 1, workout_id: 1 },
      ]);

      const { result } = renderHook(() => useRecentSessions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(SessionService.getRecentSessions).toHaveBeenCalledWith(10);
      expect(result.current.data).toHaveLength(1);
    });
  });

  describe("useMostRecentIncompleteSession", () => {
    it("should return incomplete session", async () => {
      (
        SessionService.getMostRecentIncompleteSession as jest.Mock
      ).mockResolvedValue({ id: 1, is_completed: false });

      const { result } = renderHook(() => useMostRecentIncompleteSession(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.is_completed).toBe(false);
    });
  });

  describe("useSessionsByWorkoutId", () => {
    it("should fetch sessions for a workout", async () => {
      (SessionService.getSessionsByWorkoutId as jest.Mock).mockResolvedValue([
        { id: 1, workout_id: 1 },
      ]);

      const { result } = renderHook(() => useSessionsByWorkoutId(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(SessionService.getSessionsByWorkoutId).toHaveBeenCalledWith(1);
    });
  });

  describe("useLatestWorkoutSessions", () => {
    it("should fetch sessions for the latest workout", async () => {
      (SessionService.getRecentSessions as jest.Mock).mockResolvedValue([
        { id: 1, workout_id: 5 },
      ]);
      (SessionService.getSessionsByWorkoutId as jest.Mock).mockResolvedValue([
        { id: 1, workout_id: 5 },
        { id: 2, workout_id: 5 },
      ]);

      const { result } = renderHook(() => useLatestWorkoutSessions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(SessionService.getSessionsByWorkoutId).toHaveBeenCalledWith(5);
    });
  });

  describe("useLastSessionDataForExercise", () => {
    it("should fetch last session data for an exercise", async () => {
      (
        SessionService.getLastSessionDataForExercise as jest.Mock
      ).mockResolvedValue({ weight: 80, reps: 10 });

      const { result } = renderHook(
        () => useLastSessionDataForExercise(1, "ex1"),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({ weight: 80, reps: 10 });
    });
  });

  describe("useDeleteSession", () => {
    it("should call SessionService.deleteSession on mutate", async () => {
      (SessionService.deleteSession as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteSession(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(SessionService.deleteSession).toHaveBeenCalledWith(1);
    });
  });
});
