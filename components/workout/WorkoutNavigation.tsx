import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface WorkoutNavigationProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export default function WorkoutNavigation({
  canGoBack,
  canGoForward,
  onPrevious,
  onNext,
}: WorkoutNavigationProps) {
  return (
    <ThemedView style={styles.navigationContainer}>
      <TouchableOpacity
        style={[
          styles.navButton,
          styles.prevButton,
          !canGoBack && styles.navButtonDisabled,
        ]}
        onPress={onPrevious}
        disabled={!canGoBack}
      >
        <ThemedText
          style={[
            styles.navButtonText,
            !canGoBack && styles.navButtonTextDisabled,
          ]}
        >
          ← Previous
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navButton,
          styles.nextButton,
          !canGoForward && styles.nextButtonDisabled,
        ]}
        onPress={onNext}
        disabled={!canGoForward}
      >
        <ThemedText style={styles.navButtonText}>Next →</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  prevButton: {
    backgroundColor: "rgba(74, 144, 226, 0.2)",
  },
  nextButton: {
    backgroundColor: "#4A90E2",
  },
  nextButtonDisabled: {
    backgroundColor: "rgba(74, 144, 226, 0.3)",
  },
  navButtonDisabled: {
    backgroundColor: "rgba(74, 144, 226, 0.1)",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  navButtonTextDisabled: {
    color: "rgba(255, 255, 255, 0.5)",
  },
});
