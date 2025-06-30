import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Workout } from "@/validation/schemas";
interface TodaysWorkoutButtonProps {
  workout: Workout;
}

export default function TodaysWorkoutButton({
  workout,
}: TodaysWorkoutButtonProps) {
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
    router.push({
      pathname: "/workout-preview",
      params: {
        workoutId: workout.id,
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
          styles.glowContainer,
          {
            shadowOpacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.8],
            }),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          <View style={styles.iconContainer}>
            <ThemedText style={styles.icon}>🔥</ThemedText>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
              <ThemedText type="title" style={styles.title}>
                Today&apos;s Workout
              </ThemedText>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <ThemedText style={styles.liveText}>LIVE</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.workoutTitle}>{workout.title}</ThemedText>
            <ThemedText style={styles.workoutTime}>
              {workout.description}
            </ThemedText>

            <View style={styles.actionRow}>
              <ThemedText style={styles.actionText}>
                Tap to preview exercises
              </ThemedText>
              <ThemedText style={styles.arrow}>→</ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  glowContainer: {
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 10,
  },
  button: {
    backgroundColor: "#FF6B35",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
    marginRight: 4,
  },
  liveText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  workoutTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    opacity: 0.9,
  },
  workoutTime: {
    color: "white",
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
  },
  arrow: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
