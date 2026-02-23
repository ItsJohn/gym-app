import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SessionSetService } from "@/database/services/sessionSetService";
import { SessionSet } from "@/validation/sessionSets";

export const sessionSetKeys = {
  sessionSets: () => ["sessionSets"] as const,
  sessionSet: (id: number) => ["sessionSets", id] as const,
  sessionSetsBySessionId: (sessionId: number) =>
    ["sessionSets", "session", sessionId] as const,
  sessionSetByExerciseId: (sessionId: number, exerciseId: string) =>
    ["sessionSets", "session", sessionId, "exercise", exerciseId] as const,
};

// export const useCreateSessionSet = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (sessionSet: SessionSet) =>
//       SessionSetService.createExerciseSet(sessionSet),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: sessionSetKeys.sessionSets() });
//     },
//   });
// };

export const useInitializeSessionSets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      workoutId,
    }: {
      sessionId: number;
      workoutId: number;
    }) => SessionSetService.initializeSessionSets(sessionId, workoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionSetKeys.sessionSets() });
    },
  });
};

const SESSION_SET_STALE_TIME = 5 * 60 * 1000; // 5 minutes — sets don't change between renders

export const useSessionSet = (id: number) => {
  return useQuery({
    queryKey: sessionSetKeys.sessionSet(id),
    queryFn: () => SessionSetService.getSessionSet(id),
    staleTime: SESSION_SET_STALE_TIME,
  });
};

export const useSessionSetsBySessionId = (sessionId: number) => {
  return useQuery<SessionSet[]>({
    queryKey: sessionSetKeys.sessionSetsBySessionId(sessionId),
    queryFn: () => SessionSetService.getSessionSetsBySessionId(sessionId),
    staleTime: SESSION_SET_STALE_TIME,
  });
};

export const useSessionSetByExerciseId = (
  sessionId: number,
  exerciseId: string,
) => {
  return useQuery<SessionSet[]>({
    queryKey: sessionSetKeys.sessionSetByExerciseId(sessionId, exerciseId),
    queryFn: () =>
      SessionSetService.getSessionSetsBySessionIdAndExerciseId(
        sessionId,
        exerciseId,
      ),
    staleTime: SESSION_SET_STALE_TIME,
  });
};

export const useUpdateSessionSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionSet: Partial<SessionSet>) =>
      SessionSetService.updateSessionSet(sessionSet.id!, sessionSet),
    onSuccess: async (_, variables: Partial<SessionSet>) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: sessionSetKeys.sessionSets(),
        }),
        queryClient.invalidateQueries({
          queryKey: sessionSetKeys.sessionSet(variables.id!),
        }),
      ]);
    },
  });
};
