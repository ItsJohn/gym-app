import { useCallback, useEffect, useRef } from "react";

/**
 * Hook for managing setTimeout with automatic cleanup
 * @param callback - Function to execute after delay
 * @param delay - Delay in milliseconds, or null to disable
 * @returns Function to manually clear the timeout
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<number | null>(null);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout
  useEffect(() => {
    if (delay !== null) {
      timeoutRef.current = setTimeout(
        () => savedCallback.current(),
        delay,
      ) as number;
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [delay]);

  // Clear timeout manually
  const clearTimeoutManually = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return clearTimeoutManually;
}
