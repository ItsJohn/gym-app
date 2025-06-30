import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface WorkoutScheduleManagerProps {
  onClose: () => void;
}

export default function WorkoutScheduleManager({
  onClose,
}: WorkoutScheduleManagerProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Weekly Workout Schedule</ThemedText>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <ThemedText style={styles.closeButtonText}>Close</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* <WorkoutDayScheduler onScheduleChange={loadData} /> */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(74, 144, 226, 1)",
    borderRadius: 6,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
