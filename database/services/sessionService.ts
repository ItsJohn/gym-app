import { Exercise, Workout } from "@/validation/schemas";
import { Session } from "@/validation/session";
import { executeQuery, getAllRows, getFirstRow } from "../database";
import { ExerciseSet, WorkoutSessionWithDetails } from "../types";

export class SessionService {
  static async createSession(session: Session): Promise<number> {
    const result = await executeQuery(
      `INSERT INTO workout_sessions (workout_id, notes)
       VALUES (?, ?)`,
      [session.workout_id, session.notes || null],
    );
    return result.lastInsertRowId;
  }

  static async getSessionById(id: number): Promise<Session | null> {
    return await getFirstRow<Session>(
      "SELECT * FROM workout_sessions WHERE id = ?",
      [id],
    );
  }

  static async getSessionsByWorkoutId(workoutId: number): Promise<Session[]> {
    return await getAllRows<Session>(
      "SELECT * FROM workout_sessions WHERE workout_id = ? ORDER BY started_at DESC",
      [workoutId],
    );
  }

  static async getRecentSessions(limit: number = 10): Promise<Session[]> {
    return await getAllRows<Session>(
      "SELECT * FROM workout_sessions ORDER BY started_at DESC LIMIT ?",
      [limit],
    );
  }

  static async getAllSessions(): Promise<Session[]> {
    return await getAllRows<Session>(
      "SELECT * FROM workout_sessions ORDER BY started_at DESC",
    );
  }

