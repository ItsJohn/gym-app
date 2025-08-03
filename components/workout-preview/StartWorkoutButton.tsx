import { router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useCreateSession, useInitializeSessionSets } from "@/hooks";

export default function StartWorkoutButton() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const { mutateAsync: createSession, isPending: isCreatingSession } =
    useCreateSession();
  const {
    mutateAsync: initializeSessionSets,
    isPending: isInitializingSessionSets,
  } = useInitializeSessionSets();

  const handleInitializeSession = useCallback(async () => {
    const sessionId = await createSession({
      workout_id: parseInt(workoutId),
      notes: "Started workout session",
      is_completed: false,
    });

    await initializeSessionSets({ sessionId, workoutId: parseInt(workoutId) });

    return sessionId;
  }, [createSession, initializeSessionSets, workoutId]);

  const handlePress = useCallback(async () => {
    const sessionId = await handleInitializeSession();
    router.push({
      pathname: "/workout",
      params: { workoutId, sessionId },
    });
  }, [workoutId, handleInitializeSession]);

  return (
    <TouchableOpacity
      style={styles.startButton}
      onPress={handlePress}
      disabled={isCreatingSession || isInitializingSessionSets}
      activeOpacity={0.8}
    >
      <ThemedText type="title" style={styles.startButtonText}>
        🔥 Start Workout
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  startButton: {
    backgroundColor: "darkgreen",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: "white",
    fontSize: 20,
  },
});
