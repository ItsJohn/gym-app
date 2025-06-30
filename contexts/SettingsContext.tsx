import { initializeDatabase } from "@/database/database";
import { SettingsService } from "@/database/services/settingsService";
import React, { createContext, useContext, useEffect, useState } from "react";

export type WeightUnit = "kg" | "lbs";
export type RestTimerSound = "none" | "beep" | "chime";
export type Theme = "light" | "dark" | "auto";

interface WorkoutSettings {
  weightUnit: WeightUnit;
  defaultRestTime: number; // in seconds
  restTimerSound: RestTimerSound;
  autoAdvanceAfterSet: boolean;
  showExerciseDescriptions: boolean;
  vibrationEnabled: boolean;
  theme: Theme;
}

interface SettingsContextType {
  settings: WorkoutSettings;
  updateSetting: <K extends keyof WorkoutSettings>(
    key: K,
    value: WorkoutSettings[K],
  ) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: WorkoutSettings = {
  weightUnit: "kg",
  defaultRestTime: 90,
  restTimerSound: "beep",
  autoAdvanceAfterSet: false,
  showExerciseDescriptions: true,
  vibrationEnabled: true,
  theme: "auto",
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WorkoutSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await initializeDatabase();

      // Initialize default settings if they don't exist
      await SettingsService.initializeDefaultSettings();

      // Load current settings
      const currentSettings = await SettingsService.getAppSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error("Error initializing app:", error);
      // Fall back to default settings if database fails
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async <K extends keyof WorkoutSettings>(
    key: K,
    value: WorkoutSettings[K],
  ) => {
    try {
      // Update in database
      await SettingsService.updateAppSetting(key, value);

      // Update local state
      setSettings((prev) => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error("Error updating setting:", error);
      throw error;
    }
  };

  const resetSettings = async () => {
    try {
      // Clear all settings from database
      await SettingsService.clearAllSettings();

      // Reinitialize default settings
      await SettingsService.initializeDefaultSettings();

      // Load fresh settings
      const freshSettings = await SettingsService.getAppSettings();
      setSettings(freshSettings);
    } catch (error) {
      console.error("Error resetting settings:", error);
      // Fall back to default settings
      setSettings(defaultSettings);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

// Utility functions for weight conversion
export const convertWeight = (
  weight: number,
  fromUnit: WeightUnit,
  toUnit: WeightUnit,
): number => {
  if (fromUnit === toUnit) return weight;

  if (fromUnit === "kg" && toUnit === "lbs") {
    return Math.round(weight * 2.20462 * 10) / 10; // Round to 1 decimal place
  } else if (fromUnit === "lbs" && toUnit === "kg") {
    return Math.round((weight / 2.20462) * 10) / 10; // Round to 1 decimal place
  }

  return weight;
};

export const formatWeight = (weight: number, unit: WeightUnit): string => {
  return `${weight} ${unit}`;
};
