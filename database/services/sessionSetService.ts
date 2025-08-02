import { SessionSet as SessionSetType } from "@/validation/sessionSets";
import { executeQuery, getAllRows, getFirstRow } from "../database";
import { ExerciseService } from "./exerciseService";

export class SessionSetService {
  static async initializeSessionSets(
    sessionId: number,
    workoutId: number,
  ): Promise<number[]> {
    const exercises = await ExerciseService.getExercisesByWorkoutId(workoutId);

    return Promise.all(
      exercises.map(async (exercise) => {
        const sets = exercise.target?.sets ? parseInt(exercise.target.sets) : 1;

        const setPromises = Array.from({ length: sets }, () =>
          this.createExerciseSet({
            session_id: sessionId,
            exercise_id: exercise.id ?? "",
            target: exercise.target,
            is_completed: false,
          }),
        );
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
    const { target, ...rest } = set;
    return {
      ...rest,
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

    console.log(
      `UPDATE session_set SET ${setParts.join(", ")} WHERE id = ?`,
      values,
    );

    await executeQuery(
      `UPDATE session_set SET ${setParts.join(", ")} WHERE id = ?`,
      values,
    );
  }
}
