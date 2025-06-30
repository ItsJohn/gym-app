import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

import GymLogo from "@/components/GymLogo";
import { EmptyState } from "@/components/history/EmptyState";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SessionService } from "@/database/services/sessionService";
import { WorkoutSession } from "@/database/types";

interface SessionCardProps {
  session: WorkoutSession & { workout_title?: string };
  onPress: () => void;
}

function SessionCard({ session, onPress }: SessionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return "In progress";

    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const isCompleted = session.is_completed;

  return (
    <TouchableOpacity style={styles.sessionCard} onPress={onPress}>
      <ThemedView style={styles.sessionCardContent}>
        <ThemedView style={styles.sessionHeader}>
          <ThemedText type="subtitle" style={styles.sessionTitle}>
            {session.workout_title || "Unknown Workout"}
          </ThemedText>
          <ThemedView
            style={[
              styles.statusBadge,
              isCompleted ? styles.completedBadge : styles.incompleteBadge,
            ]}
          >
            <ThemedText
              style={[
                styles.statusText,
                isCompleted ? styles.completedText : styles.incompleteText,
              ]}
            >
              {isCompleted ? "Completed" : "Incomplete"}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.sessionDetails}>
          <ThemedText style={styles.sessionDate}>
            {formatDate(session.started_at)}
          </ThemedText>
          <ThemedText style={styles.sessionDuration}>
            Duration: {formatDuration(session.started_at, session.completed_at)}
          </ThemedText>
          {session.notes && (
            <ThemedText style={styles.sessionNotes}>{session.notes}</ThemedText>
          )}
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

function StatsCard({
  title,
  value,
  subtitle,
  color = "rgba(74, 144, 226, 1)",
}: StatsCardProps) {
  return (
    <ThemedView style={styles.statsCard}>
      <ThemedText style={styles.statsTitle}>{title}</ThemedText>
      <ThemedText style={[styles.statsValue, { color }]}>{value}</ThemedText>
      {subtitle && (
        <ThemedText style={styles.statsSubtitle}>{subtitle}</ThemedText>
      )}
    </ThemedView>
  );
}

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<
    (WorkoutSession & { workout_title?: string })[]
  >([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    totalDuration: 0,
    averageDuration: 0,
    totalWorkouts: 0,
    currentStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load sessions with workout titles
      const allSessions = await SessionService.getRecentSessions(100); // Get more sessions
      const sessionsWithTitles = await Promise.all(
        allSessions.map(async (session: WorkoutSession) => {
          try {
            const sessionDetails = await SessionService.getSessionWithDetails(
              session.id,
            );
            return {
              ...session,
              workout_title:
                sessionDetails?.workout?.title || "Unknown Workout",
            };
          } catch (err) {
            console.error(
              "Error loading workout for session:",
              session.id,
              err,
            );
            return {
              ...session,
              workout_title: "Unknown Workout",
            };
          }
        }),
      );

      setSessions(sessionsWithTitles);

      // Calculate stats
      const totalSessions = allSessions.length;
      const completedSessions = allSessions.filter(
        (s: WorkoutSession) => s.is_completed,
      ).length;

      // Calculate total duration from completed sessions
      let totalDurationMs = 0;
      allSessions.forEach((s: WorkoutSession) => {
        if (s.is_completed && s.completed_at) {
          const start = new Date(s.started_at);
          const end = new Date(s.completed_at);
          totalDurationMs += end.getTime() - start.getTime();
        }
      });

      const totalDuration = Math.floor(totalDurationMs / (1000 * 60)); // Convert to minutes
      const averageDuration =
        completedSessions > 0
          ? Math.round(totalDuration / completedSessions)
          : 0;

      // Get unique workout count
      const uniqueWorkoutIds = new Set(
        allSessions.map((s: WorkoutSession) => s.workout_id),
      );
      const totalWorkouts = uniqueWorkoutIds.size;

      // Calculate current streak (simplified - consecutive days with completed sessions)
      let currentStreak = 0;
      const today = new Date();
      const completedSessionsByDate = allSessions
        .filter((s: WorkoutSession) => s.is_completed)
        .sort(
          (a: WorkoutSession, b: WorkoutSession) =>
            new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
        );

      for (let i = 0; i < completedSessionsByDate.length; i++) {
        const sessionDate = new Date(completedSessionsByDate[i].started_at);
        const daysDiff = Math.floor(
          (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysDiff === i) {
          currentStreak++;
        } else {
          break;
        }
      }

      setStats({
        totalSessions,
        completedSessions,
        totalDuration,
        averageDuration,
        totalWorkouts,
        currentStreak,
      });
    } catch (err) {
      console.error("Error loading history data:", err);
      setError("Failed to load history data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSessionPress = async (
    session: WorkoutSession & { workout_title?: string },
  ) => {
    try {
      // Get detailed session data including sets
      const sessionSets = await SessionService.getSetsBySessionId(session.id);

      Alert.alert(
        "Session Details",
        `Workout: ${session.workout_title || "Unknown"}
Start: ${new Date(session.started_at).toLocaleString()}
${session.completed_at ? `End: ${new Date(session.completed_at).toLocaleString()}` : "Not finished"}
Status: ${session.is_completed ? "Completed" : "In Progress"}
Sets Completed: ${sessionSets.filter((set) => set.is_completed).length}/${sessionSets.length}
${session.notes ? `Notes: ${session.notes}` : ""}`,
        [{ text: "OK" }],
      );
    } catch (err) {
      console.error("Error loading session details:", err);
      Alert.alert("Error", "Failed to load session details");
    }
  };

  if (isLoading) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={<GymLogo />}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title">Loading...</ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  if (error) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={<GymLogo />}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title">Error</ThemedText>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<GymLogo />}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Workout History</ThemedText>
        </ThemedView>

        {/* Statistics */}
        <ThemedView style={styles.statsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Your Progress
          </ThemedText>
          <ThemedView style={styles.statsGrid}>
            <StatsCard
              title="Total Sessions"
              value={stats.totalSessions}
              subtitle="Workouts"
              color="#4CAF50"
            />
            <StatsCard
              title="Completed"
              value={stats.completedSessions}
              subtitle={`${stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}% success`}
              color="#2196F3"
            />
            <StatsCard
              title="Total Time"
              value={formatDuration(stats.totalDuration)}
              subtitle="Training"
              color="#FF9800"
            />
            <StatsCard
              title="Avg Duration"
              value={formatDuration(stats.averageDuration)}
              subtitle="Per session"
              color="#E91E63"
            />
            <StatsCard
              title="Current Streak"
              value={stats.currentStreak}
              subtitle="Days"
              color="#9C27B0"
            />
            <StatsCard
              title="Workouts"
              value={stats.totalWorkouts}
              subtitle="Created"
              color="#9C27B0"
            />
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.sessionsSection}>
          {stats.totalWorkouts === 0 || sessions.length === 0 ? (
            <EmptyState hasWorkout={stats.totalWorkouts === 0} />
          ) : (
            <>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Recent Sessions
              </ThemedText>
              <ThemedView style={styles.sessionsList}>
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onPress={() => handleSessionPress(session)}
                  />
                ))}
              </ThemedView>
            </>
          )}
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    color: "rgba(74, 144, 226, 1)",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statsCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.1)",
    alignItems: "center",
  },
  statsTitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
    textAlign: "center",
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
  },
  sessionsSection: {
    flex: 1,
  },
  sessionsList: {
    gap: 12,
  },
  sessionCard: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionCardContent: {
    padding: 16,
    backgroundColor: "rgba(74, 144, 226, 0.05)",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sessionTitle: {
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  incompleteBadge: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  completedText: {
    color: "#4CAF50",
  },
  incompleteText: {
    color: "#FF9800",
  },
  sessionDetails: {
    gap: 4,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(74, 144, 226, 1)",
  },
  sessionDuration: {
    fontSize: 14,
    opacity: 0.8,
  },
  sessionNotes: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: "italic",
  },
  errorText: {
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "rgba(74, 144, 226, 1)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
