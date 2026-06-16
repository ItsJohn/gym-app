import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  cancelRestTimerNotification,
  showRestTimerNotification,
} from "@/services/restTimerNotification";

interface TimerState {
  timeRemaining: number;
  isActive: boolean;
  startTime: number | null;
  duration: number;
}

interface WorkoutTimerContextType {
  timers: Map<string, TimerState>;
  startTimer: (timerId: string, duration: number) => void;
  stopTimer: (timerId: string) => void;
  skipTimer: (timerId: string) => void;
  getTimerState: (timerId: string) => TimerState | undefined;
  formatTime: (seconds: number) => string;
}

const WorkoutTimerContext = createContext<WorkoutTimerContextType | undefined>(
  undefined,
);

export function WorkoutTimerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [timers, setTimers] = useState<Map<string, TimerState>>(new Map());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Which timer currently owns the ongoing Android countdown notification.
  const notifiedTimerIdRef = useRef<string | null>(null);

  const clearNotification = useCallback((timerId: string) => {
    if (notifiedTimerIdRef.current !== timerId) return;
    notifiedTimerIdRef.current = null;
    void cancelRestTimerNotification();
  }, []);

  const startTimer = useCallback((timerId: string, duration: number) => {
    const startTime = Date.now();
    setTimers((prev) => {
      const newTimers = new Map(prev);
      newTimers.set(timerId, {
        timeRemaining: duration,
        isActive: true,
        startTime,
        duration,
      });
      return newTimers;
    });

    notifiedTimerIdRef.current = timerId;
    void showRestTimerNotification(
      startTime + duration * 1000,
      "Resting between sets",
    );
  }, []);

  const stopTimer = useCallback(
    (timerId: string) => {
      setTimers((prev) => {
        const newTimers = new Map(prev);
        newTimers.set(timerId, {
          timeRemaining: 0,
          isActive: false,
          startTime: null,
          duration: 0,
        });
        return newTimers;
      });
      clearNotification(timerId);
    },
    [clearNotification],
  );

  const skipTimer = useCallback(
    (timerId: string) => {
      stopTimer(timerId);
    },
    [stopTimer],
  );

  const getTimerState = useCallback(
    (timerId: string) => {
      return timers.get(timerId);
    },
    [timers],
  );

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Update all active timers every second
  useEffect(() => {
    const hasActiveTimers = Array.from(timers.values()).some(
      (timer) => timer.isActive,
    );

    if (hasActiveTimers) {
      intervalRef.current = setInterval(() => {
        const finishedTimerIds: string[] = [];
        setTimers((prev) => {
          const newTimers = new Map(prev);
          let hasAnyActive = false;

          newTimers.forEach((timer, timerId) => {
            if (timer.isActive && timer.startTime) {
              const elapsedSeconds = Math.floor(
                (Date.now() - timer.startTime) / 1000,
              );
              const remaining = Math.max(0, timer.duration - elapsedSeconds);

              if (remaining <= 0) {
                // Timer finished
                finishedTimerIds.push(timerId);
                newTimers.set(timerId, {
                  timeRemaining: 0,
                  isActive: false,
                  startTime: null,
                  duration: timer.duration,
                });
              } else {
                // Timer still running
                newTimers.set(timerId, {
                  ...timer,
                  timeRemaining: remaining,
                });
                hasAnyActive = true;
              }
            }
          });

          return newTimers;
        });

        finishedTimerIds.forEach(clearNotification);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timers, clearNotification]);

  return (
    <WorkoutTimerContext.Provider
      value={{
        timers,
        startTimer,
        stopTimer,
        skipTimer,
        getTimerState,
        formatTime,
      }}
    >
      {children}
    </WorkoutTimerContext.Provider>
  );
}

export function useWorkoutTimer() {
  const context = useContext(WorkoutTimerContext);
  if (context === undefined) {
    throw new Error(
      "useWorkoutTimer must be used within a WorkoutTimerProvider",
    );
  }
  return context;
}
