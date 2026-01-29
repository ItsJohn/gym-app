import { useCallback } from "react";
import { Alert } from "react-native";
import {
  RestTimerSound,
  Theme,
  useSettings,
  WeightUnit,
} from "@/contexts/SettingsContext";
import { deleteAndRecreateDatabase } from "@/database/database";

export function useSettingsActions() {
  const { settings, updateSetting, resetSettings } = useSettings();

  const handleWeightUnitChange = useCallback(() => {
    Alert.alert("Weight Unit", "Choose your preferred weight unit:", [
      {
        text: "Kilograms (kg)",
        onPress: () => updateSetting("weightUnit", "kg"),
        style: "default",
      },
      {
        text: "Pounds (lbs)",
        onPress: () => updateSetting("weightUnit", "lbs"),
        style: "default",
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [updateSetting]);

  const handleRestTimeChange = useCallback(() => {
    Alert.alert(
      "Default Rest Time",
      "Choose your default rest time between sets:",
      [
        {
          text: "60 seconds",
          onPress: () => updateSetting("defaultRestTime", 60),
        },
        {
          text: "90 seconds",
          onPress: () => updateSetting("defaultRestTime", 90),
        },
        {
          text: "120 seconds",
          onPress: () => updateSetting("defaultRestTime", 120),
        },
        {
          text: "180 seconds",
          onPress: () => updateSetting("defaultRestTime", 180),
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  }, [updateSetting]);

  const handleRestSoundChange = useCallback(() => {
    Alert.alert(
      "Rest Timer Sound",
      "Choose the sound for rest timer notifications:",
      [
        {
          text: "None",
          onPress: () => updateSetting("restTimerSound", "none"),
        },
        {
          text: "Beep",
          onPress: () => updateSetting("restTimerSound", "beep"),
        },
        {
          text: "Chime",
          onPress: () => updateSetting("restTimerSound", "chime"),
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  }, [updateSetting]);

  const handleThemeChange = useCallback(() => {
    Alert.alert("App Theme", "Choose your preferred app theme:", [
      { text: "Light", onPress: () => updateSetting("theme", "light") },
      { text: "Dark", onPress: () => updateSetting("theme", "dark") },
      { text: "Auto (System)", onPress: () => updateSetting("theme", "auto") },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [updateSetting]);

  const handleResetSettings = useCallback(() => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to their default values? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetSettings },
      ],
    );
  }, [resetSettings]);

  const handleClearDatabase = useCallback(() => {
    Alert.alert(
      "Clear All Data",
      "⚠️ WARNING: This will permanently delete ALL your data including:\n\n• All workouts and exercises\n• All workout history and sessions\n• All exercise sets and progress\n• All app settings\n\nThis action cannot be undone. Are you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All Data",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAndRecreateDatabase();
              resetSettings();
              Alert.alert(
                "Database Recreated",
                "The database has been completely deleted and recreated. The app will restart with default settings.",
                [{ text: "OK" }],
              );
            } catch (error) {
              console.error("Error recreating database:", error);
              Alert.alert(
                "Error",
                "Failed to recreate database. Please try again.",
                [{ text: "OK" }],
              );
            }
          },
        },
      ],
    );
  }, [resetSettings]);

  return {
    settings,
    updateSetting,
    handleWeightUnitChange,
    handleRestTimeChange,
    handleRestSoundChange,
    handleThemeChange,
    handleResetSettings,
    handleClearDatabase,
    formatRestTime,
    formatWeightUnit,
    formatRestSound,
    formatTheme,
  };
}

export function formatRestTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0
    ? `${minutes}m ${remainingSeconds}s`
    : `${minutes}m`;
}

export function formatWeightUnit(unit: WeightUnit): string {
  return unit === "kg" ? "Kilograms (kg)" : "Pounds (lbs)";
}

export function formatRestSound(sound: RestTimerSound): string {
  switch (sound) {
    case "none":
      return "None";
    case "beep":
      return "Beep";
    case "chime":
      return "Chime";
    default:
      return "Beep";
  }
}

export function formatTheme(theme: Theme): string {
  switch (theme) {
    case "light":
      return "Light";
    case "dark":
      return "Dark";
    case "auto":
      return "Auto (System)";
    default:
      return "Auto (System)";
  }
}
