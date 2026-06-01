import {
  executeQuery,
  getAllRows,
  getFirstRow,
  withTransaction,
} from "../database";
import {
  ActivePlanDay,
  RunTarget,
  RunType,
  TrainingPlan,
  TrainingPlanDay,
  TrainingPlanDayWithDetails,
  DayType,
} from "../types";

export interface CreatePlanDayInput {
  week_number: number;
  day_of_week: number;
  day_type: DayType;
  workout_id?: number;
  run_target?: {
    run_type: RunType;
    distance_km: number;
    pace_note?: string;
    duration_minutes?: number;
    notes?: string;
  };
}

export interface CreateTrainingPlanInput {
  name: string;
  goal_text: string;
  goal_date?: string;
  total_weeks: number;
  days: CreatePlanDayInput[];
}

export class TrainingPlanService {
  static async createPlan(input: CreateTrainingPlanInput): Promise<number> {
    return await withTransaction(async (db) => {
      // Deactivate any existing active plan
      await db.runAsync(
        "UPDATE training_plans SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE is_active = 1",
      );

      const planResult = await db.runAsync(
        `INSERT INTO training_plans (name, goal_text, goal_date, total_weeks, is_active)
         VALUES (?, ?, ?, ?, 1)`,
        [
          input.name,
          input.goal_text,
          input.goal_date ?? null,
          input.total_weeks,
        ],
      );
      const planId = planResult.lastInsertRowId as number;

      for (const day of input.days) {
        const dayResult = await db.runAsync(
          `INSERT INTO training_plan_days (plan_id, week_number, day_of_week, day_type, workout_id)
           VALUES (?, ?, ?, ?, ?)`,
          [
            planId,
            day.week_number,
            day.day_of_week,
            day.day_type,
            day.workout_id ?? null,
          ],
        );

        if (day.day_type === "run" && day.run_target) {
          const planDayId = dayResult.lastInsertRowId as number;
          await db.runAsync(
            `INSERT INTO run_targets (plan_day_id, run_type, distance_km, pace_note, duration_minutes, notes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              planDayId,
              day.run_target.run_type,
              day.run_target.distance_km,
              day.run_target.pace_note ?? null,
              day.run_target.duration_minutes ?? null,
              day.run_target.notes ?? null,
            ],
          );
        }
      }

      return planId;
    });
  }

  static async getActivePlan(): Promise<TrainingPlan | null> {
    return await getFirstRow<TrainingPlan>(
      "SELECT * FROM training_plans WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1",
    );
  }

  static async getAllPlans(): Promise<TrainingPlan[]> {
    return await getAllRows<TrainingPlan>(
      "SELECT * FROM training_plans ORDER BY created_at DESC",
    );
  }

  static async deletePlan(planId: number): Promise<void> {
    await executeQuery("DELETE FROM training_plans WHERE id = ?", [planId]);
  }

  static async deactivateAllPlans(): Promise<void> {
    await executeQuery(
      "UPDATE training_plans SET is_active = 0, updated_at = CURRENT_TIMESTAMP",
    );
  }

  static async getTodaysPlanDay(): Promise<ActivePlanDay | null> {
    const plan = await this.getActivePlan();
    if (!plan) return null;

    const planCreated = new Date(plan.created_at);
    planCreated.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysSinceStart = Math.floor(
      (today.getTime() - planCreated.getTime()) / (1000 * 60 * 60 * 24),
    );
    const currentWeek = Math.floor(daysSinceStart / 7) + 1;

    if (currentWeek > plan.total_weeks) return null;

    const todayDow = today.getDay();

    const day = await getFirstRow<TrainingPlanDay>(
      `SELECT * FROM training_plan_days
       WHERE plan_id = ? AND week_number = ? AND day_of_week = ?`,
      [plan.id, currentWeek, todayDow],
    );

    if (!day) return null;

    const dayWithDetails: TrainingPlanDayWithDetails = { ...day };

    if (day.day_type === "run") {
      const runTarget = await getFirstRow<RunTarget>(
        "SELECT * FROM run_targets WHERE plan_day_id = ?",
        [day.id],
      );
      if (runTarget) dayWithDetails.run_target = runTarget;
    }

    if (day.day_type === "gym" && day.workout_id) {
      const workout = await getFirstRow<{ title: string }>(
        "SELECT title FROM workouts WHERE id = ?",
        [day.workout_id],
      );
      if (workout) dayWithDetails.workout_title = workout.title;
    }

    return { plan, day: dayWithDetails };
  }

  static async getWeekDays(
    planId: number,
    weekNumber: number,
  ): Promise<TrainingPlanDayWithDetails[]> {
    const days = await getAllRows<TrainingPlanDay>(
      `SELECT * FROM training_plan_days
       WHERE plan_id = ? AND week_number = ?
       ORDER BY day_of_week`,
      [planId, weekNumber],
    );

    const result: TrainingPlanDayWithDetails[] = [];
    for (const day of days) {
      const dayWithDetails: TrainingPlanDayWithDetails = { ...day };
      if (day.day_type === "run") {
        const runTarget = await getFirstRow<RunTarget>(
          "SELECT * FROM run_targets WHERE plan_day_id = ?",
          [day.id],
        );
        if (runTarget) dayWithDetails.run_target = runTarget;
      }
      result.push(dayWithDetails);
    }
    return result;
  }
}
