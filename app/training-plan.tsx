import { ExerciseService } from "@/database/services/exerciseService";
import { TrainingPlanService } from "@/database/services/trainingPlanService";
import { WorkoutService } from "@/database/services/workoutService";
import GymLogo from "@/components/GymLogo";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GeminiService } from "@/services/geminiService";
import { trainingPlanKeys } from "@/hooks/useTrainingPlan";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

  const inputBackground = useThemeColor(
    { light: "rgba(74, 144, 226, 0.05)", dark: "rgba(255, 255, 255, 0.1)" },
    "background",
  );
  const inputBorder = useThemeColor(
    { light: "rgba(74, 144, 226, 0.3)", dark: "rgba(255, 255, 255, 0.2)" },
    "tint",
  );
  const inputText = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "tabIconDefault");

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

      const resolvedDays = planDays.map((day) => {
        const gymIndex = (day as any)._gym_workout_index;
        if (day.day_type === "gym" && gymIndex !== undefined) {
          return { ...day, workout_id: gymWorkoutIds[gymIndex] };
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
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<GymLogo />}
    >
      <ThemedView style={styles.container}>
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
          Tell AI your goal and it will build you a complete running + gym plan.
        </ThemedText>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBackground,
              borderColor: inputBorder,
              color: inputText,
            },
          ]}
          placeholder="e.g. I want to run a half marathon in 13 weeks and build strength"
          placeholderTextColor={placeholderColor}
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
            style={[styles.suggestionChip, { borderColor: inputBorder }]}
            onPress={() => setGoalText(s)}
            disabled={generating}
          >
            <ThemedText style={styles.suggestionText}>{s}</ThemedText>
          </TouchableOpacity>
        ))}

        <ThemedView style={[styles.infoBox, { borderColor: inputBorder }]}>
          <ThemedText style={styles.infoText}>
            The AI will create a progressive multi-week plan with easy runs,
            tempo runs, intervals, long runs, and runner-specific gym sessions.
            Your home screen will show what to do each day.
          </ThemedText>
        </ThemedView>

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
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 4, paddingBottom: 40 },
  backButton: { marginBottom: 8 },
  backText: { color: "#FF6B35", fontSize: 16 },
  title: { marginBottom: 4 },
  subtitle: { opacity: 0.7, fontSize: 15, marginBottom: 20, lineHeight: 22 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  suggestionsLabel: { opacity: 0.6, fontSize: 13, marginBottom: 8 },
  suggestionChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  suggestionText: { color: "#FF6B35", fontSize: 14 },
  infoBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  infoText: { opacity: 0.7, fontSize: 13, lineHeight: 20 },
  loadingContainer: { alignItems: "center", paddingVertical: 24 },
  statusText: { opacity: 0.6, marginTop: 12, fontSize: 14 },
  generateButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  generateButtonDisabled: { opacity: 0.4 },
  generateButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
