import { useQuery } from "@tanstack/react-query";

import { RunSessionService } from "@/database/services/runSessionService";

export const runKeys = {
  all: ["runs"] as const,
  recent: () => [...runKeys.all, "recent"] as const,
  detail: (id: number) => [...runKeys.all, "detail", id] as const,
  splits: (id: number) => [...runKeys.all, "splits", id] as const,
};

export function useRecentRuns() {
  return useQuery({
    queryKey: runKeys.recent(),
    queryFn: () => RunSessionService.getRecentSessions(50),
    staleTime: 2 * 60 * 1000,
  });
}

export function useRunDetail(id: number) {
  const sessionQuery = useQuery({
    queryKey: runKeys.detail(id),
    queryFn: () => RunSessionService.getSessionById(id),
    enabled: Number.isFinite(id) && id > 0,
  });

  const splitsQuery = useQuery({
    queryKey: runKeys.splits(id),
    queryFn: () => RunSessionService.getSplits(id),
    enabled: Number.isFinite(id) && id > 0,
  });

  return {
    session: sessionQuery.data ?? null,
    splits: splitsQuery.data ?? [],
    isLoading: sessionQuery.isLoading || splitsQuery.isLoading,
    error: sessionQuery.error ?? splitsQuery.error,
  };
}
