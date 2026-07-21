import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { getAllRows } from "@/database/database";

export const EXPORT_WEEKS = 10;

interface StrengthSessionRow {
  id: number;
  workout_title: string;
  started_at: string;
  completed_at: string | null;
  is_completed: number;
  notes: string | null;
}

interface StrengthSetRow {
  session_id: number;
  target: string;
  is_completed: number;
  exercise_name: string;
  muscle_group: string;
}

interface RunRow {
  strava_id: string;
  name: string | null;
  started_at: string;
  distance_m: number;
  duration_secs: number;
  avg_pace_secs_per_km: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  total_elevation_gain: number | null;
  suffer_score: number | null;
}

export interface ExportSet {
  exercise: string;
  muscle_group: string;
  weight?: number;
  reps?: string;
  per_side?: string;
  distance?: string;
  is_completed: boolean;
}

export interface ExportStrengthSession {
  workout: string;
  started_at: string;
  is_completed: boolean;
  notes?: string;
  sets: ExportSet[];
}

export interface ExportRun {
  name?: string;
  started_at: string;
  distance_km: number;
  duration_secs: number;
  avg_pace_secs_per_km?: number;
  avg_hr?: number;
  max_hr?: number;
  total_elevation_gain?: number;
  suffer_score?: number;
}

export interface FitnessExportData {
  strengthSessions: ExportStrengthSession[];
  runs: ExportRun[];
}

export interface FitnessExport {
  generated_at: string;
  weeks: number;
  range_start: string;
  range_end: string;
  summary: {
    strength_sessions: number;
    runs: number;
    total_run_distance_km: number;
  };
  strength_sessions: ExportStrengthSession[];
  runs: ExportRun[];
}

function parseTarget(raw: string): Partial<ExportSet> {
  try {
    const t = JSON.parse(raw) as Record<string, unknown>;
    return {
      weight: typeof t.weight === "number" ? t.weight : undefined,
      reps: t.reps != null ? String(t.reps) : undefined,
      per_side: t.per_side != null ? String(t.per_side) : undefined,
      distance: t.distance != null ? String(t.distance) : undefined,
    };
  } catch {
    return {};
  }
}

export function shapeFitnessData(
  sessions: StrengthSessionRow[],
  sets: StrengthSetRow[],
  runs: RunRow[],
): FitnessExportData {
  const setsBySession = new Map<number, ExportSet[]>();
  for (const s of sets) {
    const list = setsBySession.get(s.session_id) ?? [];
    list.push({
      exercise: s.exercise_name,
      muscle_group: s.muscle_group,
      is_completed: Boolean(s.is_completed),
      ...parseTarget(s.target),
    });
    setsBySession.set(s.session_id, list);
  }

  const strengthSessions: ExportStrengthSession[] = sessions.map((session) => ({
    workout: session.workout_title,
    started_at: session.started_at,
    is_completed: Boolean(session.is_completed),
    notes: session.notes ?? undefined,
    sets: setsBySession.get(session.id) ?? [],
  }));

  const shapedRuns: ExportRun[] = runs.map((r) => ({
    name: r.name ?? undefined,
    started_at: r.started_at,
    distance_km: Math.round((r.distance_m / 1000) * 100) / 100,
    duration_secs: r.duration_secs,
    avg_pace_secs_per_km: r.avg_pace_secs_per_km ?? undefined,
    avg_hr: r.avg_hr ?? undefined,
    max_hr: r.max_hr ?? undefined,
    total_elevation_gain: r.total_elevation_gain ?? undefined,
    suffer_score: r.suffer_score ?? undefined,
  }));

  return { strengthSessions, runs: shapedRuns };
}

export function buildFitnessExport(
  data: FitnessExportData,
  meta: { weeks: number; rangeStart: Date; rangeEnd: Date },
): FitnessExport {
  const totalRunKm =
    Math.round(data.runs.reduce((sum, r) => sum + r.distance_km, 0) * 100) /
    100;

  return {
    generated_at: meta.rangeEnd.toISOString(),
    weeks: meta.weeks,
    range_start: meta.rangeStart.toISOString(),
    range_end: meta.rangeEnd.toISOString(),
    summary: {
      strength_sessions: data.strengthSessions.length,
      runs: data.runs.length,
      total_run_distance_km: totalRunKm,
    },
    strength_sessions: data.strengthSessions,
    runs: data.runs,
  };
}

