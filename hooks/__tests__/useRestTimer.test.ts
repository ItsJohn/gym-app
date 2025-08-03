import { act, renderHook } from "@testing-library/react";
import { useRestTimer } from "../useRestTimer";

describe("useRestTimer", () => {
  describe("initialization", () => {
    it("should initialize with default duration of 60 seconds", () => {
      const { result } = renderHook(() => useRestTimer());

      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(true);
    });

    it("should initialize with custom duration", () => {
      const { result } = renderHook(() => useRestTimer(120));

      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(true);
    });

    it("should format time correctly on initialization", () => {
      const { result } = renderHook(() => useRestTimer(125));

      expect(result.current.formatTime()).toBe("00:00");
    });
  });

  describe("start functionality", () => {
    it("should start the rest timer with default duration", () => {
      const { result } = renderHook(() => useRestTimer(60));

      act(() => {
        result.current.start();
      });

      expect(result.current.timeRemaining).toBe(60);
      expect(result.current.isActive).toBe(true);
      expect(result.current.isFinished).toBe(false);
    });

    it("should start the rest timer with custom duration", () => {
      const { result } = renderHook(() => useRestTimer(60));

      act(() => {
        result.current.start(90);
      });

      expect(result.current.timeRemaining).toBe(90);
      expect(result.current.isActive).toBe(true);
      expect(result.current.isFinished).toBe(false);
    });

    it("should format time correctly when started", () => {
      const { result } = renderHook(() => useRestTimer(65));

      act(() => {
        result.current.start();
      });

      expect(result.current.formatTime()).toBe("01:05");
    });
  });

  describe("stop functionality", () => {
    it("should stop the rest timer and reset time remaining", () => {
      const { result } = renderHook(() => useRestTimer(60));

      act(() => {
        result.current.start();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.timeRemaining).toBe(60);

      act(() => {
        result.current.stop();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isFinished).toBe(true);
    });
  });

  describe("skip functionality", () => {
    it("should skip the rest timer and stop it", () => {
      const { result } = renderHook(() => useRestTimer(60));

      act(() => {
        result.current.start();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.timeRemaining).toBe(60);

      act(() => {
        result.current.skip();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isFinished).toBe(true);
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
        const { result } = renderHook(() => useRestTimer(60));
        act(() => {
          result.current.start(seconds);
        });
        expect(result.current.formatTime()).toBe(expected);
      });
    });
  });

  describe("isFinished state", () => {
    it("should be true initially", () => {
      const { result } = renderHook(() => useRestTimer(60));
      expect(result.current.isFinished).toBe(true);
    });

    it("should be false when timer is active", () => {
      const { result } = renderHook(() => useRestTimer(60));

      act(() => {
        result.current.start();
      });

      expect(result.current.isFinished).toBe(false);
    });

    it("should be true when timer is stopped", () => {
      const { result } = renderHook(() => useRestTimer(60));

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.stop();
      });

      expect(result.current.isFinished).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle zero duration", () => {
      const { result } = renderHook(() => useRestTimer(0));

      act(() => {
        result.current.start();
      });

      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isActive).toBe(true);
      expect(result.current.formatTime()).toBe("00:00");
    });

    it("should handle rapid start/stop calls", () => {
      const { result } = renderHook(() => useRestTimer(60));

      act(() => {
        result.current.start();
        result.current.stop();
        result.current.start(30);
        result.current.skip();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.timeRemaining).toBe(0);
    });

    it("should handle multiple start calls", () => {
      const { result } = renderHook(() => useRestTimer(60));

      act(() => {
        result.current.start();
      });

      expect(result.current.timeRemaining).toBe(60);

      act(() => {
        result.current.start(30);
      });

      expect(result.current.timeRemaining).toBe(30);
    });
  });

  describe("cleanup", () => {
    it("should clear interval on unmount", () => {
      const clearIntervalSpy = jest.spyOn(global, "clearInterval");

      const { result, unmount } = renderHook(() => useRestTimer(60));

      act(() => {
        result.current.start();
      });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });

  describe("integration tests", () => {
    it("should handle complete rest timer lifecycle", () => {
      const { result } = renderHook(() => useRestTimer(60));

      // Initial state
      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(true);

      // Start timer
      act(() => {
        result.current.start();
      });
      expect(result.current.timeRemaining).toBe(60);
      expect(result.current.isActive).toBe(true);
      expect(result.current.isFinished).toBe(false);

      // Stop timer
      act(() => {
        result.current.stop();
      });
      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(true);

      // Start with custom duration
      act(() => {
        result.current.start(30);
      });
      expect(result.current.timeRemaining).toBe(30);
      expect(result.current.isActive).toBe(true);

      // Skip timer
      act(() => {
        result.current.skip();
      });
      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(true);
    });

    it("should handle restart with different duration", () => {
      const { result } = renderHook(() => useRestTimer(60));

      act(() => {
        result.current.start();
      });

      expect(result.current.timeRemaining).toBe(60);

      act(() => {
        result.current.stop();
      });

      act(() => {
        result.current.start(90);
      });

      expect(result.current.timeRemaining).toBe(90);
      expect(result.current.isActive).toBe(true);
    });
  });

  describe("fake timer integration tests", () => {
    let setIntervalSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.useFakeTimers();
      setIntervalSpy = jest.spyOn(global, "setInterval");
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      setIntervalSpy.mockRestore();
    });

    it("should format time correctly during countdown", () => {
      const { result } = renderHook(() => useRestTimer(65));

      act(() => {
        result.current.start();
      });

      expect(result.current.formatTime()).toBe("01:05");

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.formatTime()).toBe("01:04");
    });

    it("should test timer functionality with controlled intervals", () => {
      const { result } = renderHook(() => useRestTimer(60));

      // Start the timer
      act(() => {
        result.current.start();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.timeRemaining).toBe(60);

      // Test that the interval is set up correctly
      expect(setIntervalSpy).toHaveBeenCalled();
    });

    it("should test stop functionality with timers", () => {
      const { result } = renderHook(() => useRestTimer(60));

      act(() => {
        result.current.start();
      });

      expect(result.current.isActive).toBe(true);

      act(() => {
        result.current.stop();
      });

      expect(result.current.isActive).toBe(false);

      // Test that timers don't affect stopped state
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.timeRemaining).toBe(0);
    });

    it("should test skip functionality with timers", () => {
      const { result } = renderHook(() => useRestTimer(60));

      act(() => {
        result.current.start();
      });

      expect(result.current.isActive).toBe(true);

      act(() => {
        result.current.skip();
      });

      expect(result.current.isActive).toBe(false);

      // Test that timers don't affect skipped state
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.timeRemaining).toBe(0);
    });

    it("should handle zero duration with fake timers", () => {
      const { result } = renderHook(() => useRestTimer(0));

      act(() => {
        result.current.start();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.timeRemaining).toBe(0);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // When timeRemaining is 0, the interval should stop automatically
      expect(result.current.isActive).toBe(false);
      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isFinished).toBe(true);
    });

    it("should decrement time remaining during countdown", () => {
      const { result } = renderHook(() => useRestTimer(5));

      act(() => {
        result.current.start();
      });

      expect(result.current.timeRemaining).toBe(5);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeRemaining).toBe(4);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeRemaining).toBe(3);
    });

    it("should stop automatically when reaching zero", () => {
      const { result } = renderHook(() => useRestTimer(2));

      act(() => {
        result.current.start();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.timeRemaining).toBe(2);

      // Advance by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(result.current.timeRemaining).toBe(1);

      // Advance by another second to reach zero
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeRemaining).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.isFinished).toBe(true);
    });
  });
});
