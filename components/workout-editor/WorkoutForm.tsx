import { Alert, StyleSheet, TextInput, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

import { Exercise, Workout } from "@/validation/schemas";
import { ExerciseCard } from "./ExerciseCard";

interface WorkoutFormProps {
  workout: Workout;
  onWorkoutChange: (workout: Workout) => void;
  showTitle?: boolean;
}

export function WorkoutForm({
  workout,
  onWorkoutChange,
  showTitle = true,
}: WorkoutFormProps) {
  const placeholderTextColor = useThemeColor({}, "tabIconDefault");
  const textInputBackgroundColor = useThemeColor(
    { light: "rgba(74, 144, 226, 0.05)", dark: "rgba(255, 255, 255, 0.1)" },
    "background",
  );
  const textInputBorderColor = useThemeColor(
    { light: "rgba(74, 144, 226, 0.3)", dark: "rgba(255, 255, 255, 0.3)" },
    "tint",
  );
  const textInputTextColor = useThemeColor({}, "text");
  const handleTitleChange = (title: string) => {
    onWorkoutChange({ ...workout, title });
  };

  const handleDescriptionChange = (description: string) => {
    onWorkoutChange({ ...workout, description });
  };

  const handleAddExercise = () => {
    Alert.prompt(
      "Add Exercise",
      "Enter exercise name:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: (exerciseName: string | undefined) => {
            if (exerciseName?.trim()) {
              const newExercise: Exercise = {
                id: `${exerciseName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}-${Math.random()}`,
                name: exerciseName,
                target: {
                  sets: "1",
                  reps: "10",
                },
                muscle_group: "General",
                difficulty: "beginner",
                rest_seconds: 90,
                notes: undefined,
                video_url: undefined,
                type: "reps-sets",
              };
              onWorkoutChange({
                ...workout,
                exercises: [...workout.exercises, newExercise],
              });
            }
          },
        },
      ],
      "plain-text",
    );
  };

  const handleEditExercise = (exerciseIndex: number) => {
    const exercise = workout.exercises[exerciseIndex];

    Alert.alert("Edit Exercise", `Editing: ${exercise.name}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Edit Name",
        onPress: () => {
          Alert.prompt(
            "Exercise Name",
            "Enter new name:",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Save",
                onPress: (newName: string | undefined) => {
                  if (newName?.trim()) {
                    const updatedExercises = workout.exercises.map(
                      (ex, index) =>
                        index === exerciseIndex
                          ? { ...ex, name: newName.trim() }
                          : ex,
                    );
                    onWorkoutChange({
                      ...workout,
                      exercises: updatedExercises,
                    });
                  }
                },
              },
            ],
            "plain-text",
            exercise.name,
          );
        },
      },
      {
        text: "Edit Sets/Reps",
        onPress: () => {
          const currentSets = exercise.target.sets || "3";
          const currentReps = exercise.target.reps || "10";

          Alert.prompt(
            "Sets and Reps",
            "Enter sets (current: " + currentSets + "):",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Next",
                onPress: (sets: string | undefined) => {
                  const setsNum = parseInt(sets || "0");
                  if (setsNum > 0) {
                    Alert.prompt(
                      "Sets and Reps",
                      "Enter reps (current: " + currentReps + "):",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Save",
                          onPress: (reps: string | undefined) => {
                            const repsNum = parseInt(reps || "0");
                            if (repsNum > 0) {
                              const updatedExercises = workout.exercises.map(
                                (ex, index) =>
                                  index === exerciseIndex
                                    ? {
                                        ...ex,
                                        type: "reps-sets" as const,
                                        target: {
                                          ...ex.target,
                                          sets: setsNum.toString(),
                                          reps: repsNum.toString(),
                                        },
                                      }
                                    : ex,
                              );
                              onWorkoutChange({
                                ...workout,
                                exercises: updatedExercises,
                              });
                            }
                          },
                        },
                      ],
                      "plain-text",
                      currentReps,
                    );
                  }
                },
              },
            ],
            "plain-text",
            currentSets,
          );
        },
      },
    ]);
  };

  const handleDeleteExercise = (exerciseIndex: number) => {
    const exercise = workout.exercises[exerciseIndex];
    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete "${exercise.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedExercises = workout.exercises.filter(
              (_, index) => index !== exerciseIndex,
            );
            onWorkoutChange({ ...workout, exercises: updatedExercises });
          },
        },
      ],
    );
  };

  const textInputStyle = [
    styles.textInput,
    {
      backgroundColor: textInputBackgroundColor,
      borderColor: textInputBorderColor,
      color: textInputTextColor,
    },
  ];

  return (
    <ThemedView style={styles.form}>
      {showTitle && (
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Workout Title *</ThemedText>
          <TextInput
            style={textInputStyle}
            value={workout.title}
            onChangeText={handleTitleChange}
            placeholder="Enter workout title"
            placeholderTextColor={placeholderTextColor}
          />
        </ThemedView>
      )}

      <ThemedView style={styles.inputGroup}>
        <ThemedText style={styles.label}>Description</ThemedText>
        <TextInput
          style={[textInputStyle, styles.textArea]}
          value={workout.description ?? undefined}
          onChangeText={handleDescriptionChange}
          placeholder="Enter workout description (optional)"
          placeholderTextColor={placeholderTextColor}
          multiline
          numberOfLines={3}
        />
      </ThemedView>

      <ThemedView style={styles.exercisesSection}>
        <ThemedView style={styles.exercisesHeader}>
          <ThemedText type="subtitle">
            Exercises ({workout.exercises.length})
          </ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddExercise}
          >
            <ThemedText style={styles.addButtonText}>+ Add Exercise</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {workout.exercises.length === 0 ? (
          <ThemedView style={styles.emptyExercises}>
            <ThemedText style={styles.emptyText}>
              No exercises added yet. Tap &quot;Add Exercise&quot; to get
              started.
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.exercisesList}>
            {workout.exercises.map((exercise, index) => (
              <ExerciseCard
                key={`${exercise.id}-${index}`}
                exercise={exercise}
                onEdit={() => handleEditExercise(index)}
                onDelete={() => handleDeleteExercise(index)}
              />
            ))}
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 1)",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  exercisesSection: {
    gap: 16,
  },
  exercisesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
  },
  exercisesList: {
    gap: 12,
  },
  emptyExercises: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
  },
});
