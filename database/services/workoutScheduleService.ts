import { executeQuery, getAllRows, getFirstRow } from "../database";
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  WorkoutWithDay,
  WorkoutWithExercises,
} from "../types";
import { WorkoutService } from "./workoutService";

export interface WorkoutSchedule {
  id: number;
  day_of_week: DayOfWeek;
  workout_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkoutSchedule {
  day_of_week: DayOfWeek;
  workout_id: number;
  is_active?: boolean;
}

export interface WorkoutScheduleWithWorkout extends WorkoutSchedule {
  workout: WorkoutWithExercises;
}

export class WorkoutScheduleService {
  // Set workout for a specific day of the week
  static async setWorkoutForDayOfWeek(
    dayOfWeek: DayOfWeek,
    workoutId: number,
  ): Promise<void> {
    // First, remove any existing schedule for this day of week
    await executeQuery(
      "UPDATE workout_schedules SET is_active = 0 WHERE day_of_week = ?",
      [dayOfWeek],
    );

    // Check if a schedule already exists for this day and workout
    const existing = await getFirstRow<WorkoutSchedule>(
      "SELECT * FROM workout_schedules WHERE day_of_week = ? AND workout_id = ?",
      [dayOfWeek, workoutId],
    );

    if (existing) {
      // Reactivate existing schedule
      await executeQuery(
        "UPDATE workout_schedules SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [existing.id],
      );
    } else {
      // Create new schedule
      await executeQuery(
        `INSERT INTO workout_schedules (day_of_week, workout_id, is_active)
         VALUES (?, ?, 1)`,
        [dayOfWeek, workoutId],
      );
    }
  }

  // Remove workout from a specific day of the week
  static async removeWorkoutFromDayOfWeek(dayOfWeek: DayOfWeek): Promise<void> {
    await executeQuery(
      "UPDATE workout_schedules SET is_active = 0 WHERE day_of_week = ?",
      [dayOfWeek],
    );
  }

  // Get workout assigned to a specific day of the week
  static async getWorkoutForDayOfWeek(
    dayOfWeek: DayOfWeek,
  ): Promise<WorkoutWithExercises | null> {
    const schedule = await getFirstRow<WorkoutSchedule>(
      "SELECT * FROM workout_schedules WHERE day_of_week = ? AND is_active = 1",
      [dayOfWeek],
    );

    if (!schedule) return null;

    const workout = await WorkoutService.getWorkoutWithExercises(
      schedule.workout_id,
    );

    // Only return the workout if it's active
    if (!workout || !workout.is_active) return null;

    return workout;
  }

  // Get all workouts with their assigned days
  static async getAllWorkoutsWithDays(): Promise<WorkoutWithDay[]> {
    const workouts = await WorkoutService.getAllWorkouts();
    const schedules = await getAllRows<WorkoutSchedule>(
      "SELECT * FROM workout_schedules WHERE is_active = 1",
    );

    return workouts.map((workout) => {
      const schedule = schedules.find((s) => s.workout_id === workout.id);
      return {
        ...workout,
        dayOfWeek: schedule?.day_of_week,
        dayName: schedule?.day_of_week,
        isScheduled: !!schedule,
      };
    });
  }

  // Get weekly schedule (all days with assigned workouts)
  static async getWeeklySchedule(): Promise<{
    [key in DayOfWeek]?: WorkoutWithExercises;
  }> {
    const schedules = await getAllRows<WorkoutSchedule>(
      "SELECT * FROM workout_schedules WHERE is_active = 1",
    );

    const weeklySchedule: { [key in DayOfWeek]?: WorkoutWithExercises } = {};

    for (const schedule of schedules) {
      const workout = await WorkoutService.getWorkoutWithExercises(
        schedule.workout_id,
      );
      // Only include workouts that exist and are active
      if (workout && workout.is_active) {
        weeklySchedule[schedule.day_of_week] = workout;
      }
    }

    return weeklySchedule;
  }

