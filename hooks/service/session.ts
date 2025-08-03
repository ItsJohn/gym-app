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
