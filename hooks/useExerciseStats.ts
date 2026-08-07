import { useQuery } from "@tanstack/react-query";
import { getAllRows, getFirstRow } from "@/database/database";

export const exerciseStatsKeys = {
  all: () => ["exerciseStats"] as const,
  stats: (exerciseName: string) =>
    [...exerciseStatsKeys.all(), "stats", exerciseName] as const,
  weightProgression: (exerciseName: string) =>
    [...exerciseStatsKeys.all(), "weightProgression", exerciseName] as const,
};

export interface ExerciseStatsData {
  personalRecord: number | null;
  averageWeight: number | null;
  totalSetsCompleted: number;
}

export interface WeightProgressionPoint {
  date: Date;
  weight: number;
  reps?: number;
}

export const useExerciseStats = (exerciseName: string) => {
  return useQuery({
    queryKey: exerciseStatsKeys.stats(exerciseName),
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
         JOIN exercises e ON ss.exercise_id = e.id
         WHERE e.name = ?
           AND ss.is_completed = 1
           AND json_extract(ss.target, '$.weight') IS NOT NULL
           AND json_extract(ss.target, '$.weight') > 0`,
        [exerciseName],
      );

      return {
        personalRecord: result?.personal_record ?? null,
        averageWeight: result?.average_weight
          ? Math.round(result.average_weight * 10) / 10
          : null,
        totalSetsCompleted: result?.total_sets ?? 0,
      };
    },
    enabled: !!exerciseName,
    staleTime: 5 * 60 * 1000,
  });
};

export const useWeightProgression = (exerciseName: string) => {
  return useQuery({
    queryKey: exerciseStatsKeys.weightProgression(exerciseName),
    queryFn: async (): Promise<WeightProgressionPoint[]> => {
      const results = await getAllRows<{
        weight: number;
        reps: string | null;
        completed_at: string;
      }>(
        `SELECT
           json_extract(ss.target, '$.weight') as weight,
           json_extract(ss.target, '$.reps') as reps,
           ss.completed_at
         FROM session_set ss
         JOIN exercises e ON ss.exercise_id = e.id
         WHERE e.name = ?
           AND ss.is_completed = 1
           AND ss.completed_at IS NOT NULL
           AND json_extract(ss.target, '$.weight') IS NOT NULL
         ORDER BY ss.completed_at ASC`,
        [exerciseName],
      );

      return results
        .filter((r) => r.weight != null && r.weight > 0)
        .map((r) => ({
          date: new Date(r.completed_at),
          weight: r.weight,
          reps: r.reps ? parseInt(r.reps, 10) : undefined,
        }));
    },
    enabled: !!exerciseName,
    staleTime: 5 * 60 * 1000,
  });
};