function formatPace(secsPerKm?: number): string {
  if (secsPerKm == null) return "—";
  const mins = Math.floor(secsPerKm / 60);
  const secs = Math.round(secsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}/km`;
}

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.round(secs % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

function describeSet(set: ExportSet): string {
  const parts: string[] = [];
  if (set.weight != null) parts.push(`${set.weight}kg`);
  if (set.per_side != null) parts.push(`${set.per_side}/side`);
  else if (set.reps != null) parts.push(`${set.reps} reps`);
  if (set.distance != null) parts.push(`${set.distance}`);
  return parts.join(" × ") || "logged";
}

export function toMarkdown(exp: FitnessExport): string {
  const lines: string[] = [];
  lines.push(`# Fitness Export — last ${exp.weeks} weeks`);
  lines.push("");
  lines.push(
    `Range: ${formatDate(exp.range_start)} → ${formatDate(exp.range_end)}`,
  );
  lines.push("");
  lines.push(
    `**${exp.summary.strength_sessions}** strength sessions · ` +
      `**${exp.summary.runs}** runs · ` +
      `**${exp.summary.total_run_distance_km} km** run total`,
  );
  lines.push("");

  lines.push("## Strength sessions");
  lines.push("");
  if (exp.strength_sessions.length === 0) {
    lines.push("_No strength sessions in this period._");
  } else {
    for (const session of exp.strength_sessions) {
      const status = session.is_completed ? "" : " (incomplete)";
      lines.push(
        `### ${formatDate(session.started_at)} — ${session.workout}${status}`,
      );
      if (session.notes) lines.push(`> ${session.notes}`);
      const byExercise = new Map<string, ExportSet[]>();
      for (const set of session.sets) {
        const list = byExercise.get(set.exercise) ?? [];
        list.push(set);
        byExercise.set(set.exercise, list);
      }
      for (const [exercise, sets] of byExercise) {
        const summary = sets.map(describeSet).join(", ");
        lines.push(`- **${exercise}** (${sets[0].muscle_group}): ${summary}`);
      }
      lines.push("");
    }
  }

  lines.push("## Runs (from Strava)");
  lines.push("");
  if (exp.runs.length === 0) {
    lines.push("_No runs in this period._");
  } else {
    lines.push("| Date | Name | Distance | Time | Pace | Avg HR |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const run of exp.runs) {
      lines.push(
        `| ${formatDate(run.started_at)} | ${run.name ?? "Run"} | ` +
          `${run.distance_km} km | ${formatDuration(run.duration_secs)} | ` +
          `${formatPace(run.avg_pace_secs_per_km)} | ` +
          `${run.avg_hr ?? "—"} |`,
      );
    }
  }
  lines.push("");

  return lines.join("\n");
}

async function gatherFitnessData(
  weeks: number,
  now: Date,
): Promise<FitnessExportData> {
  const cutoff = new Date(
    now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const sessions = await getAllRows<StrengthSessionRow>(
    `SELECT ws.id, w.title AS workout_title, ws.started_at,
            ws.completed_at, ws.is_completed, ws.notes
     FROM workout_sessions ws
     JOIN workouts w ON ws.workout_id = w.id
     WHERE datetime(ws.started_at) >= datetime(?)
     ORDER BY ws.started_at DESC`,
    [cutoff],
  );

  const sessionIds = sessions.map((s) => s.id);
  let sets: StrengthSetRow[] = [];
  if (sessionIds.length > 0) {
    const placeholders = sessionIds.map(() => "?").join(", ");
    sets = await getAllRows<StrengthSetRow>(
      `SELECT ss.session_id, ss.target, ss.is_completed,
              e.name AS exercise_name, e.muscle_group
       FROM session_set ss
       JOIN exercises e ON ss.exercise_id = e.id
       WHERE ss.session_id IN (${placeholders})
       ORDER BY ss.session_id, ss.created_at ASC`,
      sessionIds,
    );
  }

  const runs = await getAllRows<RunRow>(
    `SELECT strava_id, name, started_at, distance_m, duration_secs,
            avg_pace_secs_per_km, avg_hr, max_hr, total_elevation_gain, suffer_score
     FROM run_sessions
     WHERE datetime(started_at) >= datetime(?)
     ORDER BY started_at DESC`,
    [cutoff],
  );

  return shapeFitnessData(sessions, sets, runs);
}

export class FitnessExportService {
  static async buildExport(
    weeks = EXPORT_WEEKS,
    now = new Date(),
  ): Promise<FitnessExport> {
    const data = await gatherFitnessData(weeks, now);
    const rangeStart = new Date(
      now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000,
    );
    return buildFitnessExport(data, { weeks, rangeStart, rangeEnd: now });
  }

  // Writes the export to a Markdown + JSON file and opens the share sheet so
  // the user can drop it into a Claude Project. Returns the number of sessions
  // and runs included. Sharing is unavailable on web (no-op after write).
  static async exportAndShare(
    weeks = EXPORT_WEEKS,
  ): Promise<{ strengthSessions: number; runs: number }> {
    const exp = await this.buildExport(weeks);
    const stamp = exp.range_end.slice(0, 10);

    const markdownFile = new File(Paths.cache, `fitness-export-${stamp}.md`);
    if (markdownFile.exists) markdownFile.delete();
    markdownFile.create();
    markdownFile.write(toMarkdown(exp));

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(markdownFile.uri, {
        mimeType: "text/markdown",
        dialogTitle: "Export fitness data",
        UTI: "net.daringfireball.markdown",
      });
    }

    return {
      strengthSessions: exp.summary.strength_sessions,
      runs: exp.summary.runs,
    };
  }
}
