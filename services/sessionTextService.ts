import { getAllRows, getFirstRow } from "@/database/database";

export interface SessionTextSet {
  exercise_name: string;
  exercise_type: string;
  target: string;
  is_completed: number;
}

export interface SessionTextSession {
  workout_title: string;
  started_at: string;
  completed_at: string | null;
  is_completed: number;
  notes: string | null;
}

interface Target {
  reps?: string;
  per_side?: string;
  duration?: string;
  distance?: string;
  weight?: number;
}

function parseTarget(raw: string): Target {
  try {
    const t = JSON.parse(raw) as Record<string, unknown>;
    return {
      reps: t.reps != null ? String(t.reps) : undefined,
      per_side: t.per_side != null ? String(t.per_side) : undefined,
      duration: t.duration != null ? String(t.duration) : undefined,
      distance: t.distance != null ? String(t.distance) : undefined,
      weight: typeof t.weight === "number" ? t.weight : undefined,
    };
  } catch {
    return {};
  }
}

function describeMeasure(type: string, target: Target): string | undefined {
  switch (type) {
    case "duration":
      return target.duration ? `${target.duration}s` : undefined;
    case "distance":
      return target.distance ? `${target.distance}m` : undefined;
    case "reps-per-side": {
      const perSide = target.per_side ?? target.reps;
      return perSide ? `${perSide} reps/side` : undefined;
    }
    default:
      return target.reps ? `${target.reps} reps` : undefined;
  }
}

function describeSet(set: SessionTextSet, weightUnit: string): string {
  const target = parseTarget(set.target);
  const parts: string[] = [];

  if (target.weight != null && target.weight > 0) {
    parts.push(`${target.weight}${weightUnit}`);
  }
  const measure = describeMeasure(set.exercise_type, target);
  if (measure) parts.push(measure);

  const description = parts.join(" x ") || "logged";
  return set.is_completed ? description : `${description} (skipped)`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return "In progress";

  const minutes = Math.floor(
    (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000,
  );
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

export function formatSessionText(
  session: SessionTextSession,
  sets: SessionTextSet[],
  weightUnit = "kg",
): string {
  const lines: string[] = [];

  lines.push(`${session.workout_title} - ${formatDate(session.started_at)}`);
  lines.push(
    `Duration: ${formatDuration(session.started_at, session.completed_at)}`,
  );
  if (!session.is_completed) lines.push("Status: In progress");
  lines.push("");

  if (sets.length === 0) {
    lines.push("No sets logged.");
  } else {
    const byExercise = new Map<string, SessionTextSet[]>();
    for (const set of sets) {
      const list = byExercise.get(set.exercise_name) ?? [];
      list.push(set);
      byExercise.set(set.exercise_name, list);
    }

    for (const [exercise, exerciseSets] of byExercise) {
      lines.push(exercise);
      exerciseSets.forEach((set, index) => {
        lines.push(`  ${index + 1}. ${describeSet(set, weightUnit)}`);
      });
      lines.push("");
    }
  }

  if (session.notes) {
    lines.push(`Notes: ${session.notes}`);
  }

  return lines.join("\n").trim();
}

export class SessionTextService {
  static async buildSessionText(
    sessionId: number,
    weightUnit = "kg",
  ): Promise<string> {
    const session = await getFirstRow<SessionTextSession>(
      `SELECT w.title AS workout_title, ws.started_at, ws.completed_at,
              ws.is_completed, ws.notes
       FROM workout_sessions ws
       JOIN workouts w ON ws.workout_id = w.id
       WHERE ws.id = ?`,
      [sessionId],
    );

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const sets = await getAllRows<SessionTextSet>(
      `SELECT e.name AS exercise_name, e.type AS exercise_type,
              ss.target, ss.is_completed
       FROM session_set ss
       JOIN exercises e ON ss.exercise_id = e.id
       WHERE ss.session_id = ?
       ORDER BY ss.created_at ASC`,
      [sessionId],
    );

    return formatSessionText(session, sets, weightUnit);
  }
}
