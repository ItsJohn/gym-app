import { executeQuery, getAllRows, getFirstRow } from "../../database";
import { SessionService } from "../sessionService";

jest.mock("../../database", () => ({
  executeQuery: jest.fn(),
  getAllRows: jest.fn(),
  getFirstRow: jest.fn(),
  resetDatabase: jest.fn(),
}));

const mockExecuteQuery = executeQuery as jest.MockedFunction<
  typeof executeQuery
>;
const mockGetAllRows = getAllRows as jest.MockedFunction<typeof getAllRows>;
const mockGetFirstRow = getFirstRow as jest.MockedFunction<typeof getFirstRow>;

const mockSession = {
  id: 1,
  workout_id: 1,
  started_at: "2024-01-01T10:00:00Z",
  completed_at: null,
  is_completed: false,
  notes: "Test session",
  created_at: "2024-01-01T10:00:00Z",
  updated_at: "2024-01-01T10:00:00Z",
};

describe("SessionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSession", () => {
    it("should insert a session and return the ID", async () => {
      mockExecuteQuery.mockResolvedValue({ lastInsertRowId: 5 } as any);

      const result = await SessionService.createSession({
        workout_id: 1,
        notes: "Morning workout",
        is_completed: false,
      });

      expect(result).toBe(5);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO workout_sessions"),
        [1, "Morning workout"],
      );
    });

    it("should handle null notes", async () => {
      mockExecuteQuery.mockResolvedValue({ lastInsertRowId: 6 } as any);

      await SessionService.createSession({
        workout_id: 1,
        notes: null,
        is_completed: false,
      });

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO workout_sessions"),
        [1, null],
      );
    });
  });

  describe("getSessionById", () => {
    it("should return session when found", async () => {
      mockGetFirstRow.mockResolvedValue(mockSession);

      const result = await SessionService.getSessionById(1);

      expect(result).toEqual(mockSession);
      expect(mockGetFirstRow).toHaveBeenCalledWith(
        "SELECT * FROM workout_sessions WHERE id = ?",
        [1],
      );
    });

    it("should return null when not found", async () => {
      mockGetFirstRow.mockResolvedValue(null);

      const result = await SessionService.getSessionById(999);

      expect(result).toBeNull();
    });
  });

  describe("getSessionsByWorkoutId", () => {
    it("should return sessions for a workout", async () => {
      mockGetAllRows.mockResolvedValue([mockSession]);

      const result = await SessionService.getSessionsByWorkoutId(1);

      expect(result).toHaveLength(1);
      expect(mockGetAllRows).toHaveBeenCalledWith(
        "SELECT * FROM workout_sessions WHERE workout_id = ? ORDER BY started_at DESC",
        [1],
      );
    });

    it("should return empty array when no sessions exist", async () => {
      mockGetAllRows.mockResolvedValue([]);

      const result = await SessionService.getSessionsByWorkoutId(999);

      expect(result).toEqual([]);
    });
  });

  describe("getRecentSessions", () => {
    it("should return recent sessions with default limit", async () => {
      mockGetAllRows.mockResolvedValue([mockSession]);

      const result = await SessionService.getRecentSessions();

      expect(mockGetAllRows).toHaveBeenCalledWith(
        "SELECT * FROM workout_sessions ORDER BY started_at DESC LIMIT ?",
        [10],
      );
      expect(result).toHaveLength(1);
    });

    it("should accept a custom limit", async () => {
      mockGetAllRows.mockResolvedValue([]);

      await SessionService.getRecentSessions(5);

      expect(mockGetAllRows).toHaveBeenCalledWith(
        "SELECT * FROM workout_sessions ORDER BY started_at DESC LIMIT ?",
        [5],
      );
    });
  });

  describe("completeSession", () => {
    it("should mark session as completed", async () => {
      await SessionService.completeSession("1", "Great workout");

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("is_completed = 1"),
        ["Great workout", "1"],
      );
    });

    it("should handle missing notes", async () => {
      await SessionService.completeSession("1");

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("is_completed = 1"),
        [null, "1"],
      );
    });
  });

  describe("deleteSession", () => {
    it("should delete session by ID", async () => {
      await SessionService.deleteSession(1);

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        "DELETE FROM workout_sessions WHERE id = ?",
        [1],
      );
    });
  });

  describe("getSessionWithDetails", () => {
    it("should return session with workout and exercise sets", async () => {
      mockGetFirstRow
        .mockResolvedValueOnce(mockSession) // getSessionById
        .mockResolvedValueOnce({ id: 1, title: "Push Day" }); // workout query

      mockGetAllRows.mockResolvedValue([
        {
          id: 1,
          session_id: 1,
          exercise_id: "ex1",
          set_number: 1,
          weight: 100,
          reps: 10,
          is_completed: 1,
          completed_at: "2024-01-01T11:00:00Z",
          created_at: "2024-01-01T10:00:00Z",
          updated_at: "2024-01-01T11:00:00Z",
          exercise_name: "Bench Press",
          target_sets: 3,
          target_reps: 10,
          muscle_group: "chest",
          difficulty: "intermediate",
          rest_seconds: 90,
        },
      ]);

      const result = await SessionService.getSessionWithDetails(1);

      expect(result).not.toBeNull();
      expect(result!.workout.title).toBe("Push Day");
      expect(result!.exercise_sets).toHaveLength(1);
      expect(result!.exercise_sets[0].is_completed).toBe(true);
      expect(result!.exercise_sets[0].exercise.name).toBe("Bench Press");
    });

    it("should return null when session not found", async () => {
      mockGetFirstRow.mockResolvedValue(null);

      const result = await SessionService.getSessionWithDetails(999);

      expect(result).toBeNull();
    });

    it("should return null when session has no ID", async () => {
      mockGetFirstRow.mockResolvedValue({ ...mockSession, id: null });

      const result = await SessionService.getSessionWithDetails(1);

      expect(result).toBeNull();
    });

    it("should return null when workout not found", async () => {
      mockGetFirstRow
        .mockResolvedValueOnce(mockSession)
        .mockResolvedValueOnce(null); // workout not found

      const result = await SessionService.getSessionWithDetails(1);

      expect(result).toBeNull();
    });
  });

  describe("getSessionStats", () => {
    it("should return aggregated session statistics", async () => {
      mockGetFirstRow.mockResolvedValue({
        total_sets: 12,
        completed_sets: 10,
        total_exercises: 4,
        total_weight: 500,
        total_reps: 120,
      });

      const result = await SessionService.getSessionStats(1);

      expect(result).toEqual({
        total_sets: 12,
        completed_sets: 10,
        total_exercises: 4,
        total_weight: 500,
        total_reps: 120,
      });
    });

    it("should return zeros when no stats found", async () => {
      mockGetFirstRow.mockResolvedValue(null);

      const result = await SessionService.getSessionStats(999);

      expect(result).toEqual({
        total_sets: 0,
        completed_sets: 0,
        total_exercises: 0,
        total_weight: 0,
        total_reps: 0,
      });
    });
  });

  describe("isSessionComplete", () => {
    it("should return true when all sets are completed", async () => {
      mockGetFirstRow.mockResolvedValue({ incomplete_sets: 0 });

      const result = await SessionService.isSessionComplete(1);

      expect(result).toBe(true);
    });

    it("should return false when incomplete sets remain", async () => {
      mockGetFirstRow.mockResolvedValue({ incomplete_sets: 3 });

      const result = await SessionService.isSessionComplete(1);

      expect(result).toBe(false);
    });

    it("should return true when result is null", async () => {
      mockGetFirstRow.mockResolvedValue(null);

      const result = await SessionService.isSessionComplete(1);

      expect(result).toBe(true);
    });
  });

  describe("getMostRecentIncompleteSession", () => {
    it("should return null when no sessions exist", async () => {
      mockGetAllRows.mockResolvedValue([]);

      const result = await SessionService.getMostRecentIncompleteSession();

      expect(result).toBeNull();
    });

    it("should return the session when is_completed is false", async () => {
      mockGetAllRows.mockResolvedValue([mockSession]);

      const result = await SessionService.getMostRecentIncompleteSession();

      expect(result).toEqual(mockSession);
    });

    it("should return null when session id is null", async () => {
      mockGetAllRows.mockResolvedValue([{ ...mockSession, id: null }]);

      const result = await SessionService.getMostRecentIncompleteSession();

      expect(result).toBeNull();
    });

    it("should return null when latest session is completed", async () => {
      mockGetAllRows.mockResolvedValue([
        { ...mockSession, is_completed: true },
      ]);

      const result = await SessionService.getMostRecentIncompleteSession();

      expect(result).toBeNull();
    });
  });

  describe("getLastSessionDataForExercise", () => {
    it("should return min weight/reps/distance from last completed session", async () => {
      mockGetFirstRow.mockResolvedValue({
        ...mockSession,
        id: 1,
        is_completed: true,
        completed_at: "2024-01-01T11:00:00Z",
      });
      mockGetAllRows.mockResolvedValue([
        { id: 1, target: '{"weight":80,"reps":10}', is_completed: 1 },
        { id: 2, target: '{"weight":85,"reps":8}', is_completed: 1 },
      ]);

      const result = await SessionService.getLastSessionDataForExercise(
        1,
        "ex1",
      );

      expect(result).toEqual({
        weight: 80,
        reps: 8,
        distance: undefined,
      });
    });

    it("should return null when no completed session exists", async () => {
      mockGetFirstRow.mockResolvedValue(null);

      const result = await SessionService.getLastSessionDataForExercise(
        1,
        "ex1",
      );

      expect(result).toBeNull();
    });

    it("should return null when session has no ID", async () => {
      mockGetFirstRow.mockResolvedValue({ ...mockSession, id: null });

      const result = await SessionService.getLastSessionDataForExercise(
        1,
        "ex1",
      );

      expect(result).toBeNull();
    });

    it("should return null when no completed sets exist", async () => {
      mockGetFirstRow.mockResolvedValue({
        ...mockSession,
        id: 1,
        is_completed: true,
      });
      mockGetAllRows.mockResolvedValue([]);

      const result = await SessionService.getLastSessionDataForExercise(
        1,
        "ex1",
      );

      expect(result).toBeNull();
    });

    it("should handle invalid JSON in target gracefully", async () => {
      mockGetFirstRow.mockResolvedValue({
        ...mockSession,
        id: 1,
        is_completed: true,
      });
      mockGetAllRows.mockResolvedValue([
        { id: 1, target: "not json", is_completed: 1 },
      ]);

      const result = await SessionService.getLastSessionDataForExercise(
        1,
        "ex1",
      );

      expect(result).toEqual({
        weight: undefined,
        reps: undefined,
        distance: undefined,
      });
    });
  });
});
