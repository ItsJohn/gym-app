import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

interface WorkoutRenewalBannerProps {
  weeksOld: number;
}

export function WorkoutRenewalBanner({ weeksOld }: WorkoutRenewalBannerProps) {
  const handlePress = () => {
    router.push("/workout-editor?regenerate=true");
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Time for a new workout?</ThemedText>
        <ThemedText style={styles.message}>
          Your current workout is {weeksOld} weeks old. Consider generating a
          new program to keep progressing.
        </ThemedText>
      </ThemedView>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <ThemedText style={styles.buttonText}>Create New</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 24,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  content: {
    flex: 1,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 149, 0, 1)",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    opacity: 0.8,
  },
  button: {
    backgroundColor: "rgba(255, 149, 0, 1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
