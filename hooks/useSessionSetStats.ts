import { useQuery } from "@tanstack/react-query";
import { sessionKeys } from "./session";
import { useSessionSetsBySessionId } from "./sessionSet";

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

export const useSessionStats = (sessionId: number) => {
  const { data: sessionSets } = useSessionSetsBySessionId(sessionId);
  return useQuery({
    queryKey: sessionKeys.sessionStats(sessionId),
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

      // Calculate totals for different metrics
      let total_weight = 0;
      let total_reps = 0;

      sessionSets.forEach((set) => {
        if (set.is_completed) {
          // Add weight if available
          if (set.target && typeof set.target.weight === "number") {
            total_weight += set.target.weight;
          }

          // Add reps if available
          if (set.target && typeof set.target.reps === "number") {
            total_reps += set.target.reps;
          }
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
        total_duration: 0, // Not available from session sets alone
        total_distance: 0, // Not available from session sets alone
        exercises_completed,
        completion_rate,
      };
    },
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
  });
};
