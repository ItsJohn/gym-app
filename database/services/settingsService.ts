import { executeQuery, getAllRows, getFirstRow } from "../database";
import { DatabaseSetting } from "../types";

export class SettingsService {
  // Get a setting by key
  static async getSetting(key: string): Promise<string | null> {
    const result = await getFirstRow<DatabaseSetting>(
      "SELECT * FROM settings WHERE key = ?",
      [key],
    );
    return result?.value || null;
  }

  // Set a setting value
  static async setSetting(key: string, value: string): Promise<void> {
    await executeQuery(
      `INSERT OR REPLACE INTO settings (key, value, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [key, value],
    );
  }

  // Get all settings as a key-value object
  static async getAllSettings(): Promise<Record<string, string>> {
    const settings = await getAllRows<DatabaseSetting>(
      "SELECT * FROM settings",
    );
    const result: Record<string, string> = {};

    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return result;
  }

  // Delete a setting
  static async deleteSetting(key: string): Promise<void> {
    await executeQuery("DELETE FROM settings WHERE key = ?", [key]);
  }

  // Clear all settings
  static async clearAllSettings(): Promise<void> {
    await executeQuery("DELETE FROM settings");
  }

  // Initialize default settings if they don't exist
  static async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = {
      weightUnit: "kg",
      defaultRestTime: "60",
      restTimerSound: "beep",
      autoAdvanceAfterSet: "false",
      showExerciseDescriptions: "true",
      vibrationEnabled: "true",
      theme: "auto",
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      const existing = await this.getSetting(key);
      if (existing === null) {
        await this.setSetting(key, value);
      }
    }
  }

  // Get typed settings for the app
  static async getAppSettings() {
    const settings = await this.getAllSettings();

    return {
      weightUnit: (settings.weightUnit as "kg" | "lbs") || "kg",
      defaultRestTime: parseInt(settings.defaultRestTime) || 90,
      restTimerSound:
        (settings.restTimerSound as "none" | "beep" | "chime") || "beep",
      autoAdvanceAfterSet: settings.autoAdvanceAfterSet === "true",
      showExerciseDescriptions: settings.showExerciseDescriptions === "true",
      vibrationEnabled: settings.vibrationEnabled === "true",
      theme: (settings.theme as "light" | "dark" | "auto") || "auto",
    };
  }

  // Update app settings
  static async updateAppSetting<
    K extends keyof Awaited<ReturnType<typeof SettingsService.getAppSettings>>,
  >(
    key: K,
    value: Awaited<ReturnType<typeof SettingsService.getAppSettings>>[K],
  ): Promise<void> {
    let stringValue: string;

    if (typeof value === "boolean") {
      stringValue = value.toString();
    } else if (typeof value === "number") {
      stringValue = value.toString();
    } else {
      stringValue = value as string;
    }

    await this.setSetting(key, stringValue);
  }
}
