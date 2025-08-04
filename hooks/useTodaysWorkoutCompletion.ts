import { SessionService } from "@/database/services/sessionService";
import { useQuery } from "@tanstack/react-query";
import { useTodaysWorkout } from "./service/workouts";

export const useTodaysWorkoutCompletion = () => {
  const { data: todaysWorkout, isLoading: isTodaysWorkoutLoading } =
    useTodaysWorkout();

  return useQuery({
    queryKey: ["todaysWorkoutCompletion", todaysWorkout?.id],
    queryFn: async () => {
      if (!todaysWorkout?.id) {
        return null;
      }

      // Get all sessions for today's workout
      const sessions = await SessionService.getSessionsByWorkoutId(
        todaysWorkout.id,
      );

      // Check if there's a completed session from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completedToday = sessions.find((session) => {
        if (!session.is_completed || !session.completed_at) {
          return false;
        }

        const completedDate = new Date(session.completed_at);
        completedDate.setHours(0, 0, 0, 0);

        return completedDate.getTime() === today.getTime();
      });

      return completedToday || null;
    },
    enabled: !!todaysWorkout?.id && !isTodaysWorkoutLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
