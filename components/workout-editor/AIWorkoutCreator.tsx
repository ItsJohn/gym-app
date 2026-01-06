import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { GeminiService } from "@/services/geminiService";
import {
  validateWorkoutGoals,
  Workout,
  WorkoutGoals,
} from "@/validation/schemas";
import { ExperienceButton } from "./ExperienceButton";

interface AIWorkoutCreatorProps {
  onWorkoutProgramGenerated: (workouts: Workout[]) => void;
  onCancel: () => void;
}

export default function AIWorkoutCreator({
  onWorkoutProgramGenerated,
  onCancel,
}: Readonly<AIWorkoutCreatorProps>) {
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

  const [goals, setGoals] = useState("Build muscle and strength");
  const [issues, setIssues] = useState("");
  const [experience, setExperience] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const [timeAvailable, setTimeAvailable] = useState("60");
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState("3");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!goals.trim()) {
      Alert.alert("Goals Required", "Please describe your fitness goals.");
      return;
    }

    const trainingDays = parseInt(trainingDaysPerWeek) || 3;
    if (trainingDays < 1 || trainingDays > 7) {
      Alert.alert(
        "Invalid Training Days",
        "Please enter a number between 1 and 7 for training days per week.",
      );
      return;
    }

    try {
      setIsGenerating(true);

      // Validate user input before sending to AI
      const workoutGoalsData = {
        goals: goals.trim(),
        issues: issues.trim() || undefined,
        experience,
        timeAvailable: parseInt(timeAvailable) || 60,
        equipment: ["dumbbells", "barbells", "machines", "cables"], // Default gym equipment
        trainingDaysPerWeek: trainingDays,
      };

      const validationResult = validateWorkoutGoals(workoutGoalsData);

      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors
          .map((err) => err.message)
          .join("\n");
        Alert.alert("Invalid Input", errorMessages);
        return;
      }

      const validatedGoals: WorkoutGoals = validationResult.data;

      // Generate workout program (always returns an array)
      const generatedWorkouts =
        await GeminiService.generateWorkoutProgram(validatedGoals);

      if (generatedWorkouts.length === 0) {
        Alert.alert(
          "Generation Failed",
          "No workouts were generated. Please try again.",
        );
        return;
      }

      // Show preview for workout program
      const totalWorkouts = generatedWorkouts.length;
      const workoutTitles = generatedWorkouts
        .map((w, i) => `${i + 1}. ${w.title}`)
        .join("\n");

      const programName =
        trainingDays === 1 ? "Workout Program" : `${trainingDays}-Day Program`;

      Alert.alert(
        "Workout Program Generated!",
        `Generated ${totalWorkouts} workout${totalWorkouts > 1 ? "s" : ""} for your ${programName}:\n\n${workoutTitles}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Use This Program",
            onPress: () => onWorkoutProgramGenerated(generatedWorkouts),
          },
        ],
      );
    } catch (error) {
      console.error("Error generating workout program:", error);
      Alert.alert(
        "Generation Failed",
        error instanceof Error
          ? error.message
          : "Failed to generate workout program. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  }, [
    goals,
    issues,
    experience,
    timeAvailable,
    trainingDaysPerWeek,
    onWorkoutProgramGenerated,
  ]);

  const textInputStyle = [
    styles.textInput,
    {
      backgroundColor: textInputBackgroundColor,
      borderColor: textInputBorderColor,
      color: textInputTextColor,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            🤖 AI Workout Program Generator
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Tell me about your goals and I&apos;ll create a personalized workout
            program for you!
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Your Fitness Goals *</ThemedText>
            <ThemedText style={styles.hint}>
              e.g., &quot;Build muscle and strength&quot;, &quot;Lose weight and
              tone up&quot;, &quot;Improve endurance&quot;
            </ThemedText>
            <TextInput
              style={[textInputStyle, styles.textArea]}
              value={goals}
              onChangeText={setGoals}
              placeholder="Describe what you want to achieve..."
              placeholderTextColor={placeholderTextColor}
              multiline
              numberOfLines={3}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Physical Issues or Limitations
            </ThemedText>
            <ThemedText style={styles.hint}>
              e.g., &quot;Lower back pain&quot;, &quot;Knee injury&quot;,
              &quot;Shoulder mobility issues&quot;
            </ThemedText>
            <TextInput
              style={[textInputStyle, styles.textArea]}
              value={issues}
              onChangeText={setIssues}
              placeholder="Any injuries, pain, or limitations? (optional)"
              placeholderTextColor={placeholderTextColor}
              multiline
              numberOfLines={2}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Experience Level</ThemedText>
            <ThemedView style={styles.experienceButtons}>
              <ExperienceButton
                level="beginner"
                selected={experience === "beginner"}
                onPress={() => setExperience("beginner")}
              />
              <ExperienceButton
                level="intermediate"
                selected={experience === "intermediate"}
                onPress={() => setExperience("intermediate")}
              />
              <ExperienceButton
                level="advanced"
                selected={experience === "advanced"}
                onPress={() => setExperience("advanced")}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Training Days Per Week</ThemedText>
            <ThemedText style={styles.hint}>
              How many days per week do you want to train? (1-7 days)
            </ThemedText>
            <TextInput
              style={textInputStyle}
              value={trainingDaysPerWeek}
              onChangeText={setTrainingDaysPerWeek}
              placeholder="3"
              placeholderTextColor={placeholderTextColor}
              keyboardType="numeric"
              maxLength={1}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Time Available (minutes)
            </ThemedText>
            <ThemedText style={styles.hint}>
              How long do you want each workout session to be?
            </ThemedText>
            <TextInput
              style={textInputStyle}
              value={timeAvailable}
              onChangeText={setTimeAvailable}
              placeholder="60"
              placeholderTextColor={placeholderTextColor}
              keyboardType="numeric"
            />
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.generateButton,
              isGenerating && styles.disabledButton,
            ]}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            <ThemedText style={styles.generateButtonText}>
              {isGenerating ? "🤖 Generating..." : "✨ Generate Program"}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.disclaimer}>
          <ThemedText style={styles.disclaimerText}>
            💡 The AI will create a complete workout program based on your
            training frequency. Whether you train 1 day or 7 days per week,
            you&apos;ll get a structured program tailored to your goals. Always
            consult with a healthcare professional before starting any new
            exercise program.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    textAlign: "center",
    color: "rgba(74, 144, 226, 1)",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
    paddingHorizontal: 16,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 1)",
  },
  hint: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: "italic",
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
  experienceButtons: {
    flexDirection: "column",
    gap: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    alignItems: "stretch",
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  generateButton: {
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
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  disclaimer: {
    padding: 16,
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.3)",
  },
  disclaimerText: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 16,
  },
});
