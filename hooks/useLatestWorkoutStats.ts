import { SessionService } from "@/database/services/sessionService";
import { SessionSetService } from "@/database/services/sessionSetService";
import { useQuery } from "@tanstack/react-query";
import { useWorkouts } from "./service/workouts";

interface WorkoutStats {
  total_sessions: number;
  completed_sessions: number;
  total_sets: number;
  completed_sets: number;
  total_exercises: number;
  total_weight: number;
  total_reps: number;
  total_duration: number;
  total_distance: number;
  exercises_completed: number;
  completion_rate: number;
  average_session_duration: number;
  total_workouts: number;
}

export const useLatestWorkoutStats = () => {
  const { data: activeWorkouts, isLoading } = useWorkouts();

  return useQuery({
    queryKey: ["activeWorkoutsStats"],
    queryFn: async (): Promise<WorkoutStats> => {
      if (!activeWorkouts || activeWorkouts.length === 0) {
        return {
          total_sessions: 0,
          completed_sessions: 0,
          total_sets: 0,
          completed_sets: 0,
          total_exercises: 0,
          total_weight: 0,
          total_reps: 0,
          total_duration: 0,
          total_distance: 0,
          exercises_completed: 0,
          completion_rate: 0,
          average_session_duration: 0,
          total_workouts: 0,
        };
      }

      let total_sessions = 0;
      let completed_sessions = 0;
      let total_sets = 0;
      let completed_sets = 0;
      let total_weight = 0;
      let total_reps = 0;
      let totalDurationMs = 0;
      const uniqueExerciseIds = new Set<string>();
      const exerciseCompletion = new Map<
        string,
        { total: number; completed: number }
      >();

      for (const workout of activeWorkouts) {
        if (!workout.id) continue;

        try {
          // Get all sessions for this workout
          const workoutSessions = await SessionService.getSessionsByWorkoutId(
            workout.id,
          );

          total_sessions += workoutSessions.length;
          completed_sessions += workoutSessions.filter(
            (session) => session.is_completed,
          ).length;

          // Calculate duration from completed sessions
          workoutSessions.forEach((session) => {
            if (
              session.is_completed &&
              session.completed_at &&
              session.started_at
            ) {
              const start = new Date(session.started_at);
              const end = new Date(session.completed_at);
              totalDurationMs += end.getTime() - start.getTime();
            }
          });

          // Process each session's sets
          for (const session of workoutSessions) {
            if (!session.id) continue;

            try {
              const sessionSets =
                await SessionSetService.getSessionSetsBySessionId(session.id);

              total_sets += sessionSets.length;
              completed_sets += sessionSets.filter(
                (set) => set.is_completed,
              ).length;

              // Track unique exercises
              sessionSets.forEach((set) => {
                uniqueExerciseIds.add(set.exercise_id);
              });

              // Calculate exercise completion
              sessionSets.forEach((set) => {
                if (!exerciseCompletion.has(set.exercise_id)) {
                  exerciseCompletion.set(set.exercise_id, {
                    total: 0,
                    completed: 0,
                  });
                }
                const stats = exerciseCompletion.get(set.exercise_id)!;
                stats.total++;
                if (set.is_completed) {
                  stats.completed++;
                }
              });

              // Calculate weight and reps from completed sets
              sessionSets.forEach((set) => {
                if (set.is_completed && set.target) {
                  // Extract weight and reps from the target object
                  if (
                    set.target.weight &&
                    typeof set.target.weight === "number"
                  ) {
                    total_weight += set.target.weight;
                  }
                  if (set.target.reps && typeof set.target.reps === "number") {
                    total_reps += set.target.reps;
                  }
                }
              });
            } catch (error) {
              console.error(
                `Error fetching sets for session ${session.id}:`,
                error,
              );
            }
          }
        } catch (error) {
          console.error(
            `Error fetching sessions for workout ${workout.id}:`,
            error,
          );
        }
      }

      const total_workouts = activeWorkouts.length;
      const total_exercises = uniqueExerciseIds.size;
      const exercises_completed = Array.from(
        exerciseCompletion.values(),
      ).filter((stats) => stats.completed === stats.total).length;
      const completion_rate =
        total_sessions > 0 ? (completed_sessions / total_sessions) * 100 : 0;
      const total_duration = Math.floor(totalDurationMs / (1000 * 60)); // Convert to minutes
      const average_session_duration =
        completed_sessions > 0
          ? Math.round(total_duration / completed_sessions)
          : 0;

      return {
        total_sessions,
        completed_sessions,
        total_sets,
        completed_sets,
        total_exercises,
        total_weight,
        total_reps,
        total_duration,
        total_distance: 0, // Not available from session sets
        exercises_completed,
        completion_rate,
        average_session_duration,
        total_workouts,
      };
    },
    enabled: !isLoading && !!activeWorkouts,
    staleTime: 30 * 1000, // 30 seconds
  });
};
