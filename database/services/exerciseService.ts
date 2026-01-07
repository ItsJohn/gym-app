import { Exercise } from "@/validation/schemas";
import { executeQuery, getAllRows, getFirstRow } from "../database";
import { UpdateExercise } from "../types";
import { generateUUID } from "./utils";

export class ExerciseService {
  static async createExercise(exercise: Exercise): Promise<void> {
    const id = exercise.id || generateUUID(); // Generate ID if not provided
    await executeQuery(
      `INSERT INTO exercises (id, name, type, target, muscle_group, difficulty, rest_seconds, notes, video_url, workout_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        exercise.name,
        exercise.type,
        JSON.stringify(exercise.target),
        exercise.muscle_group,
        exercise.difficulty,
        exercise.rest_seconds,
        exercise.notes,
        exercise.video_url,
        exercise.workout_id,
      ],
    );
  }

  static async getExercisesByWorkoutId(workoutId: number): Promise<Exercise[]> {
    const exercises = await getAllRows<Exercise>(
      "SELECT * FROM exercises WHERE workout_id = ?",
      [workoutId],
    );
    return exercises.map(({ target, ...rest }) => ({
      ...rest,
      target: target ? JSON.parse(target as string) : undefined,
    }));
  }

  static async getExerciseById(id: string): Promise<Exercise | null> {
    const exercise = await getFirstRow<Exercise>(
      "SELECT * FROM exercises WHERE id = ?",
      [id],
    );
    if (!exercise) return null;
    return {
      ...exercise,
      target: exercise.target
        ? JSON.parse(exercise.target as string)
        : undefined,
    };
  }

  static async updateExercise(
    id: string,
    updates: UpdateExercise,
  ): Promise<void> {
    const setParts: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      setParts.push(`${key} = ?`);
      values.push(value);
    });

    if (setParts.length === 0) return;

    setParts.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    await executeQuery(
      `UPDATE exercises SET ${setParts.join(", ")} WHERE id = ?`,
      values,
    );
  }

  static async deleteExercise(id: string): Promise<void> {
    await executeQuery("DELETE FROM exercises WHERE id = ?", [id]);
  }
}
