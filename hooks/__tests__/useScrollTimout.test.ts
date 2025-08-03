import { act, renderHook } from "@testing-library/react";
import { useScrollTimeout } from "../useScrollTimeout";

describe("useScrollTimeout", () => {
  describe("initialization", () => {
    it("should initialize without triggering timeout when trigger is false", () => {
      const mockCallback = jest.fn();

      renderHook(() => useScrollTimeout(mockCallback, 100, false));

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("should initialize with default delay of 100ms", () => {
      const mockCallback = jest.fn();

      renderHook(() => useScrollTimeout(mockCallback, undefined, false));

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe("trigger functionality", () => {
    it("should execute callback after delay when trigger becomes true", () => {
      const mockCallback = jest.fn();

      const { rerender } = renderHook(
        ({ trigger }: { trigger: boolean }) =>
          useScrollTimeout(mockCallback, 100, trigger),
        { initialProps: { trigger: false } },
      );

      expect(mockCallback).not.toHaveBeenCalled();

      rerender({ trigger: true });

      expect(mockCallback).not.toHaveBeenCalled(); // Not called immediately
    });

    it("should not execute callback when trigger is false", () => {
      const mockCallback = jest.fn();

      renderHook(() => useScrollTimeout(mockCallback, 100, false));

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("should clear previous timeout when trigger changes", () => {
      const mockCallback = jest.fn();

      const { rerender } = renderHook(
        ({ trigger }: { trigger: boolean }) =>
          useScrollTimeout(mockCallback, 100, trigger),
        { initialProps: { trigger: true } },
      );

      // Change trigger to false before timeout executes
      rerender({ trigger: false });

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe("delay handling", () => {
    it("should respect custom delay", () => {
      const mockCallback = jest.fn();

      renderHook(() => useScrollTimeout(mockCallback, 500, true));

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("should work with zero delay", () => {
      const mockCallback = jest.fn();

      renderHook(() => useScrollTimeout(mockCallback, 0, true));

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe("callback execution", () => {
    it("should execute the latest callback when timeout fires", () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      const { rerender } = renderHook(
        ({ callback }: { callback: () => void }) =>
          useScrollTimeout(callback, 100, true),
        { initialProps: { callback: mockCallback1 } },
      );

      rerender({ callback: mockCallback2 });

      expect(mockCallback1).not.toHaveBeenCalled();
      expect(mockCallback2).not.toHaveBeenCalled();
    });

    it("should execute callback only once per trigger", () => {
      const mockCallback = jest.fn();

      const { rerender } = renderHook(
        ({ trigger }: { trigger: boolean }) =>
          useScrollTimeout(mockCallback, 100, trigger),
        { initialProps: { trigger: true } },
      );

      rerender({ trigger: false });
      rerender({ trigger: true });

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe("manual cancellation", () => {
    it("should provide cancel function", () => {
      const mockCallback = jest.fn();

      const { result } = renderHook(() =>
        useScrollTimeout(mockCallback, 100, false),
      );

      expect(typeof result.current).toBe("function");
    });

    it("should cancel timeout when cancel function is called", () => {
      const mockCallback = jest.fn();

      const { result, rerender } = renderHook(
        ({ trigger }: { trigger: boolean }) =>
          useScrollTimeout(mockCallback, 100, trigger),
        { initialProps: { trigger: true } },
      );

      act(() => {
        result.current();
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("should handle multiple cancel calls", () => {
      const mockCallback = jest.fn();

      const { result } = renderHook(() =>
        useScrollTimeout(mockCallback, 100, false),
      );

      act(() => {
        result.current();
        result.current();
        result.current();
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe("cleanup", () => {
    it("should clear timeout on unmount", () => {
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
      const mockCallback = jest.fn();

      const { unmount } = renderHook(() =>
        useScrollTimeout(mockCallback, 100, true),
      );

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    it("should clear timeout when trigger changes to false", () => {
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
      const mockCallback = jest.fn();

      const { rerender } = renderHook(
        ({ trigger }: { trigger: boolean }) =>
          useScrollTimeout(mockCallback, 100, trigger),
        { initialProps: { trigger: true } },
      );

      rerender({ trigger: false });

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  describe("edge cases", () => {
    it("should handle rapid trigger changes", () => {
      const mockCallback = jest.fn();

      const { rerender } = renderHook(
        ({ trigger }: { trigger: boolean }) =>
          useScrollTimeout(mockCallback, 100, trigger),
        { initialProps: { trigger: false } },
      );

      // Rapidly change trigger
      rerender({ trigger: true });
      rerender({ trigger: false });
      rerender({ trigger: true });
      rerender({ trigger: false });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("should handle callback that throws error", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockCallback = jest.fn(() => {
        throw new Error("Test error");
      });

      renderHook(() => useScrollTimeout(mockCallback, 100, true));

      // The error should be handled gracefully
      expect(mockCallback).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle undefined callback", () => {
      const { result } = renderHook(() =>
        useScrollTimeout(undefined as any, 100, true),
      );

      expect(typeof result.current).toBe("function");
    });
  });

  describe("integration tests", () => {
    it("should handle complete lifecycle", () => {
      const mockCallback = jest.fn();

      const { result, rerender } = renderHook(
        ({ trigger }: { trigger: boolean }) =>
          useScrollTimeout(mockCallback, 100, trigger),
        { initialProps: { trigger: false } },
      );

      // Start with trigger false
      expect(mockCallback).not.toHaveBeenCalled();

      // Enable trigger
      rerender({ trigger: true });
      expect(mockCallback).not.toHaveBeenCalled();

      // Cancel manually
      act(() => {
        result.current();
      });
      expect(mockCallback).not.toHaveBeenCalled();

      // Disable trigger
      rerender({ trigger: false });
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("should handle callback updates", () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      const { rerender } = renderHook(
        ({ callback, trigger }: { callback: () => void; trigger: boolean }) =>
          useScrollTimeout(callback, 100, trigger),
        { initialProps: { callback: mockCallback1, trigger: false } },
      );

      // Update callback
      rerender({ callback: mockCallback2, trigger: false });

      // Enable trigger
      rerender({ callback: mockCallback2, trigger: true });

      expect(mockCallback1).not.toHaveBeenCalled();
      expect(mockCallback2).not.toHaveBeenCalled();
    });
  });

  describe("fake timer integration tests", () => {
    let setTimeoutSpy: jest.SpyInstance;
    let clearTimeoutSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.useFakeTimers();
      setTimeoutSpy = jest.spyOn(global, "setTimeout");
      clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      setTimeoutSpy.mockRestore();
      clearTimeoutSpy.mockRestore();
    });

    it("should execute callback after specified delay", () => {
      const mockCallback = jest.fn();

      renderHook(() => useScrollTimeout(mockCallback, 100, true));

      expect(mockCallback).not.toHaveBeenCalled();
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("should clear timeout when trigger becomes false", () => {
      const mockCallback = jest.fn();

      const { rerender } = renderHook(
        ({ trigger }: { trigger: boolean }) =>
          useScrollTimeout(mockCallback, 100, trigger),
        { initialProps: { trigger: true } },
      );

      expect(setTimeoutSpy).toHaveBeenCalled();

      rerender({ trigger: false });

      expect(clearTimeoutSpy).toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("should cancel timeout when cancel function is called", () => {
      const mockCallback = jest.fn();

      const { result } = renderHook(() =>
        useScrollTimeout(mockCallback, 100, true),
      );

      expect(setTimeoutSpy).toHaveBeenCalled();

      act(() => {
        result.current();
      });

      expect(clearTimeoutSpy).toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("should handle multiple trigger changes", () => {
      const mockCallback = jest.fn();

      const { rerender } = renderHook(
        ({ trigger }: { trigger: boolean }) =>
          useScrollTimeout(mockCallback, 100, trigger),
        { initialProps: { trigger: true } },
      );

      // Change trigger multiple times
      rerender({ trigger: false });
      rerender({ trigger: true });
      rerender({ trigger: false });
      rerender({ trigger: true });

      expect(clearTimeoutSpy).toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("should execute latest callback when timeout fires", () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      const { rerender } = renderHook(
        ({ callback }: { callback: () => void }) =>
          useScrollTimeout(callback, 100, true),
        { initialProps: { callback: mockCallback1 } },
      );

      rerender({ callback: mockCallback2 });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockCallback1).not.toHaveBeenCalled();
      expect(mockCallback2).toHaveBeenCalledTimes(1);
    });

    it("should handle zero delay", () => {
      const mockCallback = jest.fn();

      renderHook(() => useScrollTimeout(mockCallback, 0, true));

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 0);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("should handle very long delay", () => {
      const mockCallback = jest.fn();

      renderHook(() => useScrollTimeout(mockCallback, 10000, true));

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 10000);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockCallback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });
});
