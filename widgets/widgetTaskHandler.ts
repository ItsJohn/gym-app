import type { WidgetTaskHandler } from "react-native-android-widget";
import { initializeDatabase } from "@/database/database";
import { WorkoutScheduleService } from "@/database/services/workoutScheduleService";
import type { WidgetDayType, WorkoutDayWidgetProps } from "./WorkoutDayWidget";
import { WorkoutDayWidget } from "./WorkoutDayWidget";

async function getTodayWidgetData(): Promise<WorkoutDayWidgetProps> {
  await initializeDatabase();

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
