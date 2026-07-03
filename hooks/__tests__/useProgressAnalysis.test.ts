import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useProgressAnalysis } from "../useProgressAnalysis";
import { SessionService } from "@/database/services/sessionService";
import { RunSessionService } from "@/database/services/runSessionService";
import { SettingsService } from "@/database/services/settingsService";
import { WorkoutService } from "@/database/services/workoutService";
import { GeminiService } from "@/services/geminiService";

jest.mock("@/database/services/sessionService");
jest.mock("@/database/services/runSessionService");
jest.mock("@/database/services/settingsService");
jest.mock("@/database/services/workoutService");
jest.mock("@/services/geminiService");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useProgressAnalysis", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (WorkoutService.getActiveWorkouts as jest.Mock).mockResolvedValue([
      { id: 1, ai_goals: "Run a half marathon" },
    ]);
    (SessionService.getRecentSessions as jest.Mock).mockResolvedValue([
      { id: 1, started_at: "2026-07-01" },
    ]);
    (SessionService.getSessionStats as jest.Mock).mockResolvedValue({
      total_sets: 10,
      total_exercises: 3,
      total_weight: 1000,
      total_reps: 80,
    });
    (RunSessionService.getRecentSessions as jest.Mock).mockResolvedValue([]);
    (SettingsService.getSetting as jest.Mock).mockResolvedValue(null);
    (SettingsService.setSetting as jest.Mock).mockResolvedValue(undefined);
  });

  it("calls the analyser with the active goal and caches the result", async () => {
    const analysis = {
      onTrack: "on-track",
      score: 70,
      summary: "Good.",
      strengths: [],
      concerns: [],
      suggestions: [],
    };
    (GeminiService.analyzeProgress as jest.Mock).mockResolvedValue(analysis);

    const { result } = renderHook(() => useProgressAnalysis(), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.goal).toBe("Run a half marathon"),
    );

    act(() => {
      result.current.analyze();
    });

    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(GeminiService.analyzeProgress).toHaveBeenCalledWith(
      expect.objectContaining({ goal: "Run a half marathon" }),
    );
    expect(SettingsService.setSetting).toHaveBeenCalledWith(
      "progressAnalysis",
      expect.stringContaining("on-track"),
    );
    expect(result.current.result?.analysis).toMatchObject(analysis);
  });
});
