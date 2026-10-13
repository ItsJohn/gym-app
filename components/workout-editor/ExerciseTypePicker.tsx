import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { EXERCISE_TYPE_OPTIONS, ExerciseType } from "./exerciseTypes";

interface ExerciseTypePickerProps {
  value: ExerciseType;
  onChange: (type: ExerciseType) => void;
}

export function ExerciseTypePicker({
  value,
  onChange,
}: ExerciseTypePickerProps) {
  return (
    <ThemedView style={styles.row}>
      {EXERCISE_TYPE_OPTIONS.map(({ type, label }) => {
        const selected = type === value;
        return (
          <TouchableOpacity
            key={type}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onChange(type)}
          >
            <ThemedText
              style={[styles.chipText, selected && styles.chipTextSelected]}
            >
              {label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.3)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipSelected: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    borderColor: "rgba(74, 144, 226, 1)",
  },
  chipText: {
    fontSize: 14,
  },
  chipTextSelected: {
    color: "white",
    fontWeight: "600",
  },
});
