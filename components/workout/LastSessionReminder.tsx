import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLastSessionDataForExercise } from "@/hooks";
import { Exercise } from "@/validation/schemas";
import { StyleSheet } from "react-native";

interface LastSessionReminderProps {
  workoutId: number;
  exercise: Exercise;
  weightUnit?: "kg" | "lbs";
}

export default function LastSessionReminder({
  workoutId,
  exercise,
  weightUnit = "kg",
}: LastSessionReminderProps) {
  const { data: lastSessionData, isLoading } = useLastSessionDataForExercise(
    workoutId,
    exercise.id!,
  );

  if (isLoading || !lastSessionData) {
    return null;
  }

  const { weight, reps, distance } = lastSessionData;
  const hasData = weight || reps || distance;

  if (!hasData) {
    return null;
  }

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case "distance":
        const km = value / 1000;
        return `${km}km`;
      case "duration":
        return `${value}s`;
      default:
        return value.toString();
    }
  };

  const getReminderText = () => {
    const parts: string[] = [];

    if (weight) {
      parts.push(`${weight}${weightUnit}`);
    }

    if (reps) {
      parts.push(`${reps} reps`);
    }

    if (distance) {
      parts.push(formatValue(distance, "distance"));
    }

    return parts.join(" • ");
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>Last session minimum:</ThemedText>
      <ThemedText style={styles.value}>{getReminderText()}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderColor: "rgba(255, 193, 7, 0.3)",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF9800",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});
