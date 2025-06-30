import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook for managing multiple rest timers simultaneously
 * Perfect for workout sets where multiple rest periods can be active
 * @returns Object with functions to manage multiple rest timers
 */
export function useMultipleRestTimers() {
  const [restTimers, setRestTimers] = useState<{
    [key: number]: { timeRemaining: number; isActive: boolean };
  }>({});
  const intervalRefs = useRef<{ [key: number]: number }>({});

  const startRestTimer = useCallback((setIndex: number, duration: number) => {
    // Clear existing timer if any
    if (intervalRefs.current[setIndex]) {
      clearInterval(intervalRefs.current[setIndex]);
    }

    setRestTimers((prev) => ({
      ...prev,
      [setIndex]: { timeRemaining: duration, isActive: true },
    }));

    intervalRefs.current[setIndex] = setInterval(() => {
      setRestTimers((prev) => {
        const currentTimer = prev[setIndex];
        if (
          !currentTimer ||
          !currentTimer.isActive ||
          currentTimer.timeRemaining <= 0
        ) {
          return prev;
        }

        const newRemaining = currentTimer.timeRemaining - 1;

        if (newRemaining <= 0) {
          // Timer finished
          return {
            ...prev,
            [setIndex]: { timeRemaining: 0, isActive: false },
          };
        }

        return {
          ...prev,
          [setIndex]: { timeRemaining: newRemaining, isActive: true },
        };
      });
    }, 1000) as number;
  }, []);

  const stopRestTimer = useCallback((setIndex: number) => {
    if (intervalRefs.current[setIndex]) {
      clearInterval(intervalRefs.current[setIndex]);
      delete intervalRefs.current[setIndex];
    }

    setRestTimers((prev) => {
      const newTimers = { ...prev };
      delete newTimers[setIndex];
      return newTimers;
    });
  }, []);

  const skipRestTimer = useCallback(
    (setIndex: number) => {
      stopRestTimer(setIndex);
    },
    [stopRestTimer],
  );

  const pauseRestTimer = useCallback((setIndex: number) => {
    if (intervalRefs.current[setIndex]) {
      clearInterval(intervalRefs.current[setIndex]);
      delete intervalRefs.current[setIndex];
    }

    setRestTimers((prev) => ({
      ...prev,
      [setIndex]: { ...prev[setIndex], isActive: false },
    }));
  }, []);

  const resumeRestTimer = useCallback(
    (setIndex: number) => {
      const timer = restTimers[setIndex];
      if (timer && !timer.isActive && timer.timeRemaining > 0) {
        setRestTimers((prev) => ({
          ...prev,
          [setIndex]: { ...prev[setIndex], isActive: true },
        }));

        intervalRefs.current[setIndex] = setInterval(() => {
          setRestTimers((prev) => {
            const currentTimer = prev[setIndex];
            if (
              !currentTimer ||
              !currentTimer.isActive ||
              currentTimer.timeRemaining <= 0
            ) {
              return prev;
            }

            const newRemaining = currentTimer.timeRemaining - 1;

            if (newRemaining <= 0) {
              return {
                ...prev,
                [setIndex]: { timeRemaining: 0, isActive: false },
              };
            }

            return {
              ...prev,
              [setIndex]: { timeRemaining: newRemaining, isActive: true },
            };
          });
        }, 1000) as number;
      }
    },
    [restTimers],
  );

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach((interval) => {
        clearInterval(interval);
      });
    };
  }, []);

  const formatRestTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const clearAllTimers = useCallback(() => {
    Object.values(intervalRefs.current).forEach((interval) => {
      clearInterval(interval);
    });
    intervalRefs.current = {};
    setRestTimers({});
  }, []);

  return {
    restTimers,
    startRestTimer,
    stopRestTimer,
    skipRestTimer,
    pauseRestTimer,
    resumeRestTimer,
    clearAllTimers,
    formatRestTime,
    isRestActive: (setIndex: number) => restTimers[setIndex]?.isActive || false,
    getRestTime: (setIndex: number) => restTimers[setIndex]?.timeRemaining || 0,
    hasActiveTimers: Object.values(restTimers).some((timer) => timer.isActive),
  };
}
