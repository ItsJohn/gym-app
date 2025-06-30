import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Exercise } from "@/validation/schemas";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";

interface SetHeaderProps {
  setNumber: number;
  exercise: Exercise;
}

export default function SetHeader({ setNumber, exercise }: SetHeaderProps) {
  const targetText = useMemo(() => {
    switch (exercise.type) {
      case "reps":
        return `Target: ${exercise.target.reps} reps`;
      case "reps-sets":
        return `Target: ${exercise.target.sets} sets of ${exercise.target.reps} reps`;
      case "reps-per-side":
        return `Target: ${exercise.target.per_side} reps per side`;
      case "duration":
        return `Target: ${exercise.target.duration}s duration`;
      case "distance":
        return `Target: ${exercise.target.distance}m distance`;
      default:
        return "";
    }
  }, [exercise.type, exercise.target]);

  return (
    <ThemedView
      style={styles.setHeader}
      lightColor="transparent"
      darkColor="transparent"
    >
      <ThemedText style={styles.setNumber}>Set {setNumber}</ThemedText>
      <ThemedText style={styles.setTarget}>{targetText}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  setHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: "600",
  },
  setTarget: {
    fontSize: 14,
    opacity: 0.7,
  },
});
