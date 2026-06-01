import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, View } from "react-native";

export default function RestDayCard() {
  return (
    <View style={styles.card}>
      <ThemedText style={styles.icon}>😴</ThemedText>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Rest Day</ThemedText>
        <ThemedText style={styles.subtitle}>
          Recovery is part of training. Take it easy today.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#333",
  },
  icon: { fontSize: 32, marginRight: 14 },
  content: { flex: 1 },
  title: { fontSize: 18, fontWeight: "bold", color: "#aaa", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#666" },
});
