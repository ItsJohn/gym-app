import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Exercise } from "@/validation/schemas";
import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import CompleteButton from "./CompleteButton";
import SetHeader from "./SetHeader";
import SetInput from "./SetInput";

interface SetCardProps {
  setNumber: number;
  exercise: Exercise;
  weight?: number;
  reps?: number;
  isCompleted: boolean;
  isResting?: boolean;
  restTimeRemaining?: number;
  onWeightChange: (weight: number) => void;
  onRepsChange: (reps: number) => void;
  onComplete: () => void;
  onSkipRest?: () => void;
  weightUnit?: "kg" | "lbs";
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function SetCard({
  setNumber,
  exercise,
  weight,
  reps,
  isCompleted,
  isResting = false,
  restTimeRemaining,
  onWeightChange,
  onRepsChange,
  onComplete,
  onSkipRest,
  weightUnit = "kg",
}: SetCardProps) {
  const isCompleteButtonEnabled = useMemo(() => {
    if (exercise.type === "duration" || exercise.type === "distance") {
      return true;
    }
    return weight && weight > 0 && reps && reps > 0;
  }, [exercise.type, weight, reps]);

  return (
    <ThemedView
      style={[
        styles.setContainer,
        isCompleted && styles.completedSetContainer,
        isResting && styles.restingSetContainer,
      ]}
    >
      <SetHeader setNumber={setNumber} exercise={exercise} />

      {isResting && restTimeRemaining !== undefined ? (
        <ThemedView style={styles.restContainer}>
          <ThemedText style={styles.restTitle}>Rest Time</ThemedText>
          <ThemedText style={styles.restTimer}>
            {formatTime(restTimeRemaining)}
          </ThemedText>
          <ThemedText style={styles.restMessage}>
            Take a break before your next set
          </ThemedText>
          {onSkipRest && (
            <TouchableOpacity style={styles.skipButton} onPress={onSkipRest}>
              <ThemedText style={styles.skipButtonText}>Skip Rest</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      ) : (
        <ThemedView
          style={styles.setInputContainer}
          lightColor="transparent"
          darkColor="transparent"
        >
          <SetInput
            exercise={exercise}
            weight={weight}
            reps={reps}
            onComplete={onComplete}
            onWeightChange={onWeightChange}
            onRepsChange={onRepsChange}
            weightUnit={weightUnit}
          />

          <ThemedView style={styles.checkButtonWrapper}>
            <CompleteButton
              isCompleted={isCompleted}
              isEnabled={!!isCompleteButtonEnabled}
              onComplete={onComplete}
            />
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  setContainer: {
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.2)",
  },
  completedSetContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  restingSetContainer: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderColor: "rgba(255, 193, 7, 0.3)",
  },
  setInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  checkButtonWrapper: {
    justifyContent: "center",
    alignItems: "baseline",
    paddingTop: 25,
  },
  restContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  restTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF9800",
    marginBottom: 8,
  },
  restMessage: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 12,
  },
  skipButton: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  skipButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
