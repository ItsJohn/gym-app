import { ThemedView } from "@/components/ThemedView";
import { useCountdown } from "@/hooks";
import { Exercise } from "@/validation/schemas";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import FancySelect from "./FancySelect";

interface SetInputProps {
  exercise: Exercise;
  weight?: number;
  reps?: number;
  onWeightChange: (weight: number) => void;
  onRepsChange: (reps: number) => void;
  onComplete: () => void;
  weightUnit?: "kg" | "lbs";
  lastSessionData?: {
    weight?: number;
    reps?: number;
    distance?: number;
  } | null;
}

export default function SetInput({
  exercise,
  weight,
  reps,
  onWeightChange,
  onRepsChange,
  onComplete,
  weightUnit = "kg",
  lastSessionData,
}: Readonly<SetInputProps>) {
  const initialDuration = exercise.type === "duration" ? reps || 30 : 30;
  const countdown = useCountdown(initialDuration);

  useEffect(() => {
    if (exercise.type === "duration" && reps) {
      countdown.reset(reps);
    }
  }, [reps, exercise.type]);

  useEffect(() => {
    if (countdown.isFinished) {
      onComplete();
    }
  }, [countdown.isFinished, onComplete]);

  // Preselect last session values if no current values are set
  useEffect(() => {
    if (lastSessionData && !weight && lastSessionData.weight) {
      onWeightChange(lastSessionData.weight);
    }

    if (lastSessionData && !reps) {
      if (exercise.type === "distance" && lastSessionData.distance) {
        onRepsChange(lastSessionData.distance);
      } else if (exercise.type !== "distance" && lastSessionData.reps) {
        onRepsChange(lastSessionData.reps);
      }
    }
  }, [
    lastSessionData,
    weight,
    reps,
    exercise.type,
    onWeightChange,
    onRepsChange,
  ]);

  // Auto-select target distance for distance exercises
  useEffect(() => {
    if (exercise.type === "distance" && (!reps || reps === 0)) {
      const targetDistance = parseInt(exercise.target.distance || "1000", 10);
      // Find the closest available distance option
      const distances = [
        1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500,
        7000, 7500, 8000, 8500, 9000, 9500, 10000, 10500, 11000, 11500, 12000,
        12500, 13000, 13500, 14000, 14500, 15000,
      ];
      const closestDistance = distances.reduce((prev, curr) =>
        Math.abs(curr - targetDistance) < Math.abs(prev - targetDistance)
          ? curr
          : prev,
      );
      onRepsChange(closestDistance);
    }
  }, [exercise.type, exercise.target.distance, reps, onRepsChange]);

  // Auto-initialize weight to 0 for weight-based exercises when undefined
  useEffect(() => {
    if (
      exercise.type !== "duration" &&
      exercise.type !== "distance" &&
      weight === undefined
    ) {
      onWeightChange(0);
    }
  }, [exercise.type, weight, onWeightChange]);

  // Auto-initialize reps to target value for rep-based exercises when undefined
  useEffect(() => {
    if (
      (exercise.type === "reps" ||
        exercise.type === "reps-sets" ||
        exercise.type === "reps-per-side") &&
      reps === undefined
    ) {
      const targetReps = parseInt(exercise.target.reps || "10", 10);
      onRepsChange(targetReps);
    }
  }, [exercise.type, exercise.target.reps, reps, onRepsChange]);

  // Generate weight options (5-500 in increments of 2.5 for kg, 5-1000 in increments of 5 for lbs)
  const weightOptions = useMemo(() => {
    const options = [];
    if (weightUnit === "kg") {
      for (let i = 0; i <= 500; i += 2.5) {
        options.push({
          label: i.toString(),
          value: i,
        });
      }
    } else {
      for (let i = 0; i <= 1000; i += 5) {
        options.push({
          label: i.toString(),
          value: i,
        });
      }
    }
    return options;
  }, [weightUnit]);

  // Generate reps options based on exercise type
  const repsOptions = useMemo(() => {
    const options = [];

    if (exercise.type === "distance") {
      // Simple, reliable distance options starting from 1km up to 15km with 0.5km increments
      const distances = [
        1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500,
        7000, 7500, 8000, 8500, 9000, 9500, 10000, 10500, 11000, 11500, 12000,
        12500, 13000, 13500, 14000, 14500, 15000,
      ];

      distances.forEach((distance) => {
        const km = distance / 1000;
        options.push({
          label: `${km}km`,
          value: distance,
        });
      });
    } else {
      // Calculate max reps based on exercise properties
      const calculateMaxReps = () => {
        const baseTarget = exercise.target;

        switch (exercise.type) {
          case "duration":
            // For duration exercises, use a reasonable range based on target duration
            const targetDuration = parseInt(baseTarget.duration || "30", 10);
            // Allow 10% to 300% of target duration, with a minimum of 10s and maximum of 600s
            const minDuration = Math.max(10, Math.floor(targetDuration * 0.1));
            const maxDuration = Math.min(600, Math.ceil(targetDuration * 3));
            return maxDuration;

          case "reps":
          case "reps-sets":
            // For rep-based exercises, use target reps as a guide
            const targetReps = parseInt(baseTarget.reps || "10", 10);
            // Allow 1 to 200% of target reps, with a minimum of 1 and maximum of 200
            const maxReps = Math.min(
              200,
              Math.max(0, Math.ceil(targetReps * 2)),
            );
            return maxReps;

          case "reps-per-side":
            // For per-side exercises, use target per_side as a guide
            const targetPerSide = parseInt(baseTarget.per_side || "10", 10);
            // Allow 1 to 150% of target per side, with a minimum of 1 and maximum of 150
            const maxPerSide = Math.min(
              150,
              Math.max(1, Math.ceil(targetPerSide * 1.5)),
            );
            return maxPerSide;

          default:
            return 100; // Fallback for unknown types
        }
      };

      const maxReps = calculateMaxReps();

      // For non-distance exercises, generate all values from 1 to max
      for (let i = 1; i <= maxReps; i++) {
        options.push({
          label: i.toString(),
          value: i,
        });
      }
    }

    return options;
  }, [exercise.type, exercise.target]);

  const repsLabel = useMemo(() => {
    switch (exercise.type) {
      case "reps":
      case "reps-sets":
        return "Reps";
      case "reps-per-side":
        return "Reps per side";
      case "duration":
        return "Duration";
      case "distance":
        return "Distance";
      default:
        return "Reps";
    }
  }, [exercise.type]);

  const repsSuffix = useMemo(() => {
    switch (exercise.type) {
      case "duration":
        return "s";
      default:
        return "";
    }
  }, [exercise.type]);

  return (
    <ThemedView style={styles.container}>
      {exercise.type !== "duration" && exercise.type !== "distance" && (
        <ThemedView style={styles.selectContainer}>
          <FancySelect
            label={`Weight (${weightUnit})`}
            value={weight || 0}
            options={weightOptions}
            onValueChange={(value) => onWeightChange(Number(value))}
            suffix={` ${weightUnit}`}
          />
        </ThemedView>
      )}

      {/* Show reps dropdown only if not duration type OR if duration type but timer is not active */}
      {(exercise.type !== "duration" || !countdown.isActive) && (
        <ThemedView style={styles.selectContainer}>
          <FancySelect
            label={repsLabel}
            value={reps || (exercise.type === "distance" ? 1000 : 0)}
            options={repsOptions}
            onValueChange={(value) => onRepsChange(Number(value))}
            suffix={repsSuffix}
          />
        </ThemedView>
      )}

      {exercise.type === "duration" && !countdown.isActive && (
        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={countdown.start}
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </ThemedView>
      )}

      {exercise.type === "duration" && countdown.isActive && (
        <ThemedView style={styles.timerContainer}>
          <Text style={styles.timerText}>{countdown.formatTime()}</Text>
          <TouchableOpacity style={styles.stopButton} onPress={countdown.stop}>
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  selectContainer: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    paddingTop: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  startButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stopButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  timerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 16,
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
});
