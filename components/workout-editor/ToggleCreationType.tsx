import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

interface ToggleCreationTypeProps {
  creationMode: "ai" | "manual";
  setCreationMode: (mode: "ai" | "manual") => void;
}

export const ToggleCreationType = ({
  creationMode,
  setCreationMode,
}: ToggleCreationTypeProps) => {
  return (
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
          🤖 AI Generated
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
  );
};

const styles = StyleSheet.create({
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
});
