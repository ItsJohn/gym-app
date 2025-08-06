import { act, render, screen, waitFor } from "@testing-library/react";
import { WorkoutTimerProvider, useWorkoutTimer } from "../WorkoutTimerContext";

const TestComponent = () => {
  const {
    timers,
    startTimer,
    stopTimer,
    skipTimer,
    getTimerState,
    formatTime,
  } = useWorkoutTimer();

  return (
    <div>
      <div data-testid="timer-count">{timers.size}</div>
      <div data-testid="timer-1-state">
        {JSON.stringify(getTimerState("timer1"))}
      </div>
      <div data-testid="timer-2-state">
        {JSON.stringify(getTimerState("timer2"))}
      </div>
      <div data-testid="formatted-time">{formatTime(125)}</div>
      <div data-testid="formatted-time-65">{formatTime(65)}</div>
      <div data-testid="formatted-time-5">{formatTime(5)}</div>
      <div data-testid="formatted-time-0">{formatTime(0)}</div>
      <div data-testid="formatted-time-3600">{formatTime(3600)}</div>
      <button
        data-testid="start-timer-1"
        onClick={() => startTimer("timer1", 60)}
      >
        Start Timer 1
      </button>
      <button
        data-testid="start-timer-2"
        onClick={() => startTimer("timer2", 30)}
      >
        Start Timer 2
      </button>
      <button data-testid="stop-timer-1" onClick={() => stopTimer("timer1")}>
        Stop Timer 1
      </button>
      <button data-testid="skip-timer-1" onClick={() => skipTimer("timer1")}>
        Skip Timer 1
      </button>
    </div>
  );
};

