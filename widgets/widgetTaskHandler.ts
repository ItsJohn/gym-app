import type { WidgetTaskHandler } from "react-native-android-widget";
import { initializeDatabase } from "@/database/database";
import { TrainingPlanService } from "@/database/services/trainingPlanService";
import { WorkoutScheduleService } from "@/database/services/workoutScheduleService";
import type { WidgetDayType, WorkoutDayWidgetProps } from "./WorkoutDayWidget";
import { WorkoutDayWidget } from "./WorkoutDayWidget";

async function getTodayWidgetData(): Promise<WorkoutDayWidgetProps> {
  await initializeDatabase();

  // Check for active training plan first
  const planDay = await TrainingPlanService.getTodaysPlanDay();

  if (planDay) {
    const { day } = planDay;

    if (day.day_type === "run" && day.run_target) {
      const { run_target } = day;
      const runTypeLabel =
        run_target.run_type.charAt(0).toUpperCase() +
        run_target.run_type.slice(1);
      return {
        dayType: "run",
        title: `${runTypeLabel} Run`,
        detail: `${run_target.distance_km.toFixed(1)} km${run_target.pace_note ? ` • ${run_target.pace_note}` : ""}`,
      };
    }

    if (day.day_type === "gym") {
      return {
        dayType: "gym",
        title: day.workout_title ?? "Strength Training",
        detail: "",
      };
    }

    return {
      dayType: "rest",
      title: "Recovery Day",
      detail: "Take it easy today",
    };
  }

  // Fall back to workout schedule
  const workout = await WorkoutScheduleService.getTodaysWorkout();

  if (workout) {
    const exerciseCount = workout.exercises?.length ?? 0;
    return {
      dayType: "gym",
      title: workout.title,
      detail: exerciseCount > 0 ? `${exerciseCount} exercises` : "",
    };
  }

  return {
    dayType: "rest",
    title: "Rest Day",
    detail: "No workout scheduled",
  };
}

export const widgetTaskHandler: WidgetTaskHandler = async ({
  widgetAction,
  renderWidget,
}) => {
  if (widgetAction === "WIDGET_DELETED") return;

  try {
    const data = await getTodayWidgetData();
    renderWidget(WorkoutDayWidget(data));
  } catch (error) {
    renderWidget(
      WorkoutDayWidget({
        dayType: "rest" as WidgetDayType,
        title: "Open app to sync",
        detail: "",
      }),
    );
  }
};
