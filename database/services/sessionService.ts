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

  // Helper method to parse exercise sets and convert is_completed to boolean
  private static parseExerciseSets(sets: any[]): ExerciseSet[] {
    return sets.map((set) => ({
      ...set,
      is_completed: Boolean(set.is_completed),
    }));
  }

  // Get sets for a session
  static async getSetsBySessionId(sessionId: number): Promise<ExerciseSet[]> {
    const sets = await getAllRows<ExerciseSet>(
      "SELECT * FROM session_set WHERE session_id = ? ORDER BY exercise_id, set_number",
      [sessionId],
    );
    return this.parseExerciseSets(sets);
  }

  // Get sets for a specific exercise in a session
  static async getSetsBySessionAndExercise(
    sessionId: number,
    exerciseId: string,
  ): Promise<ExerciseSet[]> {
    const sets = await getAllRows<ExerciseSet>(
      "SELECT * FROM session_set WHERE session_id = ? AND exercise_id = ? ORDER BY set_number",
      [sessionId, exerciseId],
    );
    return this.parseExerciseSets(sets);
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
         SUM(CASE WHEN weight IS NOT NULL AND is_completed = 1 THEN weight ELSE 0 END) as total_weight,
         SUM(CASE WHEN reps IS NOT NULL AND is_completed = 1 THEN reps ELSE 0 END) as total_reps
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
}
