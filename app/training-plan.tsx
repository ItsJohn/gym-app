import { ExerciseService } from "@/database/services/exerciseService";
import { TrainingPlanService } from "@/database/services/trainingPlanService";
import { WorkoutService } from "@/database/services/workoutService";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GeminiService } from "@/services/geminiService";
import { trainingPlanKeys } from "@/hooks/useTrainingPlan";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GOAL_SUGGESTIONS = [
  "Run a half marathon in 12 weeks",
  "Complete my first 5K in 8 weeks",
  "Run a half marathon in 16 weeks as a beginner",
  "Train for a 10K in 10 weeks",
];

export default function TrainingPlanScreen() {
  const [goalText, setGoalText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState("");
  const queryClient = useQueryClient();

  const handleGenerate = async () => {
    if (!goalText.trim()) {
      Alert.alert(
        "Enter a goal",
        "Please describe what you want to train for.",
      );
      return;
    }

    setGenerating(true);
    setStatus("Analysing your goal...");

    try {
      setStatus("Generating your training plan with AI...");
      const { response, planDays } = await GeminiService.generateTrainingPlan(
        goalText.trim(),
      );

      setStatus("Saving gym workouts...");
      // Save gym workouts and collect their IDs
      const gymWorkoutIds: number[] = [];
      for (const workout of response.gym_workouts) {
        const workoutId = await WorkoutService.createWorkout(workout);
        gymWorkoutIds.push(workoutId);
        for (const exercise of workout.exercises ?? []) {
          await ExerciseService.createExercise({
            ...exercise,
            workout_id: workoutId,
          });
        }
      }

      // Resolve gym_workout_index → actual workout_id
      const resolvedDays = planDays.map((day) => {
        const gymIndex = (day as any)._gym_workout_index;
        if (day.day_type === "gym" && gymIndex !== undefined) {
          return {
            ...day,
            workout_id: gymWorkoutIds[gymIndex],
          };
        }
        return day;
      });

      setStatus("Saving your training plan...");
      await TrainingPlanService.createPlan({
        name: response.plan_name,
        goal_text: goalText.trim(),
        total_weeks: response.total_weeks,
        days: resolvedDays,
      });

      await queryClient.invalidateQueries({ queryKey: trainingPlanKeys.all });

      setStatus("Done!");
      Alert.alert(
        "Plan Created!",
        `Your ${response.total_weeks}-week training plan is ready. Your home screen will now show today's workout — gym or run.`,
        [{ text: "Let's go!", onPress: () => router.back() }],
      );
    } catch (err) {
      Alert.alert(
        "Generation Failed",
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setGenerating(false);
      setStatus("");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backText}>← Back</ThemedText>
          </TouchableOpacity>

          <ThemedText type="title" style={styles.title}>
            Create Training Plan
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Tell AI your goal and it will build you a complete running + gym
            plan.
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="e.g. I want to run a half marathon in 12 weeks"
            placeholderTextColor="#888"
            value={goalText}
            onChangeText={setGoalText}
            multiline
            numberOfLines={3}
            editable={!generating}
          />

          <ThemedText style={styles.suggestionsLabel}>
            Try one of these:
          </ThemedText>
          {GOAL_SUGGESTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.suggestionChip}
              onPress={() => setGoalText(s)}
              disabled={generating}
            >
              <ThemedText style={styles.suggestionText}>{s}</ThemedText>
            </TouchableOpacity>
          ))}

          <View style={styles.infoBox}>
            <ThemedText style={styles.infoText}>
              The AI will create a progressive multi-week plan with easy runs,
              tempo runs, intervals, long runs, and runner-specific gym
              sessions. Your home screen will show what to do each day.
            </ThemedText>
          </View>

          {generating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <ThemedText style={styles.statusText}>{status}</ThemedText>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.generateButton,
                !goalText.trim() && styles.generateButtonDisabled,
              ]}
              onPress={handleGenerate}
              disabled={!goalText.trim()}
            >
              <ThemedText style={styles.generateButtonText}>
                Generate My Plan
              </ThemedText>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0a1a" },
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  backButton: { marginBottom: 16 },
  backText: { color: "#FF6B35", fontSize: 16 },
  title: { fontSize: 28, fontWeight: "bold", color: "white", marginBottom: 8 },
  subtitle: { color: "#aaa", fontSize: 15, marginBottom: 24, lineHeight: 22 },
  input: {
    backgroundColor: "#1a1a2e",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    padding: 16,
    color: "white",
    fontSize: 16,
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  suggestionsLabel: { color: "#888", fontSize: 13, marginBottom: 10 },
  suggestionChip: {
    backgroundColor: "#1a1a2e",
    borderWidth: 1,
    borderColor: "#FF6B3544",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  suggestionText: { color: "#FF6B35", fontSize: 14 },
  infoBox: {
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
    marginBottom: 24,
  },
  infoText: { color: "#aaa", fontSize: 13, lineHeight: 20 },
  loadingContainer: { alignItems: "center", paddingVertical: 24 },
  statusText: { color: "#aaa", marginTop: 12, fontSize: 14 },
  generateButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  generateButtonDisabled: { opacity: 0.4 },
  generateButtonText: { color: "white", fontSize: 17, fontWeight: "bold" },
});
