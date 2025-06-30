import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SessionSetService } from "@/database/services/sessionSetService";
import { SessionSet } from "@/validation/sessionSets";

export const sessionSetKeys = {
  sessionSets: () => ["sessionSets"] as const,
  sessionSet: (id: number) => ["sessionSets", id] as const,
  sessionSetByExerciseId: (sessionId: number, exerciseId: string) =>
    ["sessionSets", "session", sessionId, "exercise", exerciseId] as const,
};

export const useCreateSessionSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionSet: SessionSet) =>
      SessionSetService.createExerciseSet(sessionSet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionSetKeys.sessionSets() });
    },
  });
};

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

export const useSessionSet = (id: number) => {
  return useQuery({
    queryKey: sessionSetKeys.sessionSet(id),
    queryFn: () => SessionSetService.getSessionSet(id),
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
  });
};
