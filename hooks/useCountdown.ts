import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook for countdown timer functionality
 * Perfect for workout duration exercises with start/stop/pause/reset controls
 * @param initialSeconds - Starting countdown value in seconds
 * @returns Object with countdown state and control functions
 */
export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(
    (newSeconds?: number) => {
      setIsActive(false);
      setSeconds(newSeconds ?? initialSeconds);
    },
    [initialSeconds],
  );

  const stop = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle the countdown logic
  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000) as number;
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
  }, [isActive, seconds]);

  // Update initial seconds when it changes
  useEffect(() => {
    if (!isActive) {
      setSeconds(initialSeconds);
    }
  }, [initialSeconds, isActive]);

  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    seconds,
    isActive,
    start,
    pause,
    reset,
    stop,
    formatTime: () => formatTime(seconds),
    isFinished: seconds === 0 && !isActive,
  };
}