  static async completeSession(
    sessionId: string,
    notes?: string,
  ): Promise<void> {
    await executeQuery(
      `UPDATE workout_sessions
       SET is_completed = 1, completed_at = CURRENT_TIMESTAMP, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [notes || null, sessionId],
    );
  }

  static async deleteSession(sessionId: number): Promise<void> {
    await executeQuery("DELETE FROM workout_sessions WHERE id = ?", [
      sessionId,
    ]);
  }

  // Get session with full details (workout info and sets with exercises)
  static async getSessionWithDetails(
    sessionId: number,
  ): Promise<WorkoutSessionWithDetails | null> {
    const session = await this.getSessionById(sessionId);
    if (!session || !session.id) return null;

    const workout = await getFirstRow<Workout>(
      "SELECT * FROM workouts WHERE id = ?",
      [session.workout_id],
    );

    if (!workout) return null;

    const exerciseSets = await getAllRows<ExerciseSet & { exercise: Exercise }>(
      `SELECT
         es.*,
         e.name as exercise_name,
         e.target_sets,
         e.target_reps,
         e.muscle_group,
         e.difficulty,
         e.rest_seconds
       FROM session_set es
       JOIN exercises e ON es.exercise_id = e.id
       WHERE es.session_id = ?
       ORDER BY es.set_number`,
      [sessionId],
    );

    // Transform the flat result into nested structure
    const setsWithExercises = exerciseSets.map((row) => ({
      id: row.id,
      session_id: row.session_id,
      exercise_id: row.exercise_id,
      set_number: row.set_number,
      weight: row.weight,
      reps: row.reps,
      is_completed: Boolean(row.is_completed),
      completed_at: row.completed_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      exercise: {
        id: row.exercise_id,
        name: (row as any).exercise_name,
        type: "reps" as const,
        target: {
          reps: (row as any).target_reps?.toString() || null,
          sets: (row as any).target_sets?.toString() || null,
        },
        muscle_group: (row as any).muscle_group,
        difficulty: (row as any).difficulty,
        rest_seconds: (row as any).rest_seconds,
        workout_id: session.workout_id,
      },
    }));

    return {
      ...session,
      id: session.id!, // We already checked that session.id exists above
      started_at: session.started_at || new Date().toISOString(),
      created_at: session.created_at || new Date().toISOString(),
      updated_at: session.updated_at || new Date().toISOString(),
      completed_at: session.completed_at || undefined,
      notes: session.notes || undefined,
      workout,
      exercise_sets: setsWithExercises,
    };
  }

  // Get session statistics
  static async getSessionStats(sessionId: number) {
    const stats = await getFirstRow<{
      total_sets: number;
      completed_sets: number;
      total_exercises: number;
      total_weight: number;
      total_reps: number;
    }>(
      `SELECT
         COUNT(*) as total_sets,
         SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_sets,
         COUNT(DISTINCT exercise_id) as total_exercises,
         SUM(CASE WHEN json_extract(target, '$.weight') IS NOT NULL AND is_completed = 1 THEN json_extract(target, '$.weight') ELSE 0 END) as total_weight,
         SUM(CASE WHEN json_extract(target, '$.reps') IS NOT NULL AND is_completed = 1 THEN CAST(json_extract(target, '$.reps') AS INTEGER) ELSE 0 END) as total_reps
       FROM session_set
       WHERE session_id = ?`,
      [sessionId],
    );

    return (
      stats || {
        total_sets: 0,
        completed_sets: 0,
        total_exercises: 0,
        total_weight: 0,
        total_reps: 0,
      }
    );
  }

  // Check if session is complete (all sets completed)
  static async isSessionComplete(sessionId: number): Promise<boolean> {
    const result = await getFirstRow<{ incomplete_sets: number }>(
      "SELECT COUNT(*) as incomplete_sets FROM session_set WHERE session_id = ? AND is_completed = 0",
      [sessionId],
    );

    return (result?.incomplete_sets || 0) === 0;
  }

  // Get the most recent incomplete session
  static async getMostRecentIncompleteSession(): Promise<Session | null> {
    const sessions = await getAllRows<Session>(
      "SELECT * FROM workout_sessions ORDER BY started_at DESC LIMIT 1",
    );

    if (sessions.length === 0) return null;

    const session = sessions[0];
    if (!session.id) return null;

    if (session.is_completed) return null;

    return session;
  }

  static async getLastSessionSetsForExercise(
    workoutId: number,
    exerciseId: string,
  ): Promise<
    Array<{
      reps?: string;
      per_side?: string;
      distance?: string;
      weight?: number;
    }>
  > {
    const lastCompletedSession = await getFirstRow<Session>(
      `SELECT * FROM workout_sessions
       WHERE workout_id = ? AND is_completed = 1
       ORDER BY completed_at DESC LIMIT 1`,
      [workoutId],
    );

    if (!lastCompletedSession?.id) return [];

    const exerciseSets = await getAllRows<{ target: string }>(
      `SELECT target FROM session_set
       WHERE session_id = ? AND exercise_id = ?
       ORDER BY created_at ASC`,
      [lastCompletedSession.id, exerciseId],
    );

    return exerciseSets.map((set) => {
      try {
        const target = JSON.parse(set.target);
        return {
          reps: target.reps ?? undefined,
          per_side: target.per_side ?? undefined,
          distance: target.distance ?? undefined,
          weight: target.weight ?? undefined,
        };
      } catch {
        return {};
      }
    });
  }

  // Get the last completed session's data for a specific exercise
  static async getLastSessionDataForExercise(
    workoutId: number,
    exerciseId: string,
  ): Promise<{ weight?: number; reps?: number; distance?: number } | null> {
    // Get the most recent completed session for this workout
    const lastCompletedSession = await getFirstRow<Session>(
      `SELECT * FROM workout_sessions
       WHERE workout_id = ? AND is_completed = 1
       ORDER BY completed_at DESC LIMIT 1`,
      [workoutId],
    );

    if (!lastCompletedSession || !lastCompletedSession.id) {
      return null;
    }

    // Get all sets for this exercise from the last session
    const exerciseSets = await getAllRows<ExerciseSet & { target: string }>(
      `SELECT *, target FROM session_set
       WHERE session_id = ? AND exercise_id = ? AND is_completed = 1
       ORDER BY created_at ASC`,
      [lastCompletedSession.id, exerciseId],
    );

    if (exerciseSets.length === 0) {
      return null;
    }

    // Parse the target data to get weight, reps, and distance
    const parsedSets = exerciseSets.map((set) => {
      try {
        const target = JSON.parse(set.target);
        return {
          weight: target.weight,
          // per_side takes precedence for reps-per-side exercises
          reps: target.per_side ?? target.reps,
          distance: target.distance,
        };
      } catch {
        return { weight: undefined, reps: undefined, distance: undefined };
      }
    });

    // Find minimum values (excluding undefined/null values)
    const validWeights = parsedSets
      .map((set) => set.weight)
      .filter((weight): weight is number => weight !== undefined && weight > 0);

    const validReps = parsedSets
      .map((set) => set.reps)
      .filter((reps): reps is number => reps !== undefined && reps > 0);

    const validDistances = parsedSets
      .map((set) => set.distance)
      .filter(
        (distance): distance is number =>
          distance !== undefined && distance > 0,
      );

    return {
      weight: validWeights.length > 0 ? Math.min(...validWeights) : undefined,
      reps: validReps.length > 0 ? Math.min(...validReps) : undefined,
      distance:
        validDistances.length > 0 ? Math.min(...validDistances) : undefined,
    };
  }
}
