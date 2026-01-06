import { Exercise, Workout } from "@/validation/schemas";
import { executeQuery, getAllRows, getFirstRow } from "../database";
import { DayOfWeek, DAYS_OF_WEEK, WorkoutWithExercises } from "../types";

// Helper function to convert is_active from number to boolean
const convertWorkoutToBoolean = (workout: any): Workout => ({
  ...workout,
  is_active: workout.is_active === 1 || workout.is_active === true,
});

export class WorkoutService {
  static async createWorkout(workout: Workout): Promise<number> {
    const result = await executeQuery(
      `INSERT INTO workouts (title, description, end_date, day_of_week, expected_duration, suggested_playlist, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        workout.title,
        workout.description,
        workout.end_date,
        workout.day_of_week,
        workout.expected_duration,
        workout.suggested_playlist,
        true,
      ],
    );
    return result.lastInsertRowId;
  }

  static async getAllWorkouts(): Promise<Workout[]> {
    const workouts = await getAllRows<Workout>(
      "SELECT * FROM workouts ORDER BY created_at DESC",
    );
    return workouts.map(convertWorkoutToBoolean);
  }

  static async getActiveWorkouts(): Promise<Workout[]> {
    const workouts = await getAllRows<Workout>(
      "SELECT * FROM workouts WHERE is_active = 1 ORDER BY created_at DESC",
    );
    return workouts.map(convertWorkoutToBoolean);
  }

  static async getWorkoutById(id: number): Promise<Workout | null> {
    const workout = await getFirstRow<Workout>(
      "SELECT * FROM workouts WHERE id = ?",
      [id],
    );
    return workout ? convertWorkoutToBoolean(workout) : null;
  }

  static async getTodaysWorkout(): Promise<Workout | null> {
    const workout = await getFirstRow<Workout>(
      "SELECT * FROM workouts WHERE day_of_week = ? AND is_active = 1",
      [new Date().toLocaleDateString("en-US", { weekday: "long" })],
    );
    return workout ? convertWorkoutToBoolean(workout) : null;
  }

  static async getNextWorkout(): Promise<Workout | undefined> {
    const today = DAYS_OF_WEEK[new Date().getDay()];

    // Get all active workouts
    const workouts = await this.getActiveWorkouts();
    if (!workouts.length) {
      return undefined;
    }

    const days = [...DAYS_OF_WEEK, ...DAYS_OF_WEEK];
    const workoutSchedule = workouts.reduce<Record<DayOfWeek, Workout>>(
      (acc, workout) => ({ ...acc, [workout.day_of_week!]: workout }),
      {} as Record<DayOfWeek, Workout>,
    );
    const workoutWeek = days.reduce<Record<DayOfWeek, Workout | undefined>>(
      (acc, day) => ({ ...acc, [day]: workoutSchedule[day] }),
      {} as Record<DayOfWeek, Workout | undefined>,
    );
    const todayIdx = days.indexOf(today);
    days.splice(todayIdx, 0, days[todayIdx]);

    const nextWorkoutDay = days.find((key) => workoutWeek[key]);
    return nextWorkoutDay ? workoutWeek[nextWorkoutDay] : undefined;
  }

  static async getWorkoutWithExercises(
    id: number,
  ): Promise<WorkoutWithExercises | null> {
    const workout = await this.getWorkoutById(id);
    if (!workout) return null;

    const exercises = await getAllRows<Exercise>(
      "SELECT * FROM exercises WHERE workout_id = ?",
      [id],
    );

    return { ...workout, exercises };
  }

  static async updateWorkout(
    id: number,
    updates: Partial<Workout>,
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
      `UPDATE workouts SET ${setParts.join(", ")} WHERE id = ?`,
      values,
    );
  }

  static async deleteWorkout(id: number): Promise<void> {
    await executeQuery("DELETE FROM workouts WHERE id = ?", [id]);
  }

  static async deprecateAllActiveWorkouts(): Promise<void> {
    await executeQuery(
      "UPDATE workouts SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE is_active = 1",
    );
  }

  static async getWorkoutsNeedingRenewal(): Promise<Workout[]> {
    const workouts = await getAllRows<Workout>(
      `SELECT * FROM workouts
       WHERE is_active = 1
       AND end_date IS NOT NULL
       AND date(end_date) <= date('now')
       ORDER BY end_date ASC`,
    );
    return workouts.map(convertWorkoutToBoolean);
  }
}
