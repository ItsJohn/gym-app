import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { SessionService } from "@/database/services/sessionService";
import { WorkoutService } from "@/database/services/workoutService";
import { Session } from "@/validation/session";

interface HomeStats {
  totalWorkouts: number;
  recentSessions: number;
  thisWeekSessions: number;
}

export function useHomeData() {
  const [stats, setStats] = useState<HomeStats>({
    totalWorkouts: 0,
    recentSessions: 0,
    thisWeekSessions: 0,
  });
  const [recentSession, setRecentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHomeData = useCallback(async () => {
    try {
      setIsLoading(true);

      const workouts = await WorkoutService.getAllWorkouts();
      const sessions = await SessionService.getRecentSessions(10);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekSessions = sessions.filter(
        (s) => s.started_at && new Date(s.started_at) >= oneWeekAgo,
      ).length;

      setStats({
        totalWorkouts: workouts.length,
        recentSessions: sessions.length,
        thisWeekSessions,
      });

      if (sessions.length > 0) {
        setRecentSession(sessions[0]);
      }
    } catch (err) {
      console.error("Error loading home data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [loadHomeData]),
  );

  return { stats, recentSession, isLoading };
}
