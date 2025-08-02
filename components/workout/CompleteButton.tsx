import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, TouchableOpacity } from "react-native";

interface CompleteButtonProps {
  isCompleted: boolean;
  isEnabled: boolean;
  onComplete: () => void;
}

export default function CompleteButton({
  isCompleted,
  isEnabled,
  onComplete,
}: CompleteButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.checkButton,
        styles.checkButtonDisabled,
        isCompleted && styles.checkButtonCompleted,
      ]}
      onPress={onComplete}
      disabled={!isEnabled}
      activeOpacity={0.7}
    >
      <ThemedText
        style={[
          styles.checkIcon,
          styles.checkIconDisabled,
          isCompleted && styles.checkIconCompleted,
        ]}
      >
        ✓
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderWidth: 1.5,
    borderColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  checkButtonCompleted: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
    transform: [{ scale: 1.02 }],
  },
  checkButtonDisabled: {
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderColor: "rgba(74, 144, 226, 0.3)",
    shadowOpacity: 0,
    elevation: 0,
  },
  checkIcon: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  checkIconCompleted: {
    color: "white",
    fontSize: 20,
  },
  checkIconDisabled: {
    color: "rgba(74, 144, 226, 0.4)",
  },
});
