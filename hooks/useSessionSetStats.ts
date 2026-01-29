import { useQuery } from "@tanstack/react-query";
import { sessionKeys } from "./service/session";
import { useSessionSetsBySessionId } from "./service";

interface SessionStats {
  total_sets: number;
  completed_sets: number;
  total_exercises: number;
  total_weight: number;
  total_reps: number;
  total_duration: number;
  total_distance: number;
  exercises_completed: number;
  completion_rate: number;
}

const parseNumeric = (value: string | number | null | undefined): number => {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export const useSessionSetStats = (sessionId: number) => {
  const { data: sessionSets } = useSessionSetsBySessionId(sessionId);
  return useQuery({
    queryKey: [
      ...sessionKeys.sessionStats(sessionId),
      sessionSets?.length ?? 0,
    ],
    queryFn: async (): Promise<SessionStats> => {
      if (!sessionSets || sessionSets.length === 0) {
        return {
          total_sets: 0,
          completed_sets: 0,
          total_exercises: 0,
          total_weight: 0,
          total_reps: 0,
          total_duration: 0,
          total_distance: 0,
          exercises_completed: 0,
          completion_rate: 0,
        };
      }

      // Calculate statistics
      const total_sets = sessionSets.length;
      const completed_sets = sessionSets.filter(
        (set) => set.is_completed,
      ).length;

      // Get unique exercises
      const uniqueExerciseIds = new Set(
        sessionSets.map((set) => set.exercise_id),
      );
      const total_exercises = uniqueExerciseIds.size;

      // Calculate exercise completion (an exercise is complete if all its sets are complete)
      const exerciseCompletion = new Map<
        string,
        { total: number; completed: number }
      >();

      sessionSets.forEach((set) => {
        const exerciseId = set.exercise_id;
        if (!exerciseCompletion.has(exerciseId)) {
          exerciseCompletion.set(exerciseId, { total: 0, completed: 0 });
        }
        const stats = exerciseCompletion.get(exerciseId)!;
        stats.total++;
        if (set.is_completed) {
          stats.completed++;
        }
      });

      const exercises_completed = Array.from(
        exerciseCompletion.values(),
      ).filter((stats) => stats.completed === stats.total).length;

      let total_weight = 0;
      let total_reps = 0;
      let total_duration = 0;
      let total_distance = 0;

      sessionSets.forEach((set) => {
        if (set.is_completed && set.target) {
          total_weight += parseNumeric(set.target.weight);
          total_reps += parseNumeric(set.target.reps);
          total_duration += parseNumeric(set.target.duration);
          total_distance += parseNumeric(set.target.distance);
        }
      });

      const completion_rate =
        total_sets > 0 ? (completed_sets / total_sets) * 100 : 0;

      return {
        total_sets,
        completed_sets,
        total_exercises,
        total_weight,
        total_reps,
        total_duration,
        total_distance,
        exercises_completed,
        completion_rate,
      };
    },
    enabled: !!sessionId && !!sessionSets,
    staleTime: 30 * 1000,
  });
};
