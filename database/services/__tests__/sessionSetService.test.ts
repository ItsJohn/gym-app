import { executeQuery, getAllRows, getFirstRow } from "../../database";
import { SessionSetService } from "../sessionSetService";
import { ExerciseService } from "../exerciseService";

jest.mock("../../../database/database", () => ({
  executeQuery: jest.fn(),
  getAllRows: jest.fn(),
  getFirstRow: jest.fn(),
}));

jest.mock("../exerciseService");

const mockExecuteQuery = executeQuery as jest.MockedFunction<
  typeof executeQuery
>;
const mockGetAllRows = getAllRows as jest.MockedFunction<typeof getAllRows>;
const mockGetFirstRow = getFirstRow as jest.MockedFunction<typeof getFirstRow>;

describe("SessionSetService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initializeSessionSets", () => {
    it("should create sets for each exercise based on target sets", async () => {
      (ExerciseService.getExercisesByWorkoutId as jest.Mock).mockResolvedValue([
        { id: "ex1", name: "Bench Press", target: { sets: "3", reps: "10" } },
        { id: "ex2", name: "Squats", target: { sets: "2", reps: "8" } },
      ]);
      mockGetAllRows.mockResolvedValueOnce([]); // no prior completed sets
      mockExecuteQuery.mockResolvedValue({ lastInsertRowId: 1 } as any);

      const result = await SessionSetService.initializeSessionSets(1, 1);

      // 3 sets for ex1 + 2 sets for ex2 = 5 total
      expect(mockExecuteQuery).toHaveBeenCalledTimes(5);
      expect(result).toHaveLength(5);
    });

    it("should default to 1 set when target sets is missing", async () => {
      (ExerciseService.getExercisesByWorkoutId as jest.Mock).mockResolvedValue([
        { id: "ex1", name: "Stretch", target: null },
      ]);
      mockGetAllRows.mockResolvedValueOnce([]); // no prior completed sets
      mockExecuteQuery.mockResolvedValue({ lastInsertRowId: 1 } as any);

      const result = await SessionSetService.initializeSessionSets(1, 1);

      expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
    });

    it("should pre-fill reps and weight from last session per set", async () => {
      (ExerciseService.getExercisesByWorkoutId as jest.Mock).mockResolvedValue([
        {
          id: "ex1",
          name: "Bench Press",
          target: { sets: "2", reps: "10", weight: 0 },
        },
      ]);
      mockGetAllRows.mockResolvedValueOnce([
        {
          exercise_name: "Bench Press",
          target: JSON.stringify({ reps: "12", weight: 80 }),
          session_id: 99,
        },
        {
          exercise_name: "Bench Press",
          target: JSON.stringify({ reps: "10", weight: 75 }),
          session_id: 99,
        },
      ]);
      mockExecuteQuery.mockResolvedValue({ lastInsertRowId: 1 } as any);

      await SessionSetService.initializeSessionSets(1, 1);

      const firstCallArgs = mockExecuteQuery.mock.calls[0]![1];
      const secondCallArgs = mockExecuteQuery.mock.calls[1]![1];
      expect(JSON.parse(firstCallArgs![2] as string)).toMatchObject({
        reps: "12",
        weight: 80,
      });
      expect(JSON.parse(secondCallArgs![2] as string)).toMatchObject({
        reps: "10",
        weight: 75,
      });
    });

    it("should fall back to exercise default when no last session data for that set index", async () => {
      (ExerciseService.getExercisesByWorkoutId as jest.Mock).mockResolvedValue([
        { id: "ex1", name: "Bench Press", target: { sets: "3", reps: "10" } },
      ]);
      // Only one set in history, but exercise has 3 sets
      mockGetAllRows.mockResolvedValueOnce([
        {
          exercise_name: "Bench Press",
          target: JSON.stringify({ reps: "12", weight: 80 }),
          session_id: 99,
        },
      ]);
      mockExecuteQuery.mockResolvedValue({ lastInsertRowId: 1 } as any);

      await SessionSetService.initializeSessionSets(1, 1);

      const firstCallArgs = mockExecuteQuery.mock.calls[0]![1];
      const thirdCallArgs = mockExecuteQuery.mock.calls[2]![1];
      expect(JSON.parse(firstCallArgs![2] as string)).toMatchObject({
        reps: "12",
      });
      // Third set has no last session data, falls back to default
      expect(JSON.parse(thirdCallArgs![2] as string)).toMatchObject({
        reps: "10",
      });
    });

    it("should use the most recent session when exercise exists across multiple sessions", async () => {
      (ExerciseService.getExercisesByWorkoutId as jest.Mock).mockResolvedValue([
        { id: "ex-new", name: "Squat", target: { sets: "1", reps: "5" } },
      ]);
      // Rows sorted by session_id DESC: session 10 is more recent than session 5
      mockGetAllRows.mockResolvedValueOnce([
        {
          exercise_name: "Squat",
          target: JSON.stringify({ reps: "5", weight: 120 }),
          session_id: 10,
        },
        {
          exercise_name: "Squat",
          target: JSON.stringify({ reps: "5", weight: 100 }),
          session_id: 5,
        },
      ]);
      mockExecuteQuery.mockResolvedValue({ lastInsertRowId: 1 } as any);

      await SessionSetService.initializeSessionSets(1, 1);

      const firstCallArgs = mockExecuteQuery.mock.calls[0]![1];
      // Should use weight from session 10 (most recent), not session 5
      expect(JSON.parse(firstCallArgs![2] as string)).toMatchObject({
        weight: 120,
      });
    });
  });

  describe("createExerciseSet", () => {
    it("should insert a session set and return the ID", async () => {
      mockExecuteQuery.mockResolvedValue({ lastInsertRowId: 10 } as any);

      const result = await SessionSetService.createExerciseSet({
        session_id: 1,
        exercise_id: "ex1",
        target: { reps: "10", sets: "3" },
        is_completed: false,
      });

      expect(result).toBe(10);
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO session_set"),
        [1, "ex1", JSON.stringify({ reps: "10", sets: "3" }), undefined],
      );
    });
  });

  describe("parseSessionSet", () => {
    it("should parse JSON target and convert is_completed to boolean", () => {
      const raw = {
        id: 1,
        session_id: 1,
        exercise_id: "ex1",
        target: '{"reps":"10"}' as any,
        is_completed: 1 as any,
      };

      const result = SessionSetService.parseSessionSet(raw);

      expect(result!.target).toEqual({ reps: "10" });
      expect(result!.is_completed).toBe(true);
    });

    it("should return undefined for undefined input", () => {
      expect(SessionSetService.parseSessionSet(undefined)).toBeUndefined();
    });

    it("should handle null target", () => {
      const raw = {
        id: 1,
        session_id: 1,
        exercise_id: "ex1",
        target: null as any,
        is_completed: 0 as any,
      };

      const result = SessionSetService.parseSessionSet(raw);

      expect(result!.target).toBeNull();
      expect(result!.is_completed).toBe(false);
    });
  });

  describe("getSessionSet", () => {
    it("should return a parsed session set", async () => {
      mockGetFirstRow.mockResolvedValue({
        id: 1,
        session_id: 1,
        exercise_id: "ex1",
        target: '{"reps":"10"}',
        is_completed: 1,
      });

      const result = await SessionSetService.getSessionSet(1);

      expect(result).toBeDefined();
      expect(result!.target).toEqual({ reps: "10" });
      expect(result!.is_completed).toBe(true);
    });
  });

  describe("getSessionSetsBySessionId", () => {
    it("should return parsed session sets for a session", async () => {
      mockGetAllRows.mockResolvedValue([
        {
          id: 1,
          session_id: 1,
          exercise_id: "ex1",
          target: '{"reps":"10"}',
          is_completed: 1,
        },
        {
          id: 2,
          session_id: 1,
          exercise_id: "ex1",
          target: '{"reps":"10"}',
          is_completed: 0,
        },
      ]);

      const result = await SessionSetService.getSessionSetsBySessionId(1);

      expect(result).toHaveLength(2);
      expect(result[0].is_completed).toBe(true);
      expect(result[1].is_completed).toBe(false);
      expect(mockGetAllRows).toHaveBeenCalledWith(
        expect.stringContaining("WHERE session_id = ?"),
        [1],
      );
    });

    it("should return empty array when no sets exist", async () => {
      mockGetAllRows.mockResolvedValue([]);

      const result = await SessionSetService.getSessionSetsBySessionId(999);

      expect(result).toEqual([]);
    });
  });

  describe("getSessionSetsBySessionIdAndExerciseId", () => {
    it("should return sets filtered by session and exercise", async () => {
      mockGetAllRows.mockResolvedValue([
        {
          id: 1,
          session_id: 1,
          exercise_id: "ex1",
          target: '{"reps":"10"}',
          is_completed: 1,
        },
      ]);

      const result =
        await SessionSetService.getSessionSetsBySessionIdAndExerciseId(
          1,
          "ex1",
        );

      expect(result).toHaveLength(1);
      expect(mockGetAllRows).toHaveBeenCalledWith(
        expect.stringContaining("session_id = ? AND exercise_id = ?"),
        [1, "ex1"],
      );
    });
  });

  describe("updateSessionSet", () => {
    it("should update specified fields", async () => {
      await SessionSetService.updateSessionSet(1, {
        is_completed: true,
      });

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE session_set SET"),
        expect.arrayContaining([true, 1]),
      );
    });

    it("should JSON-stringify the target field", async () => {
      await SessionSetService.updateSessionSet(1, {
        target: { reps: "12", sets: "4" },
      });

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE session_set SET"),
        expect.arrayContaining([JSON.stringify({ reps: "12", sets: "4" }), 1]),
      );
    });

    it("should not execute query when updates are empty", async () => {
      await SessionSetService.updateSessionSet(1, {});

      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("should set completed_at when is_completed is true", async () => {
      await SessionSetService.updateSessionSet(1, { is_completed: true });

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("completed_at = CURRENT_TIMESTAMP"),
        expect.any(Array),
      );
    });
  });
});
