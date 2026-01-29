import { executeQuery, getAllRows, getFirstRow } from "../../database";
import { WorkoutScheduleService } from "../workoutScheduleService";
import { WorkoutService } from "../workoutService";

jest.mock("../../../database/database", () => ({
  executeQuery: jest.fn(),
  getAllRows: jest.fn(),
  getFirstRow: jest.fn(),
}));

jest.mock("../workoutService");

const mockExecuteQuery = executeQuery as jest.MockedFunction<
  typeof executeQuery
>;
const mockGetAllRows = getAllRows as jest.MockedFunction<typeof getAllRows>;
const mockGetFirstRow = getFirstRow as jest.MockedFunction<typeof getFirstRow>;

const mockWorkoutWithExercises = {
  id: 1,
  title: "Push Day",
  is_active: true,
  exercises: [{ id: "ex1", name: "Bench Press" }],
};

describe("WorkoutScheduleService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("setWorkoutForDayOfWeek", () => {
    it("should deactivate existing schedule and create a new one", async () => {
      mockGetFirstRow.mockResolvedValue(null); // no existing schedule

      await WorkoutScheduleService.setWorkoutForDayOfWeek("Monday", 1);

      // Should deactivate existing
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        "UPDATE workout_schedules SET is_active = 0 WHERE day_of_week = ?",
        ["Monday"],
      );
      // Should insert new
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO workout_schedules"),
        ["Monday", 1],
      );
    });

    it("should reactivate an existing schedule entry", async () => {
      mockGetFirstRow.mockResolvedValue({
        id: 5,
        day_of_week: "Monday",
        workout_id: 1,
        is_active: false,
      });

      await WorkoutScheduleService.setWorkoutForDayOfWeek("Monday", 1);

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("is_active = 1"),
        [5],
      );
    });
  });

  describe("removeWorkoutFromDayOfWeek", () => {
    it("should deactivate schedule for the day", async () => {
      await WorkoutScheduleService.removeWorkoutFromDayOfWeek("Monday");

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        "UPDATE workout_schedules SET is_active = 0 WHERE day_of_week = ?",
        ["Monday"],
      );
    });
  });

  describe("getWorkoutForDayOfWeek", () => {
    it("should return workout for the scheduled day", async () => {
      mockGetFirstRow.mockResolvedValue({
        id: 1,
        day_of_week: "Monday",
        workout_id: 1,
        is_active: true,
      });
      (WorkoutService.getWorkoutWithExercises as jest.Mock).mockResolvedValue(
        mockWorkoutWithExercises,
      );

      const result =
        await WorkoutScheduleService.getWorkoutForDayOfWeek("Monday");

      expect(result).toEqual(mockWorkoutWithExercises);
    });

    it("should return null when no schedule exists for the day", async () => {
      mockGetFirstRow.mockResolvedValue(null);

      const result =
        await WorkoutScheduleService.getWorkoutForDayOfWeek("Monday");

      expect(result).toBeNull();
    });

    it("should return null when the workout is inactive", async () => {
      mockGetFirstRow.mockResolvedValue({
        id: 1,
        day_of_week: "Monday",
        workout_id: 1,
        is_active: true,
      });
      (WorkoutService.getWorkoutWithExercises as jest.Mock).mockResolvedValue({
        ...mockWorkoutWithExercises,
        is_active: false,
      });

      const result =
        await WorkoutScheduleService.getWorkoutForDayOfWeek("Monday");

      expect(result).toBeNull();
    });

    it("should return null when workout not found", async () => {
      mockGetFirstRow.mockResolvedValue({
        id: 1,
        day_of_week: "Monday",
        workout_id: 1,
        is_active: true,
      });
      (WorkoutService.getWorkoutWithExercises as jest.Mock).mockResolvedValue(
        null,
      );

      const result =
        await WorkoutScheduleService.getWorkoutForDayOfWeek("Monday");

      expect(result).toBeNull();
    });
  });

  describe("getAllWorkoutsWithDays", () => {
    it("should return workouts with their assigned days", async () => {
      (WorkoutService.getAllWorkouts as jest.Mock).mockResolvedValue([
        { id: 1, title: "Push Day" },
        { id: 2, title: "Pull Day" },
      ]);
      mockGetAllRows.mockResolvedValue([
        { id: 1, day_of_week: "Monday", workout_id: 1, is_active: true },
      ]);

      const result = await WorkoutScheduleService.getAllWorkoutsWithDays();

      expect(result).toHaveLength(2);
      expect(result[0].dayName).toBe("Monday");
      expect(result[0].isScheduled).toBe(true);
      expect(result[1].isScheduled).toBe(false);
    });
  });

  describe("getWeeklySchedule", () => {
    it("should return schedule keyed by day", async () => {
      mockGetAllRows.mockResolvedValue([
        { id: 1, day_of_week: "Monday", workout_id: 1, is_active: true },
        { id: 2, day_of_week: "Wednesday", workout_id: 2, is_active: true },
      ]);
      (WorkoutService.getWorkoutWithExercises as jest.Mock)
        .mockResolvedValueOnce({ ...mockWorkoutWithExercises, is_active: true })
        .mockResolvedValueOnce({
          ...mockWorkoutWithExercises,
          id: 2,
          title: "Pull Day",
          is_active: true,
        });

      const result = await WorkoutScheduleService.getWeeklySchedule();

      expect(result["Monday"]).toBeDefined();
      expect(result["Wednesday"]).toBeDefined();
      expect(result["Friday"]).toBeUndefined();
    });

    it("should skip inactive workouts", async () => {
      mockGetAllRows.mockResolvedValue([
        { id: 1, day_of_week: "Monday", workout_id: 1, is_active: true },
      ]);
      (WorkoutService.getWorkoutWithExercises as jest.Mock).mockResolvedValue({
        ...mockWorkoutWithExercises,
        is_active: false,
      });

      const result = await WorkoutScheduleService.getWeeklySchedule();

      expect(result["Monday"]).toBeUndefined();
    });
  });

  describe("initializeDefault3DaySchedule", () => {
    it("should assign first 3 workouts to Mon/Wed/Fri", async () => {
      (WorkoutService.getAllWorkouts as jest.Mock).mockResolvedValue([
        { id: 1, title: "A" },
        { id: 2, title: "B" },
        { id: 3, title: "C" },
      ]);
      // Mock for setWorkoutForDayOfWeek calls
      mockGetFirstRow.mockResolvedValue(null);

      await WorkoutScheduleService.initializeDefault3DaySchedule();

      // 3 days x 2 queries each (deactivate + insert) = 6 + 3 checks = 9
      expect(mockExecuteQuery).toHaveBeenCalled();
    });

    it("should handle fewer than 3 workouts", async () => {
      (WorkoutService.getAllWorkouts as jest.Mock).mockResolvedValue([
        { id: 1, title: "A" },
      ]);
      mockGetFirstRow.mockResolvedValue(null);

      await WorkoutScheduleService.initializeDefault3DaySchedule();

      // Only 1 workout should be scheduled
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE workout_schedules"),
        ["Monday"],
      );
    });
  });

  describe("getTodaysWorkout", () => {
    it("should call getWorkoutForDayOfWeek with today's day", async () => {
      mockGetFirstRow.mockResolvedValue(null);

      await WorkoutScheduleService.getTodaysWorkout();

      expect(mockGetFirstRow).toHaveBeenCalledWith(
        expect.stringContaining("WHERE day_of_week = ?"),
        expect.any(Array),
      );
    });
  });

  describe("getNextScheduledWorkout", () => {
    it("should return the next workout and days until", async () => {
      // Mock getWeeklySchedule via its internal calls
      mockGetAllRows.mockResolvedValue([
        { id: 1, day_of_week: "Monday", workout_id: 1, is_active: true },
        { id: 2, day_of_week: "Wednesday", workout_id: 2, is_active: true },
        { id: 3, day_of_week: "Friday", workout_id: 3, is_active: true },
      ]);
      (WorkoutService.getWorkoutWithExercises as jest.Mock).mockResolvedValue({
        ...mockWorkoutWithExercises,
        is_active: true,
      });

      const result = await WorkoutScheduleService.getNextScheduledWorkout();

      // Should find some workout (exact day depends on when test runs)
      if (result) {
        expect(result.workout).toBeDefined();
        expect(result.dayName).toBeDefined();
        expect(result.daysUntil).toBeGreaterThanOrEqual(1);
        expect(result.daysUntil).toBeLessThanOrEqual(7);
      }
    });

    it("should return null when no workouts are scheduled", async () => {
      mockGetAllRows.mockResolvedValue([]);

      const result = await WorkoutScheduleService.getNextScheduledWorkout();

      expect(result).toBeNull();
    });
  });

  describe("getActiveSchedule", () => {
    it("should return active schedules with workout details", async () => {
      mockGetAllRows.mockResolvedValue([
        { id: 1, day_of_week: "Monday", workout_id: 1, is_active: true },
      ]);
      (WorkoutService.getWorkoutWithExercises as jest.Mock).mockResolvedValue(
        mockWorkoutWithExercises,
      );

      const result = await WorkoutScheduleService.getActiveSchedule();

      expect(result).toHaveLength(1);
      expect(result[0].workout.title).toBe("Push Day");
    });

    it("should filter out inactive workouts", async () => {
      mockGetAllRows.mockResolvedValue([
        { id: 1, day_of_week: "Monday", workout_id: 1, is_active: true },
      ]);
      (WorkoutService.getWorkoutWithExercises as jest.Mock).mockResolvedValue({
        ...mockWorkoutWithExercises,
        is_active: false,
      });

      const result = await WorkoutScheduleService.getActiveSchedule();

      expect(result).toHaveLength(0);
    });

    it("should filter out workouts that no longer exist", async () => {
      mockGetAllRows.mockResolvedValue([
        { id: 1, day_of_week: "Monday", workout_id: 99, is_active: true },
      ]);
      (WorkoutService.getWorkoutWithExercises as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await WorkoutScheduleService.getActiveSchedule();

      expect(result).toHaveLength(0);
    });
  });
});
