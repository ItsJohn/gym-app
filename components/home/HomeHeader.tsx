import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet } from "react-native";

export function HomeHeader() {
  return (
    <ThemedView style={styles.titleContainer}>
      <ThemedText type="title">Gym sweat & tears!</ThemedText>
      <ThemedText style={styles.subtitle}>
        Welcome back! Ready to crush your goals?
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: "center",
  },
});
