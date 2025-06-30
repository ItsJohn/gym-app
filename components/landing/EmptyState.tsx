import { router } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import GymLogo from "../GymLogo";
import ParallaxScrollView from "../ParallaxScrollView";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

export const EmptyState = () => {
  const handleStartWorkout = useCallback(() => {
    router.push("/workout-editor");
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<GymLogo />}
    >
      <ThemedView style={styles.welcomeContainer}>
        <ThemedView style={styles.welcomeContent}>
          <ThemedText type="title" style={styles.welcomeTitle}>
            Welcome to Gym Sweat & Tears!
          </ThemedText>
          <ThemedText style={styles.welcomeDescription}>
            Ready to start your fitness journey? Create your first workout
            program to get started and track your progress.
          </ThemedText>

          <TouchableOpacity
            style={styles.createFirstWorkoutButton}
            onPress={handleStartWorkout}
          >
            <ThemedText style={styles.createFirstWorkoutText}>
              🏋️ Create Your First Workout
            </ThemedText>
          </TouchableOpacity>

          <ThemedView style={styles.welcomeFeatures}>
            <ThemedText style={styles.featuresTitle}>
              What you can do:
            </ThemedText>
            <ThemedView style={styles.featuresList}>
              <ThemedText style={styles.featureItem}>
                • Create custom workout routines
              </ThemedText>
              <ThemedText style={styles.featureItem}>
                • Track your sets, reps, and weights
              </ThemedText>
              <ThemedText style={styles.featureItem}>
                • Monitor your progress over time
              </ThemedText>
              <ThemedText style={styles.featureItem}>
                • View detailed workout history
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  welcomeContent: {
    alignItems: "center",
    maxWidth: 400,
  },
  welcomeTitle: {
    textAlign: "center",
    marginBottom: 16,
    color: "rgba(74, 144, 226, 1)",
  },
  welcomeDescription: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 32,
  },
  createFirstWorkoutButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createFirstWorkoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  welcomeFeatures: {
    alignItems: "center",
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "rgba(74, 144, 226, 1)",
  },
  featuresList: {
    alignItems: "flex-start",
  },
  featureItem: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 8,
    lineHeight: 22,
  },
});
