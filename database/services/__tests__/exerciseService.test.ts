import { executeQuery, getAllRows, getFirstRow } from "../../database";
import { ExerciseService } from "../exerciseService";
import { UpdateExercise } from "../../types";
import { Exercise } from "../../../validation/schemas";

// Mock the database module
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

describe("ExerciseService", () => {
  describe("createExercise", () => {
    it("should create an exercise with provided ID", async () => {
      const exercise: Exercise = {
        id: "test-id-123",
        name: "Push-ups",
        type: "reps",
        target: { reps: "10", sets: "3" },
        muscle_group: "chest",
        difficulty: "beginner",
        rest_seconds: 60,
        notes: "Keep proper form",
        video_url: "https://example.com/video",
        workout_id: 1,
      };

      await ExerciseService.createExercise(exercise);

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO exercises"),
        expect.arrayContaining([
          "test-id-123",
          "Push-ups",
          "reps",
          JSON.stringify({ reps: "10", sets: "3" }),
          "chest",
          "beginner",
          60,
          "Keep proper form",
          "https://example.com/video",
          1,
        ]),
      );
    });

    it("should generate UUID when no ID is provided", async () => {
      const exercise: Exercise = {
        name: "Squats",
        type: "reps",
        target: { reps: "15", sets: "4" },
        muscle_group: "legs",
        difficulty: "intermediate",
        workout_id: 1,
      };

      await ExerciseService.createExercise(exercise);

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO exercises"),
        expect.arrayContaining([
          expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
          "Squats",
          "reps",
          JSON.stringify({ reps: "15", sets: "4" }),
          "legs",
          "intermediate",
          undefined,
          undefined,
          undefined,
          1,
        ]),
      );
    });

    it("should handle database errors", async () => {
      const exercise: Exercise = {
        name: "Test Exercise",
        type: "reps",
        target: { reps: "10" },
        muscle_group: "arms",
        difficulty: "beginner",
        workout_id: 1,
      };

      mockExecuteQuery.mockRejectedValueOnce(new Error("Database error"));

      await expect(ExerciseService.createExercise(exercise)).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("getExercisesByWorkoutId", () => {
    it("should return exercises for a workout", async () => {
      const mockExercises = [
        {
          id: "ex1",
          name: "Push-ups",
          type: "reps",
          target: JSON.stringify({ reps: "10", sets: "3" }),
          muscle_group: "chest",
          difficulty: "beginner",
          rest_seconds: 60,
          notes: "Keep proper form",
          video_url: "https://example.com/video",
          workout_id: 1,
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
        },
      ];

      mockGetAllRows.mockResolvedValue(mockExercises);

      const result = await ExerciseService.getExercisesByWorkoutId(1);

      expect(mockGetAllRows).toHaveBeenCalledWith(
        "SELECT * FROM exercises WHERE workout_id = ?",
        [1],
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "ex1",
        name: "Push-ups",
        type: "reps",
        target: { reps: "10", sets: "3" },
        muscle_group: "chest",
        difficulty: "beginner",
        rest_seconds: 60,
        notes: "Keep proper form",
        video_url: "https://example.com/video",
        workout_id: 1,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      });
    });

    it("should handle exercises with null target", async () => {
      const mockExercises = [
        {
          id: "ex1",
          name: "Stretching",
          type: "duration",
          target: null,
          muscle_group: "full-body",
          difficulty: "beginner",
          workout_id: 1,
        },
      ];

      mockGetAllRows.mockResolvedValue(mockExercises);

      const result = await ExerciseService.getExercisesByWorkoutId(1);

      expect(result[0].target).toBeUndefined();
    });

    it("should return empty array when no exercises found", async () => {
      mockGetAllRows.mockResolvedValue([]);

      const result = await ExerciseService.getExercisesByWorkoutId(999);

      expect(result).toEqual([]);
    });
  });

  describe("getExerciseById", () => {
    it("should return exercise by ID", async () => {
      const mockExercise = {
        id: "ex1",
        name: "Push-ups",
        type: "reps",
        target: JSON.stringify({ reps: "10", sets: "3" }),
        muscle_group: "chest",
        difficulty: "beginner",
        rest_seconds: 60,
        notes: "Keep proper form",
        video_url: "https://example.com/video",
        workout_id: 1,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      };

      mockGetFirstRow.mockResolvedValue(mockExercise);

      const result = await ExerciseService.getExerciseById("ex1");

      expect(mockGetFirstRow).toHaveBeenCalledWith(
        "SELECT * FROM exercises WHERE id = ?",
        ["ex1"],
      );

      expect(result).toEqual({
        id: "ex1",
        name: "Push-ups",
        type: "reps",
        target: { reps: "10", sets: "3" },
        muscle_group: "chest",
        difficulty: "beginner",
        rest_seconds: 60,
        notes: "Keep proper form",
        video_url: "https://example.com/video",
        workout_id: 1,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      });
    });

    it("should return null when exercise not found", async () => {
      mockGetFirstRow.mockResolvedValue(null);

      const result = await ExerciseService.getExerciseById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("updateExercise", () => {
    it("should update exercise with provided fields", async () => {
      const updates: UpdateExercise = {
        name: "Modified Push-ups",
        rest_seconds: 90,
      };

      await ExerciseService.updateExercise("ex1", updates);

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE exercises SET"),
        expect.arrayContaining(["Modified Push-ups", 90, "ex1"]),
      );
    });

    it("should handle empty updates object", async () => {
      const updates: UpdateExercise = {};

      await ExerciseService.updateExercise("ex1", updates);

      // When updates object is empty, no query should be executed
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      const updates: UpdateExercise = {
        name: "Test Exercise",
      };

      const error = new Error("Update failed");
      mockExecuteQuery.mockRejectedValue(error);

      await expect(
        ExerciseService.updateExercise("ex1", updates),
      ).rejects.toThrow("Update failed");
    });
  });

  describe("deleteExercise", () => {
    it("should delete exercise by ID", async () => {
      mockExecuteQuery.mockResolvedValue({} as any);

      await ExerciseService.deleteExercise("ex1");

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        "DELETE FROM exercises WHERE id = ?",
        ["ex1"],
      );
    });

    it("should handle database errors", async () => {
      const error = new Error("Delete failed");
      mockExecuteQuery.mockRejectedValue(error);

      await expect(ExerciseService.deleteExercise("ex1")).rejects.toThrow(
        "Delete failed",
      );
    });
  });
});
