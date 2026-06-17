import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import SchedulePreview from "../SchedulePreview";
import { SessionService } from "@/database/services/sessionService";
import { WorkoutScheduleService } from "@/database/services/workoutScheduleService";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
  TouchableOpacity: ({ children, onPress }: any) => (
    <button onClick={onPress}>{children}</button>
  ),
  View: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children }: any) => <span>{children}</span>,
}));
jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => <i /> }));

jest.mock("@/database/services/sessionService");
jest.mock("@/database/services/workoutScheduleService");

describe("SchedulePreview", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders today's scheduled workout from the workout_schedules source", async () => {
    const todayIndex = new Date().getDay();

    (WorkoutScheduleService.getWeeklySchedule as jest.Mock).mockResolvedValue({
      [todayIndex]: {
        id: 1,
        title: "Push Day",
        is_active: true,
        exercises: [],
      },
    });
    (SessionService.getSessionsByWorkoutId as jest.Mock).mockResolvedValue([]);

    render(<SchedulePreview />);

    await waitFor(() => expect(screen.getByText("Push Day")).toBeDefined());
    expect(screen.getByText("Today")).toBeDefined();
  });
});
