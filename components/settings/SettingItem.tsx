import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface SettingItemProps {
  title: string;
  description?: string;
  value?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}

export default function SettingItem({
  title,
  description,
  value,
  onPress,
  children,
}: SettingItemProps) {
  const content = (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.textContainer}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {description && (
          <ThemedText style={styles.description}>{description}</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.valueContainer}>
        {value && <ThemedText style={styles.value}>{value}</ThemedText>}
        {children}
      </ThemedView>
    </ThemedView>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 12,
  },
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
  valueContainer: {
    alignItems: "flex-end",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A90E2",
  },
});
