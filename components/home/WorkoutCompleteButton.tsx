import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Workout } from "@/validation/schemas";

interface WorkoutCompleteButtonProps {
  workout: Workout;
}

export const WorkoutCompleteButton = ({
  workout,
}: WorkoutCompleteButtonProps) => {
  const handlePress = () => {
    router.push({
      pathname: "/(tabs)/history",
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <ThemedText style={styles.icon}>🎉</ThemedText>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <ThemedText type="title" style={styles.title}>
              Workout Complete!
            </ThemedText>
            <View style={styles.completedBadge}>
              <ThemedText style={styles.completedText}>DONE</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.workoutTitle}>{workout.title}</ThemedText>
          <ThemedText style={styles.workoutTime}>
            {workout.description}
          </ThemedText>

          <View style={styles.actionRow}>
            <ThemedText style={styles.actionText}>
              View your progress
            </ThemedText>
            <ThemedText style={styles.arrow}>→</ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    shadowOpacity: 0.3,
    elevation: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  completedBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  workoutTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    opacity: 0.9,
  },
  workoutTime: {
    color: "white",
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
  },
  arrow: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
