import { useCallback, useEffect, useRef } from "react";

/**
 * Hook for managing scroll-related timeouts
 * Specifically designed for UI components that need delayed scroll positioning
 * @param scrollCallback - Function to execute the scroll operation
 * @param delay - Delay in milliseconds before scrolling
 * @param trigger - Boolean or condition that triggers the scroll timeout
 * @returns Function to manually cancel the scroll timeout
 */
export function useScrollTimeout(
  scrollCallback: () => void,
  delay: number = 100,
  trigger: boolean = false,
) {
  const savedCallback = useRef(scrollCallback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = scrollCallback;
  }, [scrollCallback]);

  // Set up the timeout when trigger changes
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (trigger) {
      timeoutRef.current = setTimeout(() => {
        savedCallback.current();
        timeoutRef.current = null;
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [trigger, delay]);

  // Manual cancel function
  const cancelScroll = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return cancelScroll;
}
