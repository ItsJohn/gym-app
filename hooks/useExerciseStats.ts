import { useQuery } from "@tanstack/react-query";
import { getFirstRow } from "@/database/database";
import { analyticsKeys } from "./useAnalyticsData";

export interface ExerciseStatsData {
  personalRecord: number | null;
  averageWeight: number | null;
  totalSetsCompleted: number;
}

export const useExerciseStats = (exerciseId: string) => {
  return useQuery({
    queryKey: [
      ...analyticsKeys.analytics(),
      "exerciseStats",
      exerciseId,
    ] as const,
    queryFn: async (): Promise<ExerciseStatsData> => {
      const result = await getFirstRow<{
        personal_record: number | null;
        average_weight: number | null;
        total_sets: number;
      }>(
        `SELECT
           MAX(CAST(json_extract(ss.target, '$.weight') AS REAL)) as personal_record,
           AVG(CAST(json_extract(ss.target, '$.weight') AS REAL)) as average_weight,
           COUNT(*) as total_sets
         FROM session_set ss
         WHERE ss.exercise_id = ?
           AND ss.is_completed = 1
           AND json_extract(ss.target, '$.weight') IS NOT NULL
           AND json_extract(ss.target, '$.weight') > 0`,
        [exerciseId],
      );

      return {
        personalRecord: result?.personal_record ?? null,
        averageWeight: result?.average_weight
          ? Math.round(result.average_weight * 10) / 10
          : null,
        totalSetsCompleted: result?.total_sets ?? 0,
      };
    },
    enabled: !!exerciseId,
    staleTime: 5 * 60 * 1000,
  });
};
