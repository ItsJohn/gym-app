import * as SQLite from "expo-sqlite";
import {
  QueryBuilder,
  clearAllData,
  closeDatabase,
  deleteAndRecreateDatabase,
  executeQuery,
  getAllRows,
  getDatabase,
  getFirstRow,
  initializeDatabase,
  query,
  resetDatabase,
  withTransaction,
} from "../database";

const mockDatabase = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  closeAsync: jest.fn(),
};

const mockSQLite = SQLite as jest.Mocked<typeof SQLite>;

describe("Database Module", () => {
  beforeEach(() => {
    mockSQLite.openDatabaseAsync.mockResolvedValue(mockDatabase as any);
    mockSQLite.deleteDatabaseAsync.mockResolvedValue();

    mockDatabase.execAsync.mockResolvedValue(undefined);
    mockDatabase.runAsync.mockResolvedValue({ changes: 0, lastInsertRowId: 0 });
    mockDatabase.getAllAsync.mockResolvedValue([]);
    mockDatabase.getFirstAsync.mockResolvedValue(null);
    mockDatabase.closeAsync.mockResolvedValue(undefined);

    resetDatabase();
  });

  describe("initializeDatabase", () => {
    it("should initialize database successfully", async () => {
      const result = await initializeDatabase();

      expect(mockSQLite.openDatabaseAsync).toHaveBeenCalledWith("gym_app.db");
      expect(mockDatabase.execAsync).toHaveBeenCalledWith(
        "PRAGMA foreign_keys = ON;",
      );
      expect(result).toBe(mockDatabase);
    });

    it("should return existing database instance if already initialized", async () => {
      const firstCall = await initializeDatabase();
      const secondCall = await initializeDatabase();

      expect(firstCall).toBe(secondCall);
      expect(mockSQLite.openDatabaseAsync).toHaveBeenCalledTimes(1);
    });

    it("should handle initialization errors", async () => {
      const error = new Error("Database error");
      mockSQLite.openDatabaseAsync.mockRejectedValue(error);

      await expect(initializeDatabase()).rejects.toThrow("Database error");
    });
  });

  describe("getDatabase", () => {
    it("should return existing database instance", async () => {
      await initializeDatabase();
      const result = await getDatabase();

      expect(result).toBe(mockDatabase);
    });

    it("should initialize database if not exists", async () => {
      const result = await getDatabase();

      expect(mockSQLite.openDatabaseAsync).toHaveBeenCalled();
      expect(result).toBe(mockDatabase);
    });
  });

  describe("closeDatabase", () => {
    it("should close database successfully", async () => {
      await initializeDatabase();
      await closeDatabase();

      expect(mockDatabase.closeAsync).toHaveBeenCalled();
    });

    it("should handle closing when database is null", async () => {
      await expect(closeDatabase()).resolves.not.toThrow();
    });
  });

  describe("executeQuery", () => {
    it("should execute query successfully", async () => {
      const mockResult = { changes: 1, lastInsertRowId: 1 };
      mockDatabase.runAsync.mockResolvedValue(mockResult);

      const result = await executeQuery("INSERT INTO test VALUES (?)", [
        "value",
      ]);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        "INSERT INTO test VALUES (?)",
        ["value"],
      );
      expect(result).toBe(mockResult);
    });

    it("should handle query execution errors", async () => {
      const error = new Error("Query error");
      mockDatabase.runAsync.mockRejectedValue(error);

      await expect(executeQuery("INVALID QUERY")).rejects.toThrow(
        "Query error",
      );
    });
  });

  describe("getAllRows", () => {
    it("should get all rows successfully", async () => {
      const mockRows = [{ id: 1, name: "test" }];
      mockDatabase.getAllAsync.mockResolvedValue(mockRows);

      const result = await getAllRows("SELECT * FROM test");

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM test",
        [],
      );
      expect(result).toBe(mockRows);
    });

    it("should handle getAllAsync errors", async () => {
      const error = new Error("Get all error");
      mockDatabase.getAllAsync.mockRejectedValue(error);

      await expect(getAllRows("SELECT * FROM test")).rejects.toThrow(
        "Get all error",
      );
    });
  });

  describe("getFirstRow", () => {
    it("should get first row successfully", async () => {
      const mockRow = { id: 1, name: "test" };
      mockDatabase.getFirstAsync.mockResolvedValue(mockRow);

      const result = await getFirstRow("SELECT * FROM test WHERE id = ?", [1]);

      expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
        "SELECT * FROM test WHERE id = ?",
        [1],
      );
      expect(result).toBe(mockRow);
    });

    it("should return null when no rows found", async () => {
      mockDatabase.getFirstAsync.mockResolvedValue(null);

      const result = await getFirstRow("SELECT * FROM test WHERE id = ?", [
        999,
      ]);

      expect(result).toBeNull();
    });

    it("should handle getFirstAsync errors", async () => {
      const error = new Error("Get first error");
      mockDatabase.getFirstAsync.mockRejectedValue(error);

      await expect(getFirstRow("SELECT * FROM test")).rejects.toThrow(
        "Get first error",
      );
    });
  });

  describe("withTransaction", () => {
    it("should execute transaction successfully", async () => {
      const callback = jest.fn().mockResolvedValue("result");

      const result = await withTransaction(callback);

      expect(mockDatabase.execAsync).toHaveBeenCalledWith("BEGIN TRANSACTION");
      expect(mockDatabase.execAsync).toHaveBeenCalledWith("COMMIT");
      expect(callback).toHaveBeenCalledWith(mockDatabase);
      expect(result).toBe("result");
    });

    it("should rollback on error", async () => {
      const error = new Error("Transaction error");
      const callback = jest.fn().mockRejectedValue(error);

      await expect(withTransaction(callback)).rejects.toThrow(
        "Transaction error",
      );

      expect(mockDatabase.execAsync).toHaveBeenCalledWith("BEGIN TRANSACTION");
      expect(mockDatabase.execAsync).toHaveBeenCalledWith("ROLLBACK");
      expect(mockDatabase.execAsync).not.toHaveBeenCalledWith("COMMIT");
    });
  });

  describe("QueryBuilder", () => {
    let queryBuilder: QueryBuilder;

    beforeEach(() => {
      queryBuilder = new QueryBuilder("test_table");
    });

    it("should build basic select query", async () => {
      await queryBuilder.getAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM test_table",
        [],
      );
    });

    it("should build query with select fields", async () => {
      queryBuilder.select(["id", "name"]);
      await queryBuilder.getAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        "SELECT id, name FROM test_table",
        [],
      );
    });

    it("should build query with where conditions", async () => {
      queryBuilder.where("id = ?", 1).where("name = ?", "test");
      await queryBuilder.getAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM test_table WHERE id = ? AND name = ?",
        [1, "test"],
      );
    });

    it("should build query with order by", async () => {
      queryBuilder.orderBy("name", "DESC");
      await queryBuilder.getAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM test_table ORDER BY name DESC",
        [],
      );
    });

    it("should build query with limit", async () => {
      queryBuilder.limit(10);
      await queryBuilder.getAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM test_table LIMIT 10",
        [],
      );
    });

    it("should build complete query with all clauses", async () => {
      queryBuilder
        .select(["id", "name"])
        .where("active = ?", true)
        .orderBy("created_at", "DESC")
        .limit(5);
      await queryBuilder.getAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        "SELECT id, name FROM test_table WHERE active = ? ORDER BY created_at DESC LIMIT 5",
        [true],
      );
    });

    it("should use getFirstAsync for getFirst method", async () => {
      await queryBuilder.getFirst();

      expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
        "SELECT * FROM test_table",
        [],
      );
    });
  });

  describe("query helper", () => {
    it("should create QueryBuilder instance", () => {
      const qb = query("test_table");

      expect(qb).toBeInstanceOf(QueryBuilder);
    });
  });

  describe("deleteAndRecreateDatabase", () => {
    it("should delete and recreate database successfully", async () => {
      await initializeDatabase();
      await deleteAndRecreateDatabase();

      expect(mockDatabase.closeAsync).toHaveBeenCalled();
      expect(mockSQLite.deleteDatabaseAsync).toHaveBeenCalledWith("gym_app.db");
      expect(mockSQLite.openDatabaseAsync).toHaveBeenCalledTimes(2);
    });

    it("should handle errors during recreation", async () => {
      const error = new Error("Delete error");
      mockSQLite.deleteDatabaseAsync.mockRejectedValue(error);

      await expect(deleteAndRecreateDatabase()).rejects.toThrow("Delete error");
    });
  });

  describe("clearAllData", () => {
    it("should clear all data successfully", async () => {
      await initializeDatabase();
      await clearAllData();

      expect(mockDatabase.execAsync).toHaveBeenCalledWith(
        "PRAGMA foreign_keys = OFF;",
      );
      expect(mockDatabase.execAsync).toHaveBeenCalledWith(
        "DELETE FROM session_sets;",
      );
      expect(mockDatabase.execAsync).toHaveBeenCalledWith(
        "DELETE FROM workout_sessions;",
      );
      expect(mockDatabase.execAsync).toHaveBeenCalledWith(
        "DELETE FROM workout_schedules;",
      );
      expect(mockDatabase.execAsync).toHaveBeenCalledWith(
        "DELETE FROM exercises;",
      );
      expect(mockDatabase.execAsync).toHaveBeenCalledWith(
        "DELETE FROM workouts;",
      );
      expect(mockDatabase.execAsync).toHaveBeenCalledWith(
        "DELETE FROM settings;",
      );
      expect(mockDatabase.execAsync).toHaveBeenCalledWith(
        "PRAGMA foreign_keys = ON;",
      );
    });

    it("should handle errors during clearing", async () => {
      const error = new Error("Clear error");
      mockDatabase.execAsync.mockRejectedValue(error);

      await expect(clearAllData()).rejects.toThrow("Clear error");
    });
  });
});
