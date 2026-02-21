import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Exercise } from "@/validation/schemas";

interface ExerciseListItemProps {
  exercise: Exercise;
  index: number;
}

export default function ExerciseListItem({
  exercise,
  index,
}: ExerciseListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const targetText = useMemo(() => {
    if (exercise.type === "reps") {
      if (exercise.target.reps?.includes("AMRAP")) {
        return exercise.target.reps;
      }
      return `${exercise.target.reps} reps`;
    }
    if (exercise.type === "reps-sets") {
      if (exercise.target.reps?.includes("AMRAP")) {
        return `${exercise.target.sets} sets × ${exercise.target.reps}`;
      }
      return `${exercise.target.sets} sets × ${exercise.target.reps} reps`;
    }
    if (exercise.type === "reps-per-side") {
      return `${exercise.target.sets} sets × ${exercise.target.per_side} reps per side`;
    }
    if (exercise.type === "duration") {
      return `${exercise.target.duration} seconds`;
    }
    if (exercise.type === "distance") {
      return `${exercise.target.distance} meters`;
    }
    return "";
  }, [exercise]);

  const handleVideoPress = () => {
    if (exercise.video_url) {
      Linking.openURL(exercise.video_url);
    }
  };

  return (
    <View style={styles.exerciseCard}>
      <Pressable onPress={() => setIsExpanded(!isExpanded)}>
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseNumber}>
            <ThemedText style={styles.exerciseNumberText}>
              {index + 1}
            </ThemedText>
          </View>
          <View style={styles.exerciseInfo}>
            <ThemedText type="defaultSemiBold" style={styles.exerciseName}>
              {exercise.name}
            </ThemedText>
            <ThemedText style={styles.exerciseTarget}>{targetText}</ThemedText>
          </View>
          {(exercise.notes || exercise.video_url || exercise.muscle_group) && (
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="#666"
              style={styles.expandIcon}
            />
          )}
        </View>
      </Pressable>

      {isExpanded && (
        <View style={styles.expandedContent}>
          {exercise.muscle_group && (
            <View style={styles.notesContainer}>
              <ThemedText style={styles.notesLabel}>Muscle Group:</ThemedText>
              <ThemedText style={styles.notesText}>
                {exercise.muscle_group}
              </ThemedText>
            </View>
          )}
          {exercise.notes && (
            <View style={styles.notesContainer}>
              <ThemedText style={styles.notesLabel}>Notes:</ThemedText>
              <ThemedText style={styles.notesText}>{exercise.notes}</ThemedText>
            </View>
          )}
          {exercise.video_url && (
            <Pressable onPress={handleVideoPress} style={styles.videoButton}>
              <Ionicons name="videocam" size={20} color="white" />
              <ThemedText style={styles.videoButtonText}>Watch Demo</ThemedText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: "rgba(161, 206, 220, 0.1)",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  exerciseNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4A90E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  exerciseNumberText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    marginBottom: 4,
  },
  exerciseTarget: {
    fontSize: 14,
    opacity: 0.7,
  },
  expandIcon: {
    marginLeft: 8,
  },
  expandedContent: {
    padding: 16,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  notesContainer: {
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    opacity: 0.8,
  },
  videoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    marginBottom: 12,
  },
  videoButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
  },
});
