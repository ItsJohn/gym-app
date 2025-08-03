import * as SQLite from "expo-sqlite";
import { ALL_TABLES } from "./schema";

const DATABASE_NAME = "gym_app.db";

let db: SQLite.SQLiteDatabase | null = null;

export const resetDatabase = (): void => {
  db = null;
};

export const initializeDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);

    // Enable foreign keys
    await db.execAsync("PRAGMA foreign_keys = ON;");

    // Create all tables and indexes
    for (const tableSQL of ALL_TABLES) {
      await db.execAsync(tableSQL);
    }

    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    return await initializeDatabase();
  }
  return db;
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};

// Utility function to execute queries with error handling
export const executeQuery = async (
  query: string,
  params: any[] = [],
): Promise<SQLite.SQLiteRunResult> => {
  try {
    const database = await getDatabase();
    return await database.runAsync(query, params);
  } catch (error) {
    console.error("Error executing query:", query, error);
    throw error;
  }
};

// Utility function to get all rows from a query
export const getAllRows = async <T = any>(
  query: string,
  params: any[] = [],
): Promise<T[]> => {
  try {
    const database = await getDatabase();
    return await database.getAllAsync<T>(query, params);
  } catch (error) {
    console.error("Error getting all rows:", query, error);
    throw error;
  }
};

// Utility function to get first row from a query
export const getFirstRow = async <T = any>(
  query: string,
  params: any[] = [],
): Promise<T | null> => {
  try {
    const database = await getDatabase();
    return await database.getFirstAsync<T>(query, params);
  } catch (error) {
    console.error("Error getting first row:", query, error);
    throw error;
  }
};

// Transaction support
export const withTransaction = async <T>(
  callback: (db: SQLite.SQLiteDatabase) => Promise<T>,
): Promise<T> => {
  const database = await getDatabase();

  try {
    await database.execAsync("BEGIN TRANSACTION");
    const result = await callback(database);
    await database.execAsync("COMMIT");
    return result;
  } catch (error) {
    await database.execAsync("ROLLBACK");
    throw error;
  }
};

// Simple query builder for common operations
export class QueryBuilder {
  private readonly table: string;
  private selectFields: string[] = ["*"];
  private readonly whereConditions: string[] = [];
  private readonly whereParams: any[] = [];
  private orderByClause: string = "";
  private limitClause: string = "";

  constructor(table: string) {
    this.table = table;
  }

  select(fields: string[]): this {
    this.selectFields = fields;
    return this;
  }

  where(condition: string, value?: any): this {
    this.whereConditions.push(condition);
    if (value !== undefined) {
      this.whereParams.push(value);
    }
    return this;
  }

  orderBy(field: string, direction: "ASC" | "DESC" = "ASC"): this {
    this.orderByClause = `ORDER BY ${field} ${direction}`;
    return this;
  }

  limit(count: number): this {
    this.limitClause = `LIMIT ${count}`;
    return this;
  }

  async getAll<T>(): Promise<T[]> {
    const query = this.buildSelectQuery();
    return await getAllRows<T>(query, this.whereParams);
  }

  async getFirst<T>(): Promise<T | null> {
    const query = this.buildSelectQuery();
    return await getFirstRow<T>(query, this.whereParams);
  }

  private buildSelectQuery(): string {
    let query = `SELECT ${this.selectFields.join(", ")} FROM ${this.table}`;

    if (this.whereConditions.length > 0) {
      query += ` WHERE ${this.whereConditions.join(" AND ")}`;
    }

    if (this.orderByClause) {
      query += ` ${this.orderByClause}`;
    }

    if (this.limitClause) {
      query += ` ${this.limitClause}`;
    }

    return query;
  }
}

// Helper function to create query builder
export const query = (table: string): QueryBuilder => new QueryBuilder(table);

// Delete the entire database file and recreate it from scratch
export const deleteAndRecreateDatabase = async (): Promise<void> => {
  try {
    // Close the current database connection
    await closeDatabase();

    // Delete the database file entirely
    await SQLite.deleteDatabaseAsync(DATABASE_NAME);

    // Reinitialize the database (this will create a new database file with all tables)
    await initializeDatabase();

    console.log("Database deleted and recreated successfully");
  } catch (error) {
    console.error("Error deleting and recreating database:", error);
    throw error;
  }
};

// Clear all data from the database while preserving table structure
export const clearAllData = async (): Promise<void> => {
  try {
    const database = await getDatabase();

    // Disable foreign key constraints temporarily
    await database.execAsync("PRAGMA foreign_keys = OFF;");

    // Clear all tables in reverse order to handle foreign key dependencies
    const tablesToClear = [
      "session_sets",
      "workout_sessions",
      "workout_schedules",
      "exercises",
      "workouts",
      "settings",
    ];

    for (const table of tablesToClear) {
      await database.execAsync(`DELETE FROM ${table};`);
      // Reset auto-increment counters
      await database.execAsync(
        `DELETE FROM sqlite_sequence WHERE name='${table}';`,
      );
    }

    // Re-enable foreign key constraints
    await database.execAsync("PRAGMA foreign_keys = ON;");

    console.log("All database data cleared successfully");
  } catch (error) {
    console.error("Error clearing database data:", error);
    throw error;
  }
};
