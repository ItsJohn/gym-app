import GymLogo from "@/components/GymLogo";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import SettingItem from "@/components/settings/SettingItem";
import SettingSection from "@/components/settings/SettingSection";
import SettingSwitch from "@/components/settings/SettingSwitch";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  RestTimerSound,
  Theme,
  useSettings,
  WeightUnit,
} from "@/contexts/SettingsContext";
import { deleteAndRecreateDatabase } from "@/database/database";
import React, { useCallback } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";

export default function SettingsScreen() {
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
      {
        text: "Cancel",
        style: "cancel",
      },
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
        {
          text: "Cancel",
          style: "cancel",
        },
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
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  }, [updateSetting]);

  const handleThemeChange = useCallback(() => {
    Alert.alert("App Theme", "Choose your preferred app theme:", [
      {
        text: "Light",
        onPress: () => updateSetting("theme", "light"),
      },
      {
        text: "Dark",
        onPress: () => updateSetting("theme", "dark"),
      },
      {
        text: "Auto (System)",
        onPress: () => updateSetting("theme", "auto"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  }, [updateSetting]);

  const handleResetSettings = useCallback(() => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to their default values? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: resetSettings,
        },
      ],
    );
  }, [resetSettings]);

  const handleClearDatabase = useCallback(() => {
    Alert.alert(
      "Clear All Data",
      "⚠️ WARNING: This will permanently delete ALL your data including:\n\n• All workouts and exercises\n• All workout history and sessions\n• All exercise sets and progress\n• All app settings\n\nThis action cannot be undone. Are you absolutely sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All Data",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAndRecreateDatabase();
              // Reset settings to defaults after recreating database
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

  const formatRestTime = useCallback((seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }, []);

  const formatWeightUnit = useCallback((unit: WeightUnit): string => {
    return unit === "kg" ? "Kilograms (kg)" : "Pounds (lbs)";
  }, []);

  const formatRestSound = useCallback((sound: RestTimerSound): string => {
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
  }, []);

  const formatTheme = useCallback((theme: Theme): string => {
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
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<GymLogo />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <SettingSection title="Workout Preferences">
          <SettingItem
            title="Weight Unit"
            description="Choose between kilograms or pounds for weight tracking"
            value={formatWeightUnit(settings.weightUnit)}
            onPress={handleWeightUnitChange}
          />

          <SettingItem
            title="Default Rest Time"
            description="Default rest time between sets during workouts"
            value={formatRestTime(settings.defaultRestTime)}
            onPress={handleRestTimeChange}
          />

          <SettingSwitch
            title="Auto-advance After Set"
            description="Automatically move to the next set after completing one"
            value={settings.autoAdvanceAfterSet}
            onValueChange={(value) =>
              updateSetting("autoAdvanceAfterSet", value)
            }
          />

          <SettingSwitch
            title="Show Exercise Descriptions"
            description="Display exercise instructions by default"
            value={settings.showExerciseDescriptions}
            onValueChange={(value) =>
              updateSetting("showExerciseDescriptions", value)
            }
          />
        </SettingSection>

        <SettingSection title="Notifications & Feedback">
          <SettingItem
            title="Rest Timer Sound"
            description="Sound to play when rest timer completes"
            value={formatRestSound(settings.restTimerSound)}
            onPress={handleRestSoundChange}
          />

          <SettingSwitch
            title="Vibration"
            description="Enable haptic feedback for interactions"
            value={settings.vibrationEnabled}
            onValueChange={(value) => updateSetting("vibrationEnabled", value)}
          />
        </SettingSection>

        <SettingSection title="Appearance">
          <SettingItem
            title="Theme"
            description="Choose your preferred app appearance"
            value={formatTheme(settings.theme)}
            onPress={handleThemeChange}
          />
        </SettingSection>

        <SettingSection title="Advanced">
          <SettingItem
            title="Reset All Settings"
            description="Restore all settings to their default values"
            onPress={handleResetSettings}
          />

          <SettingItem
            title="Clear All Data"
            description="⚠️ Permanently delete all workouts, history, and settings"
            onPress={handleClearDatabase}
          />
        </SettingSection>
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  scrollContainer: {
    flex: 1,
  },
});
