import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useProgressAnalysis } from "@/hooks";
import { WorkoutAnalysis } from "@/validation/schemas";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const ON_TRACK_LABEL: Record<WorkoutAnalysis["onTrack"], string> = {
  ahead: "🚀 Ahead",
  "on-track": "✅ On track",
  behind: "⚠️ Behind",
  unclear: "🤔 Unclear",
};

function AnalysisSection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {items.map((item, i) => (
        <ThemedText key={i} style={styles.bullet}>
          {"•"} {item}
        </ThemedText>
      ))}
    </View>
  );
}

export function ProgressAnalysisCard() {
  const { goal, hasData, result, analyze, isAnalyzing, error } =
    useProgressAnalysis();

  if (!hasData) return null;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Progress Analyser
      </ThemedText>
      {goal && (
        <ThemedText style={styles.goal} numberOfLines={2}>
          Goal: {goal}
        </ThemedText>
      )}

      {result && (
        <ThemedView style={styles.card}>
          <View style={styles.resultHeader}>
            <ThemedText style={styles.onTrack}>
              {ON_TRACK_LABEL[result.analysis.onTrack]}
            </ThemedText>
            <ThemedText style={styles.score}>
              {result.analysis.score}/100
            </ThemedText>
          </View>
          <ThemedText style={styles.summary}>
            {result.analysis.summary}
          </ThemedText>
          <AnalysisSection
            title="Strengths"
            items={result.analysis.strengths}
          />
          <AnalysisSection title="Concerns" items={result.analysis.concerns} />
          <AnalysisSection
            title="Suggestions"
            items={result.analysis.suggestions}
          />
          <ThemedText style={styles.timestamp}>
            Analysed {new Date(result.analyzedAt).toLocaleDateString()}
          </ThemedText>
        </ThemedView>
      )}

      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      <TouchableOpacity
        style={[styles.button, isAnalyzing && styles.buttonDisabled]}
        onPress={() => analyze()}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>
            {result ? "Re-analyse my progress" : "Analyse my progress"}
          </ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    color: "rgba(74, 144, 226, 1)",
    marginBottom: 4,
  },
  goal: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.08)",
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  onTrack: {
    fontSize: 16,
    fontWeight: "700",
  },
  score: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(74, 144, 226, 1)",
  },
  summary: {
    fontSize: 14,
    marginBottom: 8,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  bullet: {
    fontSize: 13,
    opacity: 0.85,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 10,
  },
  error: {
    color: "#d9534f",
    fontSize: 13,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
