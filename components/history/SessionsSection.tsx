import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Session } from "@/validation/session";
import { EmptyState } from "./EmptyState";
import { SessionCard } from "./SessionCard";

interface SessionWithTitle extends Session {
  workout_title?: string;
}

interface SessionsSectionProps {
  sessions: SessionWithTitle[];
  totalWorkouts: number;
  onSessionPress: (session: SessionWithTitle) => void;
}

export function SessionsSection({
  sessions,
  totalWorkouts,
  onSessionPress,
}: SessionsSectionProps) {
  if (totalWorkouts === 0 || sessions.length === 0) {
    return <EmptyState hasWorkout={totalWorkouts === 0} />;
  }

  return (
    <ThemedView style={styles.sessionsSection}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Recent Sessions
      </ThemedText>
      <ThemedView style={styles.sessionsList}>
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onPress={() => onSessionPress(session)}
          />
        ))}
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
