import { StyleSheet } from "react-native";

import GymLogo from "@/components/GymLogo";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import SingleExerciseStep from "@/components/workout/SingleExerciseStep";
import WorkoutComplete from "@/components/workout/WorkoutComplete";
import WorkoutProgressBar from "@/components/workout/WorkoutProgressBar";
import { useWorkoutSession } from "@/hooks/useWorkoutSession";

export default function WorkoutScreen() {
  const {
    workoutId,
    workout,
    exerciseList,
    isLoading,
    currentStepIndex,
    currentStep,
    sessionSteps,
    showDescription,
    setShowDescription,
    canGoBack,
    canGoForward,
    handleSetValueChange,
    handleSetComplete,
    handlePrevious,
    handleNext,
    finishWorkout,
  } = useWorkoutSession();

  if (!workoutId) {
    return (
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">No workout ID</ThemedText>
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={<GymLogo />}
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Loading Workout...</ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<GymLogo />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.workoutTitle}>
          {workout?.title || "Workout Session"}
        </ThemedText>
        {workout?.description && (
          <ThemedText style={styles.workoutDescription}>
            {workout.description}
          </ThemedText>
        )}
      </ThemedView>

      <WorkoutProgressBar
        currentStep={currentStepIndex}
        totalSteps={sessionSteps.length}
      />

      {currentStep?.type === "exercise" && exerciseList![currentStepIndex] && (
        <SingleExerciseStep
          key={`${currentStepIndex}-${exerciseList![currentStepIndex].name}`}
          exercise={exerciseList![currentStepIndex]}
          showDescription={showDescription}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onToggleDescription={() => setShowDescription(!showDescription)}
          onSetValueChange={handleSetValueChange}
          onSetComplete={handleSetComplete}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}

      {currentStep?.type === "complete" && (
        <WorkoutComplete onFinish={finishWorkout} />
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  workoutTitle: {
    textAlign: "center",
  },
  workoutDescription: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    color: "#ff6b6b",
    marginTop: 8,
  },
});
