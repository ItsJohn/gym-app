import { router } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

import GymLogo from "@/components/GymLogo";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AIWorkoutCreator from "@/components/workout-editor/AIWorkoutCreator";
import { ProgramEditor } from "@/components/workout-editor/MultiWorkoutEditor";
import { ToggleCreationType } from "@/components/workout-editor/ToggleCreationType";
import { WorkoutForm } from "@/components/workout-editor/WorkoutForm";
import { useWorkoutEditor } from "@/hooks/useWorkoutEditor";

export default function WorkoutEditorScreen() {
  const {
    isEditing,
    workout,
    setWorkout,
    generatedWorkouts,
    setGeneratedWorkouts,
    isLoading,
    isSaving,
    isCreatingExercise,
    isDeletingExercise,
    isBusy,
    creationMode,
    setCreationMode,
    editMode,
    setEditMode,
    handleAIWorkoutProgramGenerated,
    handleSave,
  } = useWorkoutEditor();

  if (isLoading) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={<GymLogo />}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title">Loading...</ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<GymLogo />}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">
            {isEditing ? "Edit Workout" : "Create Workout"}
          </ThemedText>

          {!isEditing && (
            <ToggleCreationType
              creationMode={creationMode}
              setCreationMode={setCreationMode}
            />
          )}
        </ThemedView>

        {creationMode === "ai" ? (
          <AIWorkoutCreator
            onWorkoutProgramGenerated={handleAIWorkoutProgramGenerated}
            onCancel={() => setCreationMode("manual")}
          />
        ) : editMode === "program" ? (
          <ProgramEditor
            generatedWorkouts={generatedWorkouts}
            onCancel={() => {
              setEditMode("single");
              setGeneratedWorkouts([]);
            }}
          />
        ) : (
          <ThemedView style={styles.form}>
            <WorkoutForm
              workout={workout}
              onWorkoutChange={setWorkout}
              showTitle={true}
            />

            <ThemedView style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={router.back}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  isBusy && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={isBusy}
              >
                <ThemedText style={styles.saveButtonText}>
                  {isSaving
                    ? "Saving..."
                    : isCreatingExercise
                      ? "Creating..."
                      : isDeletingExercise
                        ? "Deleting..."
                        : isEditing
                          ? "Update"
                          : "Create"}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    gap: 16,
  },
  form: {
    gap: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  saveButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.7)",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