describe("WorkoutTimerContext", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("WorkoutTimerProvider", () => {
    it("should initialize with empty timers map", () => {
      render(
        <WorkoutTimerProvider>
          <TestComponent />
        </WorkoutTimerProvider>,
      );

      expect(screen.getByTestId("timer-count").textContent).toBe("0");
      expect(screen.getByTestId("timer-1-state").textContent).toBe("");
    });

    it("should start a timer with correct initial state", () => {
      render(
        <WorkoutTimerProvider>
          <TestComponent />
        </WorkoutTimerProvider>,
      );

      act(() => {
        screen.getByTestId("start-timer-1").click();
      });

      const timerState = JSON.parse(
        screen.getByTestId("timer-1-state").textContent || "{}",
      );
      expect(timerState.timeRemaining).toBe(60);
      expect(timerState.isActive).toBe(true);
      expect(timerState.startTime).toBeDefined();
      expect(timerState.duration).toBe(60);
      expect(screen.getByTestId("timer-count").textContent).toBe("1");
    });

    it("should start multiple timers independently", () => {
      render(
        <WorkoutTimerProvider>
          <TestComponent />
        </WorkoutTimerProvider>,
      );

      act(() => {
        screen.getByTestId("start-timer-1").click();
        screen.getByTestId("start-timer-2").click();
      });

      const timer1State = JSON.parse(
        screen.getByTestId("timer-1-state").textContent || "{}",
      );
      const timer2State = JSON.parse(
        screen.getByTestId("timer-2-state").textContent || "{}",
      );

      expect(timer1State.timeRemaining).toBe(60);
      expect(timer2State.timeRemaining).toBe(30);
      expect(screen.getByTestId("timer-count").textContent).toBe("2");
    });

    it("should stop a timer and reset its state", () => {
      render(
        <WorkoutTimerProvider>
          <TestComponent />
        </WorkoutTimerProvider>,
      );

      act(() => {
        screen.getByTestId("start-timer-1").click();
      });

      act(() => {
        screen.getByTestId("stop-timer-1").click();
      });

      const timerState = JSON.parse(
        screen.getByTestId("timer-1-state").textContent || "{}",
      );
      expect(timerState.timeRemaining).toBe(0);
      expect(timerState.isActive).toBe(false);
      expect(timerState.startTime).toBe(null);
      expect(timerState.duration).toBe(0);
    });

    it("should skip a timer and reset its state", () => {
      render(
        <WorkoutTimerProvider>
          <TestComponent />
        </WorkoutTimerProvider>,
      );

      act(() => {
        screen.getByTestId("start-timer-1").click();
      });

      act(() => {
        screen.getByTestId("skip-timer-1").click();
      });

      const timerState = JSON.parse(
        screen.getByTestId("timer-1-state").textContent || "{}",
      );
      expect(timerState.timeRemaining).toBe(0);
      expect(timerState.isActive).toBe(false);
      expect(timerState.startTime).toBe(null);
      expect(timerState.duration).toBe(0);
    });

    it("should update timer countdown every second", async () => {
      render(
        <WorkoutTimerProvider>
          <TestComponent />
        </WorkoutTimerProvider>,
      );

      act(() => {
        screen.getByTestId("start-timer-1").click();
      });

      let timerState = JSON.parse(
        screen.getByTestId("timer-1-state").textContent || "{}",
      );
      expect(timerState.timeRemaining).toBe(60);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        timerState = JSON.parse(
          screen.getByTestId("timer-1-state").textContent || "{}",
        );
        expect(timerState.timeRemaining).toBe(59);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        timerState = JSON.parse(
          screen.getByTestId("timer-1-state").textContent || "{}",
        );
        expect(timerState.timeRemaining).toBe(57);
      });
    });

    it("should automatically stop timer when it reaches zero", async () => {
      render(
        <WorkoutTimerProvider>
          <TestComponent />
        </WorkoutTimerProvider>,
      );

      act(() => {
        screen.getByTestId("start-timer-2").click();
      });

      let timerState = JSON.parse(
        screen.getByTestId("timer-2-state").textContent || "{}",
      );
      expect(timerState.timeRemaining).toBe(30);
      expect(timerState.isActive).toBe(true);

      act(() => {
        jest.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        timerState = JSON.parse(
          screen.getByTestId("timer-2-state").textContent || "{}",
        );
        expect(timerState.timeRemaining).toBe(0);
        expect(timerState.isActive).toBe(false);
      });
    });

    it("should handle multiple timers with different durations", async () => {
      render(
        <WorkoutTimerProvider>
          <TestComponent />
        </WorkoutTimerProvider>,
      );

      act(() => {
        screen.getByTestId("start-timer-1").click();
        screen.getByTestId("start-timer-2").click();
      });

      let timer1State = JSON.parse(
        screen.getByTestId("timer-1-state").textContent || "{}",
      );
      let timer2State = JSON.parse(
        screen.getByTestId("timer-2-state").textContent || "{}",
      );

      expect(timer1State.timeRemaining).toBe(60);
      expect(timer2State.timeRemaining).toBe(30);

      act(() => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        timer1State = JSON.parse(
          screen.getByTestId("timer-1-state").textContent || "{}",
        );
        timer2State = JSON.parse(
          screen.getByTestId("timer-2-state").textContent || "{}",
        );
        expect(timer1State.timeRemaining).toBe(45);
        expect(timer2State.timeRemaining).toBe(15);
      });

      act(() => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        timer1State = JSON.parse(
          screen.getByTestId("timer-1-state").textContent || "{}",
        );
        timer2State = JSON.parse(
          screen.getByTestId("timer-2-state").textContent || "{}",
        );
        expect(timer1State.timeRemaining).toBe(30);
        expect(timer2State.timeRemaining).toBe(0);
        expect(timer2State.isActive).toBe(false);
      });
    });

    it("should format time correctly", () => {
      render(
        <WorkoutTimerProvider>
          <TestComponent />
        </WorkoutTimerProvider>,
      );

      expect(screen.getByTestId("formatted-time").textContent).toBe("02:05");
    });

    it("should format time with leading zeros", () => {
      render(
        <WorkoutTimerProvider>
          <TestComponent />
        </WorkoutTimerProvider>,
      );

      expect(screen.getByTestId("formatted-time-65").textContent).toBe("01:05");
      expect(screen.getByTestId("formatted-time-5").textContent).toBe("00:05");
      expect(screen.getByTestId("formatted-time-0").textContent).toBe("00:00");
      expect(screen.getByTestId("formatted-time-3600").textContent).toBe(
        "60:00",
      );
    });

    it("should clear interval when no active timers", async () => {
      const clearIntervalSpy = jest.spyOn(global, "clearInterval");

      render(
        <WorkoutTimerProvider>
          <TestComponent />
        </WorkoutTimerProvider>,
      );

      act(() => {
        screen.getByTestId("start-timer-2").click();
      });

      act(() => {
        jest.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        const timerState = JSON.parse(
          screen.getByTestId("timer-2-state").textContent || "{}",
        );
        expect(timerState.isActive).toBe(false);
      });

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });

    it("should handle timer restart after stopping", () => {
      render(
        <WorkoutTimerProvider>
          <TestComponent />
        </WorkoutTimerProvider>,
      );

      act(() => {
        screen.getByTestId("start-timer-1").click();
      });

      let timerState = JSON.parse(
        screen.getByTestId("timer-1-state").textContent || "{}",
      );
      expect(timerState.timeRemaining).toBe(60);

      act(() => {
        screen.getByTestId("stop-timer-1").click();
      });

      timerState = JSON.parse(
        screen.getByTestId("timer-1-state").textContent || "{}",
      );
      expect(timerState.isActive).toBe(false);

      act(() => {
        screen.getByTestId("start-timer-1").click();
      });

      timerState = JSON.parse(
        screen.getByTestId("timer-1-state").textContent || "{}",
      );
      expect(timerState.timeRemaining).toBe(60);
      expect(timerState.isActive).toBe(true);
    });

    it("should handle edge case of negative time remaining", async () => {
      render(
        <WorkoutTimerProvider>
          <TestComponent />
        </WorkoutTimerProvider>,
      );

      act(() => {
        screen.getByTestId("start-timer-2").click();
      });

      act(() => {
        jest.advanceTimersByTime(35000);
      });

      await waitFor(() => {
        const timerState = JSON.parse(
          screen.getByTestId("timer-2-state").textContent || "{}",
        );
        expect(timerState.timeRemaining).toBe(0);
        expect(timerState.isActive).toBe(false);
      });
    });
  });

  describe("useWorkoutTimer hook", () => {
    it("should throw error when used outside provider", () => {
      const TestComponentWithoutProvider = () => {
        try {
          useWorkoutTimer();
          return <div>No error</div>;
        } catch (error) {
          return <div data-testid="error">{(error as Error).message}</div>;
        }
      };

      render(<TestComponentWithoutProvider />);

      expect(screen.getByTestId("error").textContent).toBe(
        "useWorkoutTimer must be used within a WorkoutTimerProvider",
      );
    });
  });
});