  // Convert a stored day name ("Monday") to a 0-6 index, or null if invalid
  static dayNameToIndex(dayName?: string | null): number | null {
    if (!dayName) return null;
    const index = DAYS_OF_WEEK.findIndex(
      (d) => d.toLowerCase() === dayName.trim().toLowerCase(),
    );
    return index === -1 ? null : index;
  }

  // Mirror a workout's day_of_week name into the workout_schedules table.
  // Clears any prior day for this workout first so a workout maps to one day
  // (or none, when the name is missing/invalid — i.e. a rest day).
  static async syncWorkoutDay(
    workoutId: number,
    dayName?: string | null,
  ): Promise<void> {
    await executeQuery(
      "UPDATE workout_schedules SET is_active = 0 WHERE workout_id = ?",
      [workoutId],
    );
    const index = this.dayNameToIndex(dayName);
    if (index === null) return;
    await this.setWorkoutForDayOfWeek(index as unknown as DayOfWeek, workoutId);
  }

  // Backfill workout_schedules from active workouts' day_of_week names.
  // Skips days already assigned so manual scheduling is never clobbered.
  static async backfillFromWorkoutDays(): Promise<void> {
    const workouts = await WorkoutService.getActiveWorkouts();
    const existing = await getAllRows<{ day_of_week: number }>(
      "SELECT day_of_week FROM workout_schedules WHERE is_active = 1",
    );
    const taken = new Set(existing.map((e) => Number(e.day_of_week)));

    for (const workout of workouts) {
      const index = this.dayNameToIndex(workout.day_of_week);
      if (index === null || taken.has(index) || workout.id == null) {
        continue;
      }
      await this.setWorkoutForDayOfWeek(
        index as unknown as DayOfWeek,
        workout.id,
      );
      taken.add(index);
    }
  }

  static async initializeDefault3DaySchedule(): Promise<void> {
    const workouts = await WorkoutService.getAllWorkouts();

    const defaultDays = [1, 3, 5] as unknown as DayOfWeek[];

    for (let i = 0; i < Math.min(3, workouts.length); i++) {
      const workoutId = workouts[i]?.id;
      if (workoutId !== undefined) {
        await this.setWorkoutForDayOfWeek(defaultDays[i], workoutId!);
      }
    }
  }

  // Get today's workout
  static async getTodaysWorkout(): Promise<WorkoutWithExercises | null> {
    const todayIndex = new Date().getDay() as unknown as DayOfWeek;
    return await this.getWorkoutForDayOfWeek(todayIndex);
  }

  // Get next scheduled workout
  static async getNextScheduledWorkout(): Promise<{
    workout: WorkoutWithExercises;
    dayName: string;
    daysUntil: number;
  } | null> {
    const weeklySchedule = await this.getWeeklySchedule();
    const todayIndex = new Date().getDay();

    // Look for the next scheduled day starting from tomorrow
    for (let i = 1; i <= 7; i++) {
      const checkDayIndex = ((todayIndex + i) % 7) as unknown as DayOfWeek;
      const workout = weeklySchedule[checkDayIndex];

      if (workout) {
        return {
          workout,
          dayName: DAYS_OF_WEEK[checkDayIndex as unknown as number],
          daysUntil: i,
        };
      }
    }

    return null;
  }

  // Get active schedule
  static async getActiveSchedule(): Promise<WorkoutScheduleWithWorkout[]> {
    const schedules = await getAllRows<WorkoutSchedule>(
      "SELECT * FROM workout_schedules WHERE is_active = 1 ORDER BY day_of_week",
    );

    const schedulesWithWorkouts: WorkoutScheduleWithWorkout[] = [];

    for (const schedule of schedules) {
      const workout = await WorkoutService.getWorkoutWithExercises(
        schedule.workout_id,
      );
      // Only include workouts that exist and are active
      if (workout && workout.is_active) {
        schedulesWithWorkouts.push({
          ...schedule,
          workout,
        });
      }
    }

    return schedulesWithWorkouts;
  }
}
