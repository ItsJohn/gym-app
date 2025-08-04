import { initializeDatabase } from "@/database/database";
import { SettingsService } from "@/database/services/settingsService";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  convertWeight,
  formatWeight,
  SettingsProvider,
  useSettings,
} from "../SettingsContext";

// Suppress unhandled promise rejections for this test file
beforeAll(() => {
  process.on("unhandledRejection", () => {});
});

// Mock the database and services
jest.mock("@/database/database");
jest.mock("@/database/services/settingsService");

const mockInitializeDatabase = initializeDatabase as jest.MockedFunction<
  typeof initializeDatabase
>;
const mockSettingsService = SettingsService as jest.Mocked<
  typeof SettingsService
>;

// Create a mock database object
const mockDatabase = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  closeAsync: jest.fn(),
};

// Test component to access the context
const TestComponent = () => {
  const { settings, updateSetting, resetSettings, isLoading } = useSettings();

  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="weight-unit">{settings.weightUnit}</div>
      <div data-testid="rest-time">{settings.defaultRestTime}</div>
      <div data-testid="theme">{settings.theme}</div>
      <button
        data-testid="update-weight"
        onClick={() => updateSetting("weightUnit", "lbs")}
      >
        Update Weight
      </button>
      <button data-testid="reset-settings" onClick={() => resetSettings()}>
        Reset
      </button>
    </div>
  );
};

