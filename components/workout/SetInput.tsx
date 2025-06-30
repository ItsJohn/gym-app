import { ThemedView } from "@/components/ThemedView";
import { useCountdown } from "@/hooks";
import { Exercise } from "@/validation/schemas";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import FancySelect from "./FancySelect";

interface SetInputProps {
  exercise: Exercise;
  weight?: number;
  reps?: number;
  onWeightChange: (weight: number) => void;
  onRepsChange: (reps: number) => void;
  onComplete: () => void;
  weightUnit?: "kg" | "lbs";
}

export default function SetInput({
  exercise,
  weight,
  reps,
  onWeightChange,
  onRepsChange,
  onComplete,
  weightUnit = "kg",
}: SetInputProps) {
  const initialDuration = exercise.type === "duration" ? reps || 30 : 30;
  const countdown = useCountdown(initialDuration);

  useEffect(() => {
    if (exercise.type === "duration" && reps) {
      countdown.reset(reps);
    }
  }, [reps, exercise.type]);

  useEffect(() => {
    if (countdown.isFinished) {
      onComplete();
    }
  }, [countdown.isFinished, onComplete]);

  // Generate weight options (5-500 in increments of 2.5 for kg, 5-1000 in increments of 5 for lbs)
  const weightOptions = useMemo(() => {
    const options = [];
    if (weightUnit === "kg") {
      for (let i = 2.5; i <= 500; i += 2.5) {
        options.push({
          label: i.toString(),
          value: i,
        });
      }
    } else {
      for (let i = 5; i <= 1000; i += 5) {
        options.push({
          label: i.toString(),
          value: i,
        });
      }
    }
    return options;
  }, [weightUnit]);

  // Generate reps options based on exercise type
  const repsOptions = useMemo(() => {
    const options = [];
    const maxReps = exercise.type === "duration" ? 300 : 100; // 300 seconds max for duration

    for (let i = 1; i <= maxReps; i++) {
      options.push({
        label: i.toString(),
        value: i,
      });
    }
    return options;
  }, [exercise.type]);

  const repsLabel = useMemo(() => {
    switch (exercise.type) {
      case "reps":
      case "reps-sets":
        return "Reps";
      case "reps-per-side":
        return "Reps per side";
      case "duration":
        return "Duration";
      case "distance":
        return "Distance";
      default:
        return "Reps";
    }
  }, [exercise.type]);

  const repsSuffix = useMemo(() => {
    switch (exercise.type) {
      case "duration":
        return "s";
      case "distance":
        return "m";
      default:
        return "";
    }
  }, [exercise.type]);

  return (
    <ThemedView style={styles.container}>
      {exercise.type !== "duration" && exercise.type !== "distance" && (
        <ThemedView style={styles.selectContainer}>
          <FancySelect
            label={`Weight (${weightUnit})`}
            value={weight || 0}
            options={weightOptions}
            onValueChange={(value) => onWeightChange(Number(value))}
            suffix={` ${weightUnit}`}
          />
        </ThemedView>
      )}

      {/* Show reps dropdown only if not duration type OR if duration type but timer is not active */}
      {(exercise.type !== "duration" || !countdown.isActive) && (
        <ThemedView style={styles.selectContainer}>
          <FancySelect
            label={repsLabel}
            value={reps || 0}
            options={repsOptions}
            onValueChange={(value) => onRepsChange(Number(value))}
            suffix={repsSuffix}
          />
        </ThemedView>
      )}

      {exercise.type === "duration" && !countdown.isActive && (
        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={countdown.start}
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </ThemedView>
      )}

      {exercise.type === "duration" && countdown.isActive && (
        <ThemedView style={styles.timerContainer}>
          <Text style={styles.timerText}>{countdown.formatTime()}</Text>
          <TouchableOpacity style={styles.stopButton} onPress={countdown.stop}>
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  selectContainer: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    paddingTop: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  startButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stopButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  timerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 16,
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
});
