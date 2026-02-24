import { SessionSet as SessionSetType } from "@/validation/sessionSets";
import { executeQuery, getAllRows, getFirstRow } from "../database";
import { ExerciseService } from "./exerciseService";

export class SessionSetService {
  static async initializeSessionSets(
    sessionId: number,
    workoutId: number,
  ): Promise<number[]> {
    const exercises = await ExerciseService.getExercisesByWorkoutId(workoutId);

    // Batch-fetch last completed sets for each exercise by name, across all sessions
    const lastSetsByExerciseName = new Map<
      string,
      Array<{
        reps?: string;
        per_side?: string;
        distance?: string;
        weight?: number;
      }>
    >();

    const exerciseNames = exercises.map((e) => e.name).filter(Boolean);
    if (exerciseNames.length > 0) {
      const placeholders = exerciseNames.map(() => "?").join(", ");
      const allSets = await getAllRows<{
        exercise_name: string;
        target: string;
        session_id: number;
      }>(
        `SELECT e.name as exercise_name, ss.target, ss.session_id
         FROM session_set ss
         JOIN exercises e ON ss.exercise_id = e.id
         WHERE e.name IN (${placeholders})
           AND ss.is_completed = 1
         ORDER BY ss.session_id DESC, ss.created_at ASC`,
        exerciseNames,
      );

      // For each exercise name, find the most recent session_id
      const maxSessionIdByName = new Map<string, number>();
      for (const set of allSets) {
        const current = maxSessionIdByName.get(set.exercise_name) ?? -1;
        if (set.session_id > current) {
          maxSessionIdByName.set(set.exercise_name, set.session_id);
        }
      }

      // Collect sets only from the most recent session per exercise
      for (const set of allSets) {
        if (set.session_id !== maxSessionIdByName.get(set.exercise_name))
          continue;
        try {
          const target = JSON.parse(set.target);
          const arr = lastSetsByExerciseName.get(set.exercise_name) ?? [];
          arr.push({
            reps: target.reps ?? undefined,
            per_side: target.per_side ?? undefined,
            distance: target.distance ?? undefined,
            weight: target.weight ?? undefined,
          });
          lastSetsByExerciseName.set(set.exercise_name, arr);
        } catch {
          // skip sets with invalid target JSON
        }
      }
    }

    return Promise.all(
      exercises.map(async (exercise) => {
        const sets = exercise.target?.sets ? parseInt(exercise.target.sets) : 1;
        const lastSets = lastSetsByExerciseName.get(exercise.name) ?? [];

        const setPromises = Array.from({ length: sets }, (_, index) => {
          const last = lastSets[index];
          const target = {
            ...exercise.target,
            ...(last?.reps !== undefined && { reps: last.reps }),
            ...(last?.per_side !== undefined && { per_side: last.per_side }),
            ...(last?.distance !== undefined && { distance: last.distance }),
            ...(last?.weight !== undefined && { weight: last.weight }),
          };
          return this.createExerciseSet({
            session_id: sessionId,
            exercise_id: exercise.id ?? "",
            target,
            is_completed: false,
          });
        });
        return Promise.all(setPromises);
      }),
    ).then((setArrays) => setArrays.flat());
  }

  static async createExerciseSet(set: SessionSetType): Promise<number> {
    const result = await executeQuery(
      `INSERT INTO session_set (session_id, exercise_id, target, completed_at)
       VALUES (?, ?, ?, ?)`,
      [
        set.session_id,
        set.exercise_id,
        JSON.stringify(set.target),
        set.completed_at,
      ],
    );
    return result.lastInsertRowId;
  }

  static parseSessionSet(set?: SessionSetType): SessionSetType | undefined {
    if (!set) {
      return undefined;
    }
    const { target, is_completed, ...rest } = set;
    return {
      ...rest,
      is_completed: Boolean(is_completed),
      target: target ? JSON.parse(target as string) : null,
    };
  }

  static async getSessionSet(id: number): Promise<SessionSetType | undefined> {
    const result = await getFirstRow<SessionSetType>(
      `SELECT * FROM session_set WHERE id = ?`,
      [id],
    );
    return this.parseSessionSet(result!);
  }

  static async getSessionSetsBySessionId(
    sessionId: number,
  ): Promise<SessionSetType[]> {
    const result = await getAllRows<SessionSetType>(
      `SELECT * FROM session_set WHERE session_id = ? ORDER BY created_at ASC`,
      [sessionId],
    );
    return result
      .map(this.parseSessionSet)
      .filter((set): set is SessionSetType => set !== undefined);
  }

  static async getSessionSetsBySessionIdAndExerciseId(
    sessionId: number,
    exerciseId: string,
  ): Promise<SessionSetType[]> {
    const result = await getAllRows<SessionSetType>(
      `SELECT * FROM session_set WHERE session_id = ? AND exercise_id = ? ORDER BY created_at ASC`,
      [sessionId, exerciseId],
    );
    return result
      .map(this.parseSessionSet)
      .filter((set): set is SessionSetType => set !== undefined);
  }

  static async updateSessionSet(
    setId: number,
    updates: Partial<SessionSetType>,
  ): Promise<void> {
    const setParts: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      setParts.push(`${key} = ?`);
      if (key === "target") {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
    });

    if (setParts.length === 0) return;

    if (updates.is_completed) {
      setParts.push("completed_at = CURRENT_TIMESTAMP");
    }

    setParts.push("updated_at = CURRENT_TIMESTAMP");
    values.push(setId);

    await executeQuery(
      `UPDATE session_set SET ${setParts.join(", ")} WHERE id = ?`,
      values,
    );
  }
}
