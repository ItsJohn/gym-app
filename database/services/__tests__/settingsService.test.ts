import { executeQuery, getAllRows, getFirstRow } from "../../database";
import { SettingsService } from "../settingsService";

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

describe("SettingsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSetting", () => {
    it("should return the setting value when found", async () => {
      mockGetFirstRow.mockResolvedValue({
        id: 1,
        key: "weightUnit",
        value: "kg",
        created_at: "",
        updated_at: "",
      });

      const result = await SettingsService.getSetting("weightUnit");

      expect(result).toBe("kg");
      expect(mockGetFirstRow).toHaveBeenCalledWith(
        "SELECT * FROM settings WHERE key = ?",
        ["weightUnit"],
      );
    });

    it("should return null when setting not found", async () => {
      mockGetFirstRow.mockResolvedValue(null);

      const result = await SettingsService.getSetting("nonExistent");

      expect(result).toBeNull();
    });
  });

  describe("setSetting", () => {
    it("should insert or replace the setting", async () => {
      await SettingsService.setSetting("weightUnit", "lbs");

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT OR REPLACE INTO settings"),
        ["weightUnit", "lbs"],
      );
    });
  });

  describe("getAllSettings", () => {
    it("should return all settings as a key-value object", async () => {
      mockGetAllRows.mockResolvedValue([
        {
          id: 1,
          key: "weightUnit",
          value: "kg",
          created_at: "",
          updated_at: "",
        },
        { id: 2, key: "theme", value: "dark", created_at: "", updated_at: "" },
      ]);

      const result = await SettingsService.getAllSettings();

      expect(result).toEqual({ weightUnit: "kg", theme: "dark" });
    });

    it("should return empty object when no settings exist", async () => {
      mockGetAllRows.mockResolvedValue([]);

      const result = await SettingsService.getAllSettings();

      expect(result).toEqual({});
    });
  });

  describe("deleteSetting", () => {
    it("should delete the setting by key", async () => {
      await SettingsService.deleteSetting("weightUnit");

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        "DELETE FROM settings WHERE key = ?",
        ["weightUnit"],
      );
    });
  });

  describe("clearAllSettings", () => {
    it("should delete all settings", async () => {
      await SettingsService.clearAllSettings();

      expect(mockExecuteQuery).toHaveBeenCalledWith("DELETE FROM settings");
    });
  });

  describe("initializeDefaultSettings", () => {
    it("should only set defaults for missing settings", async () => {
      // First call returns existing setting, rest return null
      mockGetFirstRow
        .mockResolvedValueOnce({
          id: 1,
          key: "weightUnit",
          value: "lbs",
          created_at: "",
          updated_at: "",
        })
        .mockResolvedValue(null);

      await SettingsService.initializeDefaultSettings();

      // Should not have set weightUnit since it already exists
      const setCalls = mockExecuteQuery.mock.calls.filter(
        (call) => (call[1] as string[])?.[0] === "weightUnit",
      );
      expect(setCalls).toHaveLength(0);

      // Should have set the other defaults (6 remaining)
      expect(mockExecuteQuery).toHaveBeenCalledTimes(6);
    });

    it("should set all defaults when none exist", async () => {
      mockGetFirstRow.mockResolvedValue(null);

      await SettingsService.initializeDefaultSettings();

      expect(mockExecuteQuery).toHaveBeenCalledTimes(7);
    });
  });

  describe("getAppSettings", () => {
    it("should return typed settings with correct defaults", async () => {
      mockGetAllRows.mockResolvedValue([
        {
          id: 1,
          key: "weightUnit",
          value: "lbs",
          created_at: "",
          updated_at: "",
        },
        {
          id: 2,
          key: "defaultRestTime",
          value: "120",
          created_at: "",
          updated_at: "",
        },
        {
          id: 3,
          key: "restTimerSound",
          value: "chime",
          created_at: "",
          updated_at: "",
        },
        {
          id: 4,
          key: "autoAdvanceAfterSet",
          value: "true",
          created_at: "",
          updated_at: "",
        },
        {
          id: 5,
          key: "showExerciseDescriptions",
          value: "false",
          created_at: "",
          updated_at: "",
        },
        {
          id: 6,
          key: "vibrationEnabled",
          value: "true",
          created_at: "",
          updated_at: "",
        },
        { id: 7, key: "theme", value: "dark", created_at: "", updated_at: "" },
      ]);

      const result = await SettingsService.getAppSettings();

      expect(result).toEqual({
        weightUnit: "lbs",
        defaultRestTime: 120,
        restTimerSound: "chime",
        autoAdvanceAfterSet: true,
        showExerciseDescriptions: false,
        vibrationEnabled: true,
        theme: "dark",
      });
    });

    it("should use defaults when settings are missing", async () => {
      mockGetAllRows.mockResolvedValue([]);

      const result = await SettingsService.getAppSettings();

      expect(result).toEqual({
        weightUnit: "kg",
        defaultRestTime: 90,
        restTimerSound: "beep",
        autoAdvanceAfterSet: false,
        showExerciseDescriptions: false,
        vibrationEnabled: false,
        theme: "auto",
      });
    });
  });

  describe("updateAppSetting", () => {
    it("should convert boolean to string", async () => {
      await SettingsService.updateAppSetting("autoAdvanceAfterSet", true);

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT OR REPLACE INTO settings"),
        ["autoAdvanceAfterSet", "true"],
      );
    });

    it("should convert number to string", async () => {
      await SettingsService.updateAppSetting("defaultRestTime", 90);

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT OR REPLACE INTO settings"),
        ["defaultRestTime", "90"],
      );
    });

    it("should pass string values directly", async () => {
      await SettingsService.updateAppSetting("weightUnit", "lbs");

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT OR REPLACE INTO settings"),
        ["weightUnit", "lbs"],
      );
    });
  });
});
