import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  color = "rgba(74, 144, 226, 1)",
}: StatsCardProps) {
  return (
    <ThemedView style={styles.statsCard}>
      <ThemedView style={styles.cardContent}>
        <ThemedText style={styles.statsTitle}>{title}</ThemedText>
        <ThemedText style={[styles.statsValue, { color }]}>{value}</ThemedText>
        {subtitle && (
          <ThemedText style={styles.statsSubtitle}>{subtitle}</ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.08)",
  },
  cardContent: {
    padding: 20,
    backgroundColor: "rgba(74, 144, 226, 0.03)",
    alignItems: "center",
    minHeight: 100,
    justifyContent: "center",
  },
  statsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 0.8)",
    marginBottom: 8,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
    lineHeight: 32,
  },
  statsSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.6)",
    textAlign: "center",
    lineHeight: 14,
  },
});
