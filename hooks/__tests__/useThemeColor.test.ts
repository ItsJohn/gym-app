import { Colors } from "@/constants/Colors";
import { renderHook } from "@testing-library/react";
import { useThemeColor } from "../useThemeColor";

// Mock the useColorScheme hook
jest.mock("@/hooks/useColorScheme", () => ({
  useColorScheme: jest.fn(),
}));

// Mock the Colors constants
jest.mock("@/constants/Colors", () => ({
  Colors: {
    light: {
      text: "#000000",
      background: "#FFFFFF",
      tint: "#2f95dc",
      tabIconDefault: "#ccc",
      tabIconSelected: "#2f95dc",
    },
    dark: {
      text: "#FFFFFF",
      background: "#000000",
      tint: "#fff",
      tabIconDefault: "#ccc",
      tabIconSelected: "#fff",
    },
  },
}));

import { useColorScheme } from "@/hooks/useColorScheme";

describe("useThemeColor", () => {
  const mockUseColorScheme = useColorScheme as jest.MockedFunction<
    typeof useColorScheme
  >;

  describe("light theme", () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue("light");
    });

    it("should return light theme color when no props are provided", () => {
      const { result } = renderHook(() => useThemeColor({}, "text"));

      expect(result.current).toBe("#000000");
    });

    it("should return light theme color for background", () => {
      const { result } = renderHook(() => useThemeColor({}, "background"));

      expect(result.current).toBe("#FFFFFF");
    });

    it("should return light theme color for tint", () => {
      const { result } = renderHook(() => useThemeColor({}, "tint"));

      expect(result.current).toBe("#2f95dc");
    });

    it("should return light theme color for tabIconDefault", () => {
      const { result } = renderHook(() => useThemeColor({}, "tabIconDefault"));

      expect(result.current).toBe("#ccc");
    });

    it("should return light theme color for tabIconSelected", () => {
      const { result } = renderHook(() => useThemeColor({}, "tabIconSelected"));

      expect(result.current).toBe("#2f95dc");
    });
  });

  describe("dark theme", () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue("dark");
    });

    it("should return dark theme color when no props are provided", () => {
      const { result } = renderHook(() => useThemeColor({}, "text"));

      expect(result.current).toBe("#FFFFFF");
    });

    it("should return dark theme color for background", () => {
      const { result } = renderHook(() => useThemeColor({}, "background"));

      expect(result.current).toBe("#000000");
    });

    it("should return dark theme color for tint", () => {
      const { result } = renderHook(() => useThemeColor({}, "tint"));

      expect(result.current).toBe("#fff");
    });

    it("should return dark theme color for tabIconDefault", () => {
      const { result } = renderHook(() => useThemeColor({}, "tabIconDefault"));

      expect(result.current).toBe("#ccc");
    });

    it("should return dark theme color for tabIconSelected", () => {
      const { result } = renderHook(() => useThemeColor({}, "tabIconSelected"));

      expect(result.current).toBe("#fff");
    });
  });

  describe("prop overrides", () => {
    it("should return light prop color when light theme is active", () => {
      mockUseColorScheme.mockReturnValue("light");

      const { result } = renderHook(() =>
        useThemeColor({ light: "#FF0000", dark: "#00FF00" }, "text"),
      );

      expect(result.current).toBe("#FF0000");
    });

    it("should return dark prop color when dark theme is active", () => {
      mockUseColorScheme.mockReturnValue("dark");

      const { result } = renderHook(() =>
        useThemeColor({ light: "#FF0000", dark: "#00FF00" }, "text"),
      );

      expect(result.current).toBe("#00FF00");
    });

    it("should return light prop color when only light prop is provided and light theme is active", () => {
      mockUseColorScheme.mockReturnValue("light");

      const { result } = renderHook(() =>
        useThemeColor({ light: "#FF0000" }, "text"),
      );

      expect(result.current).toBe("#FF0000");
    });

    it("should return dark prop color when only dark prop is provided and dark theme is active", () => {
      mockUseColorScheme.mockReturnValue("dark");

      const { result } = renderHook(() =>
        useThemeColor({ dark: "#00FF00" }, "text"),
      );

      expect(result.current).toBe("#00FF00");
    });
  });

  describe("fallback behavior", () => {
    it("should fallback to light theme color when light prop is not provided and light theme is active", () => {
      mockUseColorScheme.mockReturnValue("light");

      const { result } = renderHook(() =>
        useThemeColor({ dark: "#00FF00" }, "text"),
      );

      expect(result.current).toBe("#000000"); // Falls back to Colors.light.text
    });

    it("should fallback to dark theme color when dark prop is not provided and dark theme is active", () => {
      mockUseColorScheme.mockReturnValue("dark");

      const { result } = renderHook(() =>
        useThemeColor({ light: "#FF0000" }, "text"),
      );

      expect(result.current).toBe("#FFFFFF"); // Falls back to Colors.dark.text
    });

    it("should fallback to light theme color when no props are provided and light theme is active", () => {
      mockUseColorScheme.mockReturnValue("light");

      const { result } = renderHook(() => useThemeColor({}, "background"));

      expect(result.current).toBe("#FFFFFF"); // Falls back to Colors.light.background
    });

    it("should fallback to dark theme color when no props are provided and dark theme is active", () => {
      mockUseColorScheme.mockReturnValue("dark");

      const { result } = renderHook(() => useThemeColor({}, "background"));

      expect(result.current).toBe("#000000"); // Falls back to Colors.dark.background
    });
  });

  describe("edge cases", () => {
    it("should handle null color scheme by defaulting to light", () => {
      mockUseColorScheme.mockReturnValue(null as never);

      const { result } = renderHook(() => useThemeColor({}, "text"));

      expect(result.current).toBe("#000000"); // Defaults to light theme
    });

    it("should handle undefined color scheme by defaulting to light", () => {
      mockUseColorScheme.mockReturnValue(undefined as never);

      const { result } = renderHook(() => useThemeColor({}, "text"));

      expect(result.current).toBe("#000000"); // Defaults to light theme
    });

    it("should handle empty props object", () => {
      mockUseColorScheme.mockReturnValue("light");

      const { result } = renderHook(() => useThemeColor({}, "tint"));

      expect(result.current).toBe("#2f95dc");
    });

    it("should handle props with undefined values", () => {
      mockUseColorScheme.mockReturnValue("light");

      const { result } = renderHook(() =>
        useThemeColor({ light: undefined, dark: undefined }, "text"),
      );

      expect(result.current).toBe("#000000"); // Falls back to Colors.light.text
    });

    it("should handle props with null values", () => {
      mockUseColorScheme.mockReturnValue("light");

      const { result } = renderHook(() =>
        useThemeColor({ light: null as any, dark: null as any }, "text"),
      );

      expect(result.current).toBe("#000000"); // Falls back to Colors.light.text
    });

    it("should handle props with empty string values", () => {
      mockUseColorScheme.mockReturnValue("light");

      const { result } = renderHook(() =>
        useThemeColor({ light: "", dark: "" }, "text"),
      );

      expect(result.current).toBe("#000000"); // Empty string is falsy, so it falls back to Colors.light.text
    });
  });

  describe("all color names", () => {
    it("should work with all light theme color names", () => {
      mockUseColorScheme.mockReturnValue("light");

      const colorNames: Array<
        keyof typeof Colors.light & keyof typeof Colors.dark
      > = ["text", "background", "tint", "tabIconDefault", "tabIconSelected"];

      colorNames.forEach((colorName) => {
        const { result } = renderHook(() => useThemeColor({}, colorName));
        expect(result.current).toBe(Colors.light[colorName]);
      });
    });

    it("should work with all dark theme color names", () => {
      mockUseColorScheme.mockReturnValue("dark");

      const colorNames: Array<
        keyof typeof Colors.light & keyof typeof Colors.dark
      > = ["text", "background", "tint", "tabIconDefault", "tabIconSelected"];

      colorNames.forEach((colorName) => {
        const { result } = renderHook(() => useThemeColor({}, colorName));
        expect(result.current).toBe(Colors.dark[colorName]);
      });
    });
  });

  describe("integration tests", () => {
    it("should handle theme switching", () => {
      // Start with light theme
      mockUseColorScheme.mockReturnValue("light");

      const { result, rerender } = renderHook(() =>
        useThemeColor({ light: "#FF0000", dark: "#00FF00" }, "text"),
      );

      expect(result.current).toBe("#FF0000");

      // Switch to dark theme
      mockUseColorScheme.mockReturnValue("dark");
      rerender();

      expect(result.current).toBe("#00FF00");
    });

    it("should handle prop changes", () => {
      mockUseColorScheme.mockReturnValue("light");

      const { result, rerender } = renderHook(
        ({ props }: { props: { light?: string; dark?: string } }) =>
          useThemeColor(props, "text"),
        { initialProps: { props: { light: "#FF0000" } } },
      );

      expect(result.current).toBe("#FF0000");

      // Change props
      rerender({ props: { light: "#00FF00" } });

      expect(result.current).toBe("#00FF00");
    });

    it("should handle complex color scenarios", () => {
      mockUseColorScheme.mockReturnValue("light");

      const { result } = renderHook(() =>
        useThemeColor(
          {
            light: "rgba(255, 0, 0, 0.5)",
            dark: "rgba(0, 255, 0, 0.8)",
          },
          "background",
        ),
      );

      expect(result.current).toBe("rgba(255, 0, 0, 0.5)");
    });
  });
});
