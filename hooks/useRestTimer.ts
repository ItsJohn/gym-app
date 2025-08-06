import { useWorkoutTimer } from "@/contexts/WorkoutTimerContext";
import { useCallback, useMemo } from "react";

/**
 * Hook for managing a rest timer that persists across navigation
 * Used for rest periods between workout sets
 * @param timerId - Unique identifier for this timer
 * @param duration - Rest duration in seconds
 * @returns Object with rest timer state and control functions
 */
export function useRestTimer(timerId: string, duration: number = 60) {
  const { startTimer, stopTimer, skipTimer, getTimerState, formatTime } =
    useWorkoutTimer();

  const timerState = getTimerState(timerId);

  const timeRemaining = timerState?.timeRemaining ?? 0;
  const isActive = timerState?.isActive ?? false;

  const start = useCallback(
    (customDuration?: number) => {
      const restDuration = customDuration ?? duration;
      startTimer(timerId, restDuration);
    },
    [timerId, duration, startTimer],
  );

  const stop = useCallback(() => {
    stopTimer(timerId);
  }, [timerId, stopTimer]);

  const skip = useCallback(() => {
    skipTimer(timerId);
  }, [timerId, skipTimer]);

  const formattedTime = useMemo(() => {
    return formatTime(timeRemaining);
  }, [timeRemaining, formatTime]);

  return {
    timeRemaining,
    isActive,
    start,
    stop,
    skip,
    formatTime: () => formattedTime,
    isFinished: timeRemaining === 0 && !isActive,
  };
}
