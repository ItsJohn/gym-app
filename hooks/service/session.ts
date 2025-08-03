import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SessionService } from "@/database/services/sessionService";
import { Session } from "@/validation/session";

export const sessionKeys = {
  sessions: () => ["sessions"] as const,
  recentSessions: (limit: number) =>
    [...sessionKeys.sessions(), "recent", limit] as const,
  mostRecentIncompleteSession: () =>
    [...sessionKeys.sessions(), "mostRecentIncomplete"] as const,
  sessionById: (sessionId: number) =>
    [...sessionKeys.sessions(), sessionId] as const,
  sessionStats: (sessionId: number) =>
    [...sessionKeys.sessions(), "stats", sessionId] as const,
  sessionsByWorkoutId: (workoutId: number) =>
    [...sessionKeys.sessions(), "byWorkout", workoutId] as const,
  latestWorkoutSessions: () =>
    [...sessionKeys.sessions(), "latestWorkout"] as const,
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (session: Session) => SessionService.createSession(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.sessions() });
    },
  });
};

export const useRecentSessions = (limit: number = 10) => {
  return useQuery({
    queryKey: sessionKeys.recentSessions(limit),
    queryFn: () => SessionService.getRecentSessions(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useMostRecentIncompleteSession = () => {
  return useQuery({
    queryKey: sessionKeys.mostRecentIncompleteSession(),
    queryFn: () => SessionService.getMostRecentIncompleteSession(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// export const useSessionById = (sessionId: number) => {
//   return useQuery({
//     queryKey: sessionKeys.sessionById(sessionId),
//     queryFn: () => SessionService.getSessionById(sessionId),
//     staleTime: 2 * 60 * 1000, // 2 minutes
//   });
// };

export const useSessionsByWorkoutId = (workoutId: number) => {
  return useQuery({
    queryKey: sessionKeys.sessionsByWorkoutId(workoutId),
    queryFn: () => SessionService.getSessionsByWorkoutId(workoutId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!workoutId,
  });
};

export const useLatestWorkoutSessions = () => {
  return useQuery({
    queryKey: sessionKeys.latestWorkoutSessions(),
    queryFn: async () => {
      // Get the most recent session to find the latest workout
      const recentSessions = await SessionService.getRecentSessions(1);
      if (recentSessions.length === 0) {
        return [];
      }

      const latestSession = recentSessions[0];
      if (!latestSession.workout_id) {
        return [];
      }

      // Get all sessions for this workout
      return await SessionService.getSessionsByWorkoutId(
        latestSession.workout_id,
      );
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
