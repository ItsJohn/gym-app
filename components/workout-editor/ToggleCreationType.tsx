import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

interface ToggleCreationTypeProps {
  creationMode: "ai" | "manual" | "training-plan";
  setCreationMode: (mode: "ai" | "manual" | "training-plan") => void;
}

export const ToggleCreationType = ({
  creationMode,
  setCreationMode,
}: ToggleCreationTypeProps) => {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.modeSelector}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            creationMode === "ai" && styles.modeButtonActive,
          ]}
          onPress={() => setCreationMode("ai")}
        >
          <ThemedText
            style={[
              styles.modeButtonText,
              creationMode === "ai" && styles.modeButtonTextActive,
            ]}
          >
            🤖 AI Workout
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            creationMode === "manual" && styles.modeButtonActive,
          ]}
          onPress={() => setCreationMode("manual")}
        >
          <ThemedText
            style={[
              styles.modeButtonText,
              creationMode === "manual" && styles.modeButtonTextActive,
            ]}
          >
            ✏️ Manual
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <TouchableOpacity
        style={[
          styles.trainingPlanButton,
          creationMode === "training-plan" && styles.trainingPlanButtonActive,
        ]}
        onPress={() => setCreationMode("training-plan")}
      >
        <ThemedText
          style={[
            styles.trainingPlanText,
            creationMode === "training-plan" && styles.trainingPlanTextActive,
          ]}
        >
          🗓️ Training Plan (Running + Gym)
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  modeSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: "rgba(74, 144, 226, 1)",
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 1)",
  },
  modeButtonTextActive: {
    color: "white",
  },
  trainingPlanButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 53, 0.3)",
  },
  trainingPlanButtonActive: {
    backgroundColor: "rgba(255, 107, 53, 1)",
    borderColor: "rgba(255, 107, 53, 1)",
  },
  trainingPlanText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 107, 53, 1)",
  },
  trainingPlanTextActive: {
    color: "white",
  },
});
