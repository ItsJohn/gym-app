import { RunSessionService } from "@/database/services/runSessionService";
import { SessionService } from "@/database/services/sessionService";
import { SettingsService } from "@/database/services/settingsService";
import { WorkoutService } from "@/database/services/workoutService";
import { GeminiService, GymSessionSummary } from "@/services/geminiService";
import { WorkoutAnalysis } from "@/validation/schemas";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const CACHE_KEY = "progressAnalysis";
const GYM_LIMIT = 10;
const RUN_LIMIT = 15;

export interface CachedAnalysis {
  analysis: WorkoutAnalysis;
  analyzedAt: string;
}

async function assembleInput() {
  const [sessions, runs, activeWorkouts] = await Promise.all([
    SessionService.getRecentSessions(GYM_LIMIT),
    RunSessionService.getRecentSessions(RUN_LIMIT),
    WorkoutService.getActiveWorkouts(),
  ]);

  const goal = activeWorkouts[0]?.ai_goals?.trim() || "General fitness";

  const gymSessions: GymSessionSummary[] = await Promise.all(
    sessions.map(async (s) => {
      const stats = s.id
        ? await SessionService.getSessionStats(s.id)
        : {
            total_sets: 0,
            total_exercises: 0,
            total_weight: 0,
            total_reps: 0,
          };
      return {
        started_at: s.started_at ?? "",
        total_sets: stats.total_sets ?? 0,
        total_exercises: stats.total_exercises ?? 0,
        total_weight: stats.total_weight ?? 0,
        total_reps: stats.total_reps ?? 0,
      };
    }),
  );

  return {
    goal,
    gymSessions,
    runs,
    hasData: sessions.length + runs.length > 0,
  };
}

export function useProgressAnalysis() {
  const [cached, setCached] = useState<CachedAnalysis | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [hasData, setHasData] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [stored, activeWorkouts, sessions, runs] = await Promise.all([
        SettingsService.getSetting(CACHE_KEY),
        WorkoutService.getActiveWorkouts(),
        SessionService.getRecentSessions(1),
        RunSessionService.getRecentSessions(1),
      ]);
      if (!active) return;
      setGoal(activeWorkouts[0]?.ai_goals?.trim() || "General fitness");
      setHasData(sessions.length + runs.length > 0);
      if (stored) {
        try {
          setCached(JSON.parse(stored) as CachedAnalysis);
        } catch {
          // ignore corrupt cache
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      const input = await assembleInput();
      const analysis = await GeminiService.analyzeProgress({
        goal: input.goal,
        gymSessions: input.gymSessions,
        runs: input.runs,
      });
      const result: CachedAnalysis = {
        analysis,
        analyzedAt: new Date().toISOString(),
      };
      await SettingsService.setSetting(CACHE_KEY, JSON.stringify(result));
      return result;
    },
    onSuccess: (result) => setCached(result),
  });

  return {
    goal,
    hasData,
    result: mutation.data ?? cached,
    analyze: mutation.mutate,
    isAnalyzing: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
}
