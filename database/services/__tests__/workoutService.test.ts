import { executeQuery, getAllRows, getFirstRow } from "../../database";
import { WorkoutService } from "../workoutService";

jest.mock("../../../database/database", () => ({
  executeQuery: jest.fn(),
  getAllRows: jest.fn(),
  getFirstRow: jest.fn(),
}));

const mockExecuteQuery = executeQuery as jest.MockedFunction<
  typeof executeQuery
>;
const mockGetAllRows = getAllRows as jest.MockedFunction<typeof getAllRows>;
const mockGetFirstRow = getFirstRow as jest.MockedFunction<typeof getFirstRow>;

const mockWorkout = {
  id: 1,
  title: "Push Day",
  description: "Upper body push workout",
  end_date: "2025-03-01T00:00:00.000Z",
  day_of_week: "Monday",
  expected_duration: 60,
  suggested_playlist: "Rock Workout Mix",
  is_active: 1,
  exercises: [],
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

describe("WorkoutService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createWorkout", () => {
    it("should insert a workout and return the ID", async () => {
      mockExecuteQuery.mockResolvedValue({ lastInsertRowId: 42 } as any);

      const result = await WorkoutService.createWorkout({
        title: "Push Day",
        description: "Upper body",
        end_date: "2025-03-01",
        day_of_week: "Monday",
        expected_duration: 60,
        suggested_playlist: "Rock",
        exercises: [],
      } as any);

      expect(result).toBe(42);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO workouts"),
        expect.arrayContaining(["Push Day", "Upper body"]),
      );
    });
  });

  describe("getAllWorkouts", () => {
    it("should return all workouts with boolean is_active", async () => {
      mockGetAllRows.mockResolvedValue([
        { ...mockWorkout, is_active: 1 },
        { ...mockWorkout, id: 2, title: "Pull Day", is_active: 0 },
      ]);

      const result = await WorkoutService.getAllWorkouts();

      expect(result).toHaveLength(2);
      expect(result[0].is_active).toBe(true);
      expect(result[1].is_active).toBe(false);
      expect(mockGetAllRows).toHaveBeenCalledWith(
        "SELECT * FROM workouts ORDER BY created_at DESC",
      );
    });

    it("should return empty array when no workouts exist", async () => {
      mockGetAllRows.mockResolvedValue([]);

      const result = await WorkoutService.getAllWorkouts();

      expect(result).toEqual([]);
    });
  });

  describe("getActiveWorkouts", () => {
    it("should return only active workouts", async () => {
      mockGetAllRows.mockResolvedValue([{ ...mockWorkout, is_active: 1 }]);

      const result = await WorkoutService.getActiveWorkouts();

      expect(result).toHaveLength(1);
      expect(result[0].is_active).toBe(true);
      expect(mockGetAllRows).toHaveBeenCalledWith(
        "SELECT * FROM workouts WHERE is_active = 1 ORDER BY created_at DESC",
      );
    });
  });

  describe("getWorkoutById", () => {
    it("should return workout with boolean is_active", async () => {
      mockGetFirstRow.mockResolvedValue({ ...mockWorkout, is_active: 1 });

      const result = await WorkoutService.getWorkoutById(1);

      expect(result).not.toBeNull();
      expect(result!.is_active).toBe(true);
      expect(mockGetFirstRow).toHaveBeenCalledWith(
        "SELECT * FROM workouts WHERE id = ?",
        [1],
      );
    });

    it("should return null when workout not found", async () => {
      mockGetFirstRow.mockResolvedValue(null);

      const result = await WorkoutService.getWorkoutById(999);

      expect(result).toBeNull();
    });
  });

  describe("getWorkoutWithExercises", () => {
    it("should return workout with its exercises", async () => {
      mockGetFirstRow.mockResolvedValue({ ...mockWorkout, is_active: 1 });
      mockGetAllRows.mockResolvedValue([
        { id: "ex1", name: "Bench Press", workout_id: 1 },
      ]);

      const result = await WorkoutService.getWorkoutWithExercises(1);

      expect(result).not.toBeNull();
      expect(result!.exercises).toHaveLength(1);
      expect(result!.exercises[0].name).toBe("Bench Press");
    });

    it("should return null when workout not found", async () => {
      mockGetFirstRow.mockResolvedValue(null);

      const result = await WorkoutService.getWorkoutWithExercises(999);

      expect(result).toBeNull();
    });
  });

  describe("updateWorkout", () => {
    it("should update specified fields", async () => {
      await WorkoutService.updateWorkout(1, { title: "New Title" });

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE workouts SET"),
        expect.arrayContaining(["New Title", 1]),
      );
    });

    it("should not execute query when updates are empty", async () => {
      await WorkoutService.updateWorkout(1, {});

      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });
  });

  describe("deleteWorkout", () => {
    it("should delete workout by ID", async () => {
      await WorkoutService.deleteWorkout(1);

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        "DELETE FROM workouts WHERE id = ?",
        [1],
      );
    });
  });

  describe("deprecateAllActiveWorkouts", () => {
    it("should set all active workouts to inactive", async () => {
      await WorkoutService.deprecateAllActiveWorkouts();

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        "UPDATE workouts SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE is_active = 1",
      );
    });
  });

  describe("getWorkoutsNeedingRenewal", () => {
    it("should return expired active workouts", async () => {
      mockGetAllRows.mockResolvedValue([{ ...mockWorkout, is_active: 1 }]);

      const result = await WorkoutService.getWorkoutsNeedingRenewal();

      expect(result).toHaveLength(1);
      expect(result[0].is_active).toBe(true);
      expect(mockGetAllRows).toHaveBeenCalledWith(
        expect.stringContaining("date(end_date) <= date('now')"),
      );
    });
  });

  describe("getLatestActiveWorkout", () => {
    it("should return the most recent active workout", async () => {
      mockGetFirstRow.mockResolvedValue({ ...mockWorkout, is_active: 1 });

      const result = await WorkoutService.getLatestActiveWorkout();

      expect(result).not.toBeNull();
      expect(result!.is_active).toBe(true);
      expect(mockGetFirstRow).toHaveBeenCalledWith(
        expect.stringContaining("WHERE is_active = 1"),
      );
    });

    it("should return null when no active workouts exist", async () => {
      mockGetFirstRow.mockResolvedValue(null);

      const result = await WorkoutService.getLatestActiveWorkout();

      expect(result).toBeNull();
    });
  });
});
