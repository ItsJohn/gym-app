import {
  shapeFitnessData,
  buildFitnessExport,
  toMarkdown,
  toExportText,
} from "@/services/fitnessExportService";

describe("fitnessExportService", () => {
  const sessions = [
    {
      id: 1,
      workout_title: "Push Day",
      started_at: "2026-07-20T08:00:00.000Z",
      completed_at: "2026-07-20T09:00:00.000Z",
      is_completed: 1,
      notes: "felt strong",
    },
  ];
  const sets = [
    {
      session_id: 1,
      target: JSON.stringify({ weight: 60, reps: "8" }),
      is_completed: 1,
      exercise_name: "Bench Press",
      muscle_group: "Chest",
    },
  ];
  const runs = [
    {
      strava_id: "abc",
      name: "Morning Run",
      started_at: "2026-07-19T06:00:00.000Z",
      distance_m: 5000,
      duration_secs: 1500,
      avg_pace_secs_per_km: 300,
      avg_hr: 150,
      max_hr: 170,
      total_elevation_gain: 40,
      suffer_score: 55,
    },
  ];

  it("shapes rows and summarizes strength and run data into markdown", () => {
    const data = shapeFitnessData(sessions, sets, runs);
    const exp = buildFitnessExport(data, {
      weeks: 10,
      rangeStart: new Date("2026-05-11T00:00:00.000Z"),
      rangeEnd: new Date("2026-07-20T00:00:00.000Z"),
    });

    expect(exp.summary).toEqual({
      strength_sessions: 1,
      runs: 1,
      total_run_distance_km: 5,
    });

    const md = toMarkdown(exp);
    expect(md).toContain("last 10 weeks");
    expect(md).toContain("Push Day");
    expect(md).toContain("**Bench Press** (Chest): 60kg × 8 reps");
    expect(md).toContain("Morning Run");
    expect(md).toContain("5:00/km");
  });

  it("embeds a parseable JSON block after the summary", () => {
    const data = shapeFitnessData(sessions, sets, runs);
    const exp = buildFitnessExport(data, {
      weeks: 10,
      rangeStart: new Date("2026-05-11T00:00:00.000Z"),
      rangeEnd: new Date("2026-07-20T00:00:00.000Z"),
    });

    const text = toExportText(exp);
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    expect(JSON.parse(json).summary.runs).toBe(1);
  });
});
