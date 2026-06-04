import GymLogo from "@/components/GymLogo";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import SettingItem from "@/components/settings/SettingItem";
import SettingSection from "@/components/settings/SettingSection";
import SettingSwitch from "@/components/settings/SettingSwitch";
import StravaConnect from "@/components/settings/StravaConnect";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  useSettingsActions,
  formatRestTime,
  formatWeightUnit,
  formatRestSound,
  formatTheme,
} from "@/hooks/useSettingsActions";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function SettingsScreen() {
  const {
    settings,
    updateSetting,
    handleWeightUnitChange,
    handleRestTimeChange,
    handleRestSoundChange,
    handleThemeChange,
    handleResetSettings,
    handleClearDatabase,
  } = useSettingsActions();

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
        <SettingSection title="Strava Integration">
          <StravaConnect />
        </SettingSection>

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
