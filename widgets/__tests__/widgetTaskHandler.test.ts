import { widgetTaskHandler } from "../widgetTaskHandler";

jest.mock("@/database/database", () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/database/services/workoutScheduleService", () => ({
  WorkoutScheduleService: {
    getTodaysWorkout: jest.fn(),
  },
}));

jest.mock("react-native-android-widget", () => ({}));

import { WorkoutScheduleService } from "@/database/services/workoutScheduleService";

describe("widgetTaskHandler", () => {
  const mockRenderWidget = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (WorkoutScheduleService.getTodaysWorkout as jest.Mock).mockResolvedValue(
      null,
    );
  });

  it("renders rest day when no training plan and no schedule", async () => {
    await widgetTaskHandler({
      widgetAction: "WIDGET_UPDATE",
      widgetInfo: {
        widgetName: "WorkoutDayWidget",
        widgetId: 1,
        height: 110,
        width: 180,
        screenInfo: {
          screenHeightDp: 800,
          screenWidthDp: 400,
          density: 2,
          densityDpi: 320,
        },
      },
      renderWidget: mockRenderWidget,
    });

    expect(mockRenderWidget).toHaveBeenCalledTimes(1);
    const call = mockRenderWidget.mock.calls[0][0];
    expect(call).toHaveProperty("dark");
    expect(call).toHaveProperty("light");
  });

  it("renders gym day from workout schedule when no training plan", async () => {
    (WorkoutScheduleService.getTodaysWorkout as jest.Mock).mockResolvedValue({
      id: 1,
      title: "Upper Body",
      exercises: [{ id: "e1" }, { id: "e2" }],
    });

    await widgetTaskHandler({
      widgetAction: "WIDGET_UPDATE",
      widgetInfo: {
        widgetName: "WorkoutDayWidget",
        widgetId: 1,
        height: 110,
        width: 180,
        screenInfo: {
          screenHeightDp: 800,
          screenWidthDp: 400,
          density: 2,
          densityDpi: 320,
        },
      },
      renderWidget: mockRenderWidget,
    });

    expect(mockRenderWidget).toHaveBeenCalledTimes(1);
  });

  it("skips render for WIDGET_DELETED action", async () => {
    await widgetTaskHandler({
      widgetAction: "WIDGET_DELETED",
      widgetInfo: {
        widgetName: "WorkoutDayWidget",
        widgetId: 1,
        height: 110,
        width: 180,
        screenInfo: {
          screenHeightDp: 800,
          screenWidthDp: 400,
          density: 2,
          densityDpi: 320,
        },
      },
      renderWidget: mockRenderWidget,
    });

    expect(mockRenderWidget).not.toHaveBeenCalled();
  });
});
