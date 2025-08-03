import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Session } from "@/validation/session";

interface ContinueWorkoutButtonProps {
  session: Session;
}

export default function ContinueWorkoutButton({
  session,
}: ContinueWorkoutButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]),
    );

    pulseAnimation.start();
    glowAnimation.start();

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
    };
  }, [pulseAnim, glowAnim]);

  const handlePress = () => {
    if (!session.id) return;

    router.push({
      pathname: "/workout",
      params: {
        workoutId: session.workout_id.toString(),
        sessionId: session.id.toString(),
      },
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.glowEffect,
          {
            opacity: glowAnim,
          },
        ]}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            🔄 Continue Workout
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Pick up where you left off
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
    position: "relative",
  },
  glowEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: "#FF6B35",
    shadowColor: "#FF6B35",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  button: {
    backgroundColor: "#FF6B35",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
  },
});
