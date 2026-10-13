import { useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

import { DAYS_OF_WEEK, DAYS_OF_WEEK_SHORT } from "@/database/types";
import { Exercise, Workout } from "@/validation/schemas";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseEditModal } from "./ExerciseEditModal";

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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
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

  const handleDayChange = (day: string | null) => {
    onWorkoutChange({ ...workout, day_of_week: day });
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

  const handleSaveExercise = (updated: Exercise) => {
    if (editingIndex === null) return;
    onWorkoutChange({
      ...workout,
      exercises: workout.exercises.map((ex, index) =>
        index === editingIndex ? updated : ex,
      ),
    });
    setEditingIndex(null);
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

      <ThemedView style={styles.inputGroup}>
        <ThemedText style={styles.label}>Scheduled Day</ThemedText>
        <ThemedView style={styles.dayRow}>
          <TouchableOpacity
            style={[
              styles.dayChip,
              { borderColor: textInputBorderColor },
              !workout.day_of_week && styles.dayChipSelected,
            ]}
            onPress={() => handleDayChange(null)}
          >
            <ThemedText
              style={[
                styles.dayChipText,
                !workout.day_of_week && styles.dayChipTextSelected,
              ]}
            >
              Rest
            </ThemedText>
          </TouchableOpacity>
          {DAYS_OF_WEEK.map((day, index) => {
            const selected = workout.day_of_week === day;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayChip,
                  { borderColor: textInputBorderColor },
                  selected && styles.dayChipSelected,
                ]}
                onPress={() => handleDayChange(day)}
              >
                <ThemedText
                  style={[
                    styles.dayChipText,
                    selected && styles.dayChipTextSelected,
                  ]}
                >
                  {DAYS_OF_WEEK_SHORT[index]}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ThemedView>
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
                onEdit={() => setEditingIndex(index)}
                onDelete={() => handleDeleteExercise(index)}
              />
            ))}
          </ThemedView>
        )}
      </ThemedView>

      <ExerciseEditModal
        exercise={
          editingIndex === null ? null : workout.exercises[editingIndex]
        }
        onSave={handleSaveExercise}
        onClose={() => setEditingIndex(null)}
      />
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
  dayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dayChipSelected: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    borderColor: "rgba(74, 144, 226, 1)",
  },
  dayChipText: {
    fontSize: 14,
  },
  dayChipTextSelected: {
    color: "white",
    fontWeight: "600",
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
