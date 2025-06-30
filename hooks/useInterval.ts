import { useCallback, useEffect, useRef } from "react";

/**
 * Hook for managing setInterval with automatic cleanup
 * @param callback - Function to execute at each interval
 * @param delay - Delay in milliseconds, or null to disable
 * @returns Function to manually clear the interval
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  const intervalRef = useRef<number | null>(null);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay !== null) {
      intervalRef.current = setInterval(
        () => savedCallback.current(),
        delay,
      ) as number;
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [delay]);

  // Clear interval manually
  const clearIntervalManually = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return clearIntervalManually;
}
