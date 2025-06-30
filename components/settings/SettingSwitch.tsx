import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, Switch } from "react-native";

interface SettingSwitchProps {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function SettingSwitch({
  title,
  description,
  value,
  onValueChange,
}: SettingSwitchProps) {
  const colorScheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.textContainer}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {description && (
          <ThemedText style={styles.description}>{description}</ThemedText>
        )}
      </ThemedView>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colorScheme === "dark" ? "#3e3e3e" : "#767577",
          true: "#4A90E2",
        }}
        thumbColor={value ? "#ffffff" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.1)",
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
});
