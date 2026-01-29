import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

import GymLogo from "@/components/GymLogo";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  WeightProgressionChart,
  WorkoutFrequencyChart,
} from "@/components/analytics";
import {
  useWeightProgression,
  usePersonalRecords,
  useWorkoutFrequency,
  useExercisesWithData,
} from "@/hooks/useAnalyticsData";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [frequencyPeriod, setFrequencyPeriod] = useState<"week" | "month">(
    "week",
  );

  const { data: exercisesWithData, isLoading: isExercisesLoading } =
    useExercisesWithData();
  const { data: weightData, isLoading: isWeightLoading } =
    useWeightProgression(selectedExerciseId);
  const { data: prData, isLoading: isPrLoading } = usePersonalRecords();
  const { data: frequencyData, isLoading: isFrequencyLoading } =
    useWorkoutFrequency(frequencyPeriod);

  const selectedExercise = exercisesWithData?.find(
    (e) => e.id === selectedExerciseId,
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<GymLogo />}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Analytics</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>
            Select Exercise
          </ThemedText>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: colorScheme === "dark" ? "#374151" : "#f3f4f6",
              },
            ]}
          >
            <Picker
              selectedValue={selectedExerciseId}
              onValueChange={(value) => setSelectedExerciseId(value)}
              style={[styles.picker, { color: Colors[colorScheme].text }]}
              dropdownIconColor={Colors[colorScheme].text}
            >
              <Picker.Item label="Select an exercise..." value="" />
              {exercisesWithData?.map((exercise) => (
                <Picker.Item
                  key={exercise.id}
                  label={exercise.name}
                  value={exercise.id}
                />
              ))}
            </Picker>
          </View>
        </ThemedView>

        <WeightProgressionChart
          data={weightData || []}
          isLoading={isWeightLoading || isExercisesLoading}
          exerciseName={selectedExercise?.name}
        />

        {/* <PersonalRecordsChart data={prData || []} isLoading={isPrLoading} /> */}

        <WorkoutFrequencyChart
          data={frequencyData || []}
          isLoading={isFrequencyLoading}
          period={frequencyPeriod}
          onPeriodChange={setFrequencyPeriod}
        />
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
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
});
