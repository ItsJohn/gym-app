import { useQuery } from "@tanstack/react-query";
import { getAllRows } from "@/database/database";

export const analyticsKeys = {
  analytics: () => ["analytics"] as const,
  weightProgression: (exerciseId: string) =>
    [...analyticsKeys.analytics(), "weightProgression", exerciseId] as const,
  personalRecords: () =>
    [...analyticsKeys.analytics(), "personalRecords"] as const,
  workoutFrequency: (period: "week" | "month") =>
    [...analyticsKeys.analytics(), "workoutFrequency", period] as const,
  exercisesWithData: () =>
    [...analyticsKeys.analytics(), "exercisesWithData"] as const,
};

export interface WeightProgressionPoint {
  date: Date;
  weight: number;
  reps?: number;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  date: Date;
}

export interface WorkoutFrequencyPoint {
  period: string;
  count: number;
  label: string;
}

export interface ExerciseWithData {
  id: string;
  name: string;
}

export const useExercisesWithData = () => {
  return useQuery({
    queryKey: analyticsKeys.exercisesWithData(),
    queryFn: async (): Promise<ExerciseWithData[]> => {
      const results = await getAllRows<{ id: string; name: string }>(
        `SELECT DISTINCT e.id, e.name
         FROM session_set ss
         JOIN exercises e ON ss.exercise_id = e.id
         WHERE ss.is_completed = 1
           AND json_extract(ss.target, '$.weight') IS NOT NULL
           AND json_extract(ss.target, '$.weight') > 0
         ORDER BY e.name`,
      );
      return results;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useWeightProgression = (exerciseId: string) => {
  return useQuery({
    queryKey: analyticsKeys.weightProgression(exerciseId),
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
         WHERE ss.exercise_id = ?
           AND ss.is_completed = 1
           AND ss.completed_at IS NOT NULL
           AND json_extract(ss.target, '$.weight') IS NOT NULL
         ORDER BY ss.completed_at ASC`,
        [exerciseId],
      );

      return results
        .filter((r) => r.weight != null && r.weight > 0)
        .map((r) => ({
          date: new Date(r.completed_at),
          weight: r.weight,
          reps: r.reps ? parseInt(r.reps, 10) : undefined,
        }));
    },
    enabled: !!exerciseId,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePersonalRecords = () => {
  return useQuery({
    queryKey: analyticsKeys.personalRecords(),
    queryFn: async (): Promise<PersonalRecord[]> => {
      const results = await getAllRows<{
        exercise_id: string;
        exercise_name: string;
        max_weight: number;
        achieved_at: string;
      }>(
        `SELECT
           ss.exercise_id,
           e.name as exercise_name,
           MAX(CAST(json_extract(ss.target, '$.weight') AS REAL)) as max_weight,
           ss.completed_at as achieved_at
         FROM session_set ss
         JOIN exercises e ON ss.exercise_id = e.id
         WHERE ss.is_completed = 1
           AND json_extract(ss.target, '$.weight') IS NOT NULL
           AND json_extract(ss.target, '$.weight') > 0
         GROUP BY ss.exercise_id
         HAVING max_weight > 0
         ORDER BY max_weight DESC`,
      );

      const recordsWithDates: PersonalRecord[] = [];

      for (const result of results) {
        const prDate = await getAllRows<{ completed_at: string }>(
          `SELECT ss.completed_at
           FROM session_set ss
           WHERE ss.exercise_id = ?
             AND ss.is_completed = 1
             AND CAST(json_extract(ss.target, '$.weight') AS REAL) = ?
           ORDER BY ss.completed_at ASC
           LIMIT 1`,
          [result.exercise_id, result.max_weight],
        );

        recordsWithDates.push({
          exerciseId: result.exercise_id,
          exerciseName: result.exercise_name,
          weight: result.max_weight,
          date:
            prDate.length > 0 ? new Date(prDate[0].completed_at) : new Date(),
        });
      }

      return recordsWithDates;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useWorkoutFrequency = (period: "week" | "month") => {
  return useQuery({
    queryKey: analyticsKeys.workoutFrequency(period),
    queryFn: async (): Promise<WorkoutFrequencyPoint[]> => {
      const now = new Date();
      const results: WorkoutFrequencyPoint[] = [];

      if (period === "week") {
        for (let i = 11; i >= 0; i--) {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (now.getDay() + i * 7));
          weekStart.setHours(0, 0, 0, 0);

          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          const count = await getAllRows<{ count: number }>(
            `SELECT COUNT(*) as count
             FROM workout_sessions
             WHERE is_completed = 1
               AND started_at >= ?
               AND started_at <= ?`,
            [weekStart.toISOString(), weekEnd.toISOString()],
          );

          const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;

          results.push({
            period: weekStart.toISOString(),
            count: count[0]?.count || 0,
            label: weekLabel,
          });
        }
      } else {
        for (let i = 11; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(
            now.getFullYear(),
            now.getMonth() - i + 1,
            0,
          );
          monthEnd.setHours(23, 59, 59, 999);

          const count = await getAllRows<{ count: number }>(
            `SELECT COUNT(*) as count
             FROM workout_sessions
             WHERE is_completed = 1
               AND started_at >= ?
               AND started_at <= ?`,
            [monthStart.toISOString(), monthEnd.toISOString()],
          );

          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const monthLabel = monthNames[monthStart.getMonth()];

          results.push({
            period: monthStart.toISOString(),
            count: count[0]?.count || 0,
            label: monthLabel,
          });
        }
      }

      return results;
    },
    staleTime: 5 * 60 * 1000,
  });
};
