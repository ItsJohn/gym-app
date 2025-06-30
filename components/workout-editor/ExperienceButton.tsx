import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "../ThemedText";

interface ExperienceButtonProps {
  level: "beginner" | "intermediate" | "advanced";
  selected: boolean;
  onPress: () => void;
}

export const ExperienceButton = ({
  level,
  selected,
  onPress,
}: ExperienceButtonProps) => (
  <TouchableOpacity
    style={[
      styles.experienceButton,
      selected && styles.experienceButtonSelected,
    ]}
    onPress={onPress}
  >
    <ThemedText
      style={[
        styles.experienceButtonText,
        selected && styles.experienceButtonTextSelected,
      ]}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </ThemedText>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  experienceButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.3)",
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    alignItems: "center",
  },
  experienceButtonSelected: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    borderColor: "rgba(74, 144, 226, 1)",
  },
  experienceButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 1)",
  },
  experienceButtonTextSelected: {
    color: "white",
  },
});
