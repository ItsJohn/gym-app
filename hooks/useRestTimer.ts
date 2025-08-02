import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook for managing a single rest timer
 * Used for rest periods between workout sets
 * @param duration - Rest duration in seconds
 * @returns Object with rest timer state and control functions
 */
export function useRestTimer(duration: number = 60) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(
    (customDuration?: number) => {
      const restDuration = customDuration ?? duration;
      setTimeRemaining(restDuration);
      setIsActive(true);
      console.log("adadads");

      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000) as number;
    },
    [duration],
  );

  const stop = useCallback(() => {
    setIsActive(false);
    setTimeRemaining(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const skip = useCallback(() => {
    stop();
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    timeRemaining,
    isActive,
    start,
    stop,
    skip,
    formatTime: () => formatTime(timeRemaining),
    isFinished: timeRemaining === 0 && !isActive,
  };
}
