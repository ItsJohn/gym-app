import { executeQuery, getAllRows, getFirstRow } from "../../database";
import { SessionService } from "../sessionService";

// Mock the database module
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

describe("SessionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getMostRecentIncompleteSession", () => {
    it("should return null when no incomplete sessions exist", async () => {
      mockGetAllRows.mockResolvedValue([]);

      const result = await SessionService.getMostRecentIncompleteSession();

      expect(result).toBeNull();
      expect(mockGetAllRows).toHaveBeenCalledWith(
        "SELECT * FROM workout_sessions ORDER BY started_at DESC LIMIT 1",
      );
    });

    it("should return the session when is_completed = false", async () => {
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

      mockGetAllRows.mockResolvedValue([mockSession]);

      const result = await SessionService.getMostRecentIncompleteSession();

      expect(result).toEqual(mockSession);
      expect(mockGetAllRows).toHaveBeenCalledWith(
        "SELECT * FROM workout_sessions ORDER BY started_at DESC LIMIT 1",
      );
    });

    it("should return null when session id is null", async () => {
      const mockSession = {
        id: null,
        workout_id: 1,
        started_at: "2024-01-01T10:00:00Z",
        completed_at: null,
        is_completed: false,
        notes: "Test session",
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      };

      mockGetAllRows.mockResolvedValue([mockSession]);

      const result = await SessionService.getMostRecentIncompleteSession();

      expect(result).toBeNull();
    });
  });
});