describe("SettingsContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockInitializeDatabase.mockResolvedValue(mockDatabase as any);
    mockSettingsService.initializeDefaultSettings.mockResolvedValue();
    mockSettingsService.getAppSettings.mockResolvedValue({
      weightUnit: "kg",
      defaultRestTime: 90,
      restTimerSound: "beep",
      autoAdvanceAfterSet: false,
      showExerciseDescriptions: true,
      vibrationEnabled: true,
      theme: "auto",
    });
    mockSettingsService.updateAppSetting.mockResolvedValue();
    mockSettingsService.clearAllSettings.mockResolvedValue();
  });

  describe("SettingsProvider", () => {
    it("should initialize with default settings and loading state", async () => {
      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>,
      );

      // Initially should be loading
      expect(screen.getByTestId("loading").textContent).toBe("true");

      // Wait for initialization to complete
      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      // Should have loaded settings
      expect(screen.getByTestId("weight-unit").textContent).toBe("kg");
      expect(screen.getByTestId("rest-time").textContent).toBe("90");
      expect(screen.getByTestId("theme").textContent).toBe("auto");
    });

    it("should initialize database and settings on mount", async () => {
      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>,
      );

      await waitFor(() => {
        expect(mockInitializeDatabase).toHaveBeenCalledTimes(1);
        expect(
          mockSettingsService.initializeDefaultSettings,
        ).toHaveBeenCalledTimes(1);
        expect(mockSettingsService.getAppSettings).toHaveBeenCalledTimes(1);
      });
    });

    it("should fall back to default settings if database initialization fails", async () => {
      mockInitializeDatabase.mockRejectedValue(new Error("Database error"));

      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      // Should still have default settings
      expect(screen.getByTestId("weight-unit").textContent).toBe("kg");
      expect(screen.getByTestId("rest-time").textContent).toBe("90");
    });

    it("should fall back to default settings if settings service fails", async () => {
      mockSettingsService.getAppSettings.mockRejectedValue(
        new Error("Settings error"),
      );

      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      // Should have default settings
      expect(screen.getByTestId("weight-unit").textContent).toBe("kg");
      expect(screen.getByTestId("rest-time").textContent).toBe("90");
    });
  });

  describe("updateSetting", () => {
    it("should update a setting successfully", async () => {
      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      // Update weight unit
      await act(async () => {
        fireEvent.click(screen.getByTestId("update-weight"));
      });

      await waitFor(() => {
        expect(mockSettingsService.updateAppSetting).toHaveBeenCalledWith(
          "weightUnit",
          "lbs",
        );
        expect(screen.getByTestId("weight-unit").textContent).toBe("lbs");
      });
    });
  });

  describe("resetSettings", () => {
    it("should reset settings successfully", async () => {
      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      // Reset settings
      await act(async () => {
        screen.getByTestId("reset-settings").click();
      });

      await waitFor(() => {
        expect(mockSettingsService.clearAllSettings).toHaveBeenCalledTimes(1);
        expect(
          mockSettingsService.initializeDefaultSettings,
        ).toHaveBeenCalledTimes(2); // Once on mount, once on reset
        expect(mockSettingsService.getAppSettings).toHaveBeenCalledTimes(2); // Once on mount, once on reset
      });
    });

    it("should handle reset settings errors", async () => {
      mockSettingsService.clearAllSettings.mockRejectedValue(
        new Error("Reset failed"),
      );

      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      // Try to reset settings
      await act(async () => {
        screen.getByTestId("reset-settings").click();
      });

      await waitFor(() => {
        expect(mockSettingsService.clearAllSettings).toHaveBeenCalledTimes(1);
      });

      // Should still have settings (fallback to defaults)
      expect(screen.getByTestId("weight-unit").textContent).toBe("kg");
    });
  });

  describe("useSettings hook", () => {
    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useSettings must be used within a SettingsProvider");

      consoleSpy.mockRestore();
    });

    it("should provide all required context values", async () => {
      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false");
      });

      // All context values should be available
      expect(screen.getByTestId("weight-unit")).toBeTruthy();
      expect(screen.getByTestId("rest-time")).toBeTruthy();
      expect(screen.getByTestId("theme")).toBeTruthy();
      expect(screen.getByTestId("update-weight")).toBeTruthy();
      expect(screen.getByTestId("reset-settings")).toBeTruthy();
    });
  });

  describe("convertWeight utility function", () => {
    it("should return same weight when units are the same", () => {
      expect(convertWeight(100, "kg", "kg")).toBe(100);
      expect(convertWeight(50, "lbs", "lbs")).toBe(50);
    });

    it("should convert kg to lbs correctly", () => {
      expect(convertWeight(1, "kg", "lbs")).toBe(2.2);
      expect(convertWeight(10, "kg", "lbs")).toBe(22.0);
      expect(convertWeight(45, "kg", "lbs")).toBe(99.2);
    });

    it("should convert lbs to kg correctly", () => {
      expect(convertWeight(2.2, "lbs", "kg")).toBe(1.0);
      expect(convertWeight(22, "lbs", "kg")).toBe(10.0);
      expect(convertWeight(99.2, "lbs", "kg")).toBe(45.0);
    });

    it("should round to 1 decimal place", () => {
      expect(convertWeight(1.234, "kg", "lbs")).toBe(2.7);
      expect(convertWeight(2.345, "lbs", "kg")).toBe(1.1);
    });
  });

  describe("formatWeight utility function", () => {
    it("should format weight with kg unit", () => {
      expect(formatWeight(100, "kg")).toBe("100 kg");
      expect(formatWeight(45.5, "kg")).toBe("45.5 kg");
    });

    it("should format weight with lbs unit", () => {
      expect(formatWeight(220, "lbs")).toBe("220 lbs");
      expect(formatWeight(99.2, "lbs")).toBe("99.2 lbs");
    });
  });

  describe("default settings", () => {
    it("should have correct default values", async () => {
      const expectedDefaults = {
        weightUnit: "kg",
        defaultRestTime: 90,
        restTimerSound: "beep",
        autoAdvanceAfterSet: false,
        showExerciseDescriptions: true,
        vibrationEnabled: true,
        theme: "auto",
      };

      // Test that the defaults are used when database fails
      mockSettingsService.getAppSettings.mockRejectedValue(
        new Error("Database error"),
      );

      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("weight-unit").textContent).toBe(
          expectedDefaults.weightUnit,
        );
        expect(screen.getByTestId("rest-time").textContent).toBe(
          expectedDefaults.defaultRestTime.toString(),
        );
        expect(screen.getByTestId("theme").textContent).toBe(
          expectedDefaults.theme,
        );
      });
    });
  });
});
