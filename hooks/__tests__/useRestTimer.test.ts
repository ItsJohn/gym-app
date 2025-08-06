import { act, renderHook } from "@testing-library/react";
import { useRestTimer } from "../useRestTimer";

// Mock the useWorkoutTimer context
const mockStartTimer = jest.fn();
const mockStopTimer = jest.fn();
const mockSkipTimer = jest.fn();
const mockGetTimerState = jest.fn();
const mockFormatTime = jest.fn((seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
});

jest.mock("@/contexts/WorkoutTimerContext", () => ({
  useWorkoutTimer: () => ({
    startTimer: mockStartTimer,
    stopTimer: mockStopTimer,
    skipTimer: mockSkipTimer,
    getTimerState: mockGetTimerState,
    formatTime: mockFormatTime,
  }),
}));

describe("useRestTimer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock state - timer not active
    mockGetTimerState.mockReturnValue({
      timeRemaining: 0,
      isActive: false,
      startTime: null,
      duration: 0,
    });
  });

  describe("initialization", () => {
    it("should initialize with default duration of 60 seconds", () => {
      const { result } = renderHook(() => useRestTimer("test-timer"));

      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(true);
    });

    it("should initialize with custom duration", () => {
      const { result } = renderHook(() => useRestTimer("test-timer", 120));

      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(true);
    });

    it("should format time correctly on initialization", () => {
      const { result } = renderHook(() => useRestTimer("test-timer", 125));

      expect(result.current.formatTime()).toBe("00:00");
    });
  });

  describe("start functionality", () => {
    it("should start the rest timer with default duration", () => {
      const { result } = renderHook(() => useRestTimer("test-timer", 60));

      act(() => {
        result.current.start();
      });

      expect(mockStartTimer).toHaveBeenCalledWith("test-timer", 60);
    });

    it("should start the rest timer with custom duration", () => {
      const { result } = renderHook(() => useRestTimer("test-timer", 60));

      act(() => {
        result.current.start(90);
      });

      expect(mockStartTimer).toHaveBeenCalledWith("test-timer", 90);
    });

    it("should format time correctly when started", () => {
      // Mock active timer state
      mockGetTimerState.mockReturnValue({
        timeRemaining: 65,
        isActive: true,
        startTime: Date.now(),
        duration: 65,
      });

      const { result } = renderHook(() => useRestTimer("test-timer", 65));

      expect(result.current.formatTime()).toBe("01:05");
    });
  });

  describe("stop functionality", () => {
    it("should stop the rest timer", () => {
      const { result } = renderHook(() => useRestTimer("test-timer", 60));

      act(() => {
        result.current.stop();
      });

      expect(mockStopTimer).toHaveBeenCalledWith("test-timer");
    });
  });

  describe("skip functionality", () => {
    it("should skip the rest timer", () => {
      const { result } = renderHook(() => useRestTimer("test-timer", 60));

      act(() => {
        result.current.skip();
      });

      expect(mockSkipTimer).toHaveBeenCalledWith("test-timer");
    });
  });

  describe("time formatting", () => {
    it("should format time correctly for various values", () => {
      const testCases = [
        { seconds: 0, expected: "00:00" },
        { seconds: 30, expected: "00:30" },
        { seconds: 60, expected: "01:00" },
        { seconds: 125, expected: "02:05" },
        { seconds: 3661, expected: "61:01" },
      ];

      testCases.forEach(({ seconds, expected }) => {
        mockGetTimerState.mockReturnValue({
          timeRemaining: seconds,
          isActive: false,
          startTime: null,
          duration: seconds,
        });

        const { result } = renderHook(() => useRestTimer("test-timer", 60));
        expect(result.current.formatTime()).toBe(expected);
      });
    });
  });

  describe("isFinished state", () => {
    it("should be true initially", () => {
      const { result } = renderHook(() => useRestTimer("test-timer", 60));
      expect(result.current.isFinished).toBe(true);
    });

    it("should be false when timer is active", () => {
      mockGetTimerState.mockReturnValue({
        timeRemaining: 60,
        isActive: true,
        startTime: Date.now(),
        duration: 60,
      });

      const { result } = renderHook(() => useRestTimer("test-timer", 60));

      expect(result.current.isFinished).toBe(false);
    });

    it("should be true when timer is stopped", () => {
      mockGetTimerState.mockReturnValue({
        timeRemaining: 0,
        isActive: false,
        startTime: null,
        duration: 60,
      });

      const { result } = renderHook(() => useRestTimer("test-timer", 60));

      expect(result.current.isFinished).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle zero duration", () => {
      const { result } = renderHook(() => useRestTimer("test-timer", 0));

      act(() => {
        result.current.start();
      });

      expect(mockStartTimer).toHaveBeenCalledWith("test-timer", 0);
    });

    it("should handle rapid start/stop calls", () => {
      const { result } = renderHook(() => useRestTimer("test-timer", 60));

      act(() => {
        result.current.start();
        result.current.stop();
        result.current.start(30);
        result.current.skip();
      });

      expect(mockStartTimer).toHaveBeenCalledTimes(2);
      expect(mockStopTimer).toHaveBeenCalledTimes(1);
      expect(mockSkipTimer).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple start calls", () => {
      const { result } = renderHook(() => useRestTimer("test-timer", 60));

      act(() => {
        result.current.start();
      });

      expect(mockStartTimer).toHaveBeenCalledWith("test-timer", 60);

      act(() => {
        result.current.start(30);
      });

      expect(mockStartTimer).toHaveBeenCalledWith("test-timer", 30);
    });
  });

  describe("integration tests", () => {
    it("should handle complete rest timer lifecycle", () => {
      const { result } = renderHook(() => useRestTimer("test-timer", 60));

      // Initial state
      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(true);

      // Start timer
      act(() => {
        result.current.start();
      });
      expect(mockStartTimer).toHaveBeenCalledWith("test-timer", 60);

      // Stop timer
      act(() => {
        result.current.stop();
      });
      expect(mockStopTimer).toHaveBeenCalledWith("test-timer");

      // Start with custom duration
      act(() => {
        result.current.start(30);
      });
      expect(mockStartTimer).toHaveBeenCalledWith("test-timer", 30);

      // Skip timer
      act(() => {
        result.current.skip();
      });
      expect(mockSkipTimer).toHaveBeenCalledWith("test-timer");
    });

    it("should handle restart with different duration", () => {
      const { result } = renderHook(() => useRestTimer("test-timer", 60));

      act(() => {
        result.current.start();
      });

      expect(mockStartTimer).toHaveBeenCalledWith("test-timer", 60);

      act(() => {
        result.current.stop();
      });

      expect(mockStopTimer).toHaveBeenCalledWith("test-timer");

      act(() => {
        result.current.start(90);
      });

      expect(mockStartTimer).toHaveBeenCalledWith("test-timer", 90);
    });
  });

  describe("timer state updates", () => {
    it("should reflect timer state changes", () => {
      // Initial state
      mockGetTimerState.mockReturnValue({
        timeRemaining: 0,
        isActive: false,
        startTime: null,
        duration: 60,
      });

      const { result, rerender } = renderHook(() =>
        useRestTimer("test-timer", 60),
      );

      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isActive).toBe(false);

      // Update to active state
      mockGetTimerState.mockReturnValue({
        timeRemaining: 60,
        isActive: true,
        startTime: Date.now(),
        duration: 60,
      });

      rerender();

      expect(result.current.timeRemaining).toBe(60);
      expect(result.current.isActive).toBe(true);
      expect(result.current.isFinished).toBe(false);
    });

    it("should handle countdown simulation", () => {
      // Simulate countdown from 5 to 0
      let timeRemaining = 5;
      mockGetTimerState.mockImplementation(() => ({
        timeRemaining,
        isActive: timeRemaining > 0,
        startTime: Date.now(),
        duration: 5,
      }));

      const { result, rerender } = renderHook(() =>
        useRestTimer("test-timer", 5),
      );

      expect(result.current.timeRemaining).toBe(5);
      expect(result.current.isActive).toBe(true);

      // Simulate 1 second passed
      timeRemaining = 4;
      rerender();

      expect(result.current.timeRemaining).toBe(4);
      expect(result.current.isActive).toBe(true);

      // Simulate timer finished
      timeRemaining = 0;
      rerender();

      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(true);
    });
  });

  describe("multiple timers", () => {
    it("should handle multiple timer instances", () => {
      const { result: timer1 } = renderHook(() => useRestTimer("timer-1", 60));
      const { result: timer2 } = renderHook(() => useRestTimer("timer-2", 90));

      act(() => {
        timer1.current.start();
      });

      expect(mockStartTimer).toHaveBeenCalledWith("timer-1", 60);

      act(() => {
        timer2.current.start();
      });

      expect(mockStartTimer).toHaveBeenCalledWith("timer-2", 90);

      act(() => {
        timer1.current.stop();
        timer2.current.skip();
      });

      expect(mockStopTimer).toHaveBeenCalledWith("timer-1");
      expect(mockSkipTimer).toHaveBeenCalledWith("timer-2");
    });
  });
});
