import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RunSession } from "@/database/types";
import { HistoryFeedItem } from "@/hooks/useHistoryData";
import { Session } from "@/validation/session";
import { EmptyState } from "./EmptyState";
import { RunSessionCard } from "./RunSessionCard";
import { SessionCard } from "./SessionCard";

interface SessionsSectionProps {
  items: HistoryFeedItem[];
  totalWorkouts: number;
  onSessionPress: (session: Session) => void;
  onRunPress: (run: RunSession) => void;
}

export function SessionsSection({
  items,
  totalWorkouts,
  onSessionPress,
  onRunPress,
}: SessionsSectionProps) {
  if (items.length === 0) {
    return <EmptyState hasWorkout={totalWorkouts === 0} />;
  }

  return (
    <ThemedView style={styles.sessionsSection}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Recent Sessions
      </ThemedText>
      <ThemedView style={styles.sessionsList}>
        {items.map((item) =>
          item.kind === "run" ? (
            <RunSessionCard
              key={`run-${item.run.id}`}
              run={item.run}
              onPress={() => onRunPress(item.run)}
            />
          ) : (
            <SessionCard
              key={`session-${item.session.id}`}
              session={item.session}
              onPress={() => onSessionPress(item.session)}
            />
          ),
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sessionsSection: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 16,
    color: "rgba(74, 144, 226, 1)",
  },
  sessionsList: {
    gap: 12,
  },
});
