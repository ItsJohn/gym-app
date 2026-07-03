import { render, screen } from "@testing-library/react";
import React from "react";
import { ProgressAnalysisCard } from "../ProgressAnalysisCard";
import { useProgressAnalysis } from "@/hooks";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
  TouchableOpacity: ({ children, onPress }: any) => (
    <button onClick={onPress}>{children}</button>
  ),
  View: ({ children }: any) => <div>{children}</div>,
  ActivityIndicator: () => <span>loading</span>,
}));

jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children }: any) => <span>{children}</span>,
}));
jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/hooks", () => ({
  useProgressAnalysis: jest.fn(),
}));

describe("ProgressAnalysisCard", () => {
  it("renders summary and sections from analysis result", () => {
    (useProgressAnalysis as jest.Mock).mockReturnValue({
      goal: "Run a half marathon",
      hasData: true,
      isAnalyzing: false,
      error: null,
      analyze: jest.fn(),
      result: {
        analyzedAt: "2026-07-03T00:00:00.000Z",
        analysis: {
          onTrack: "on-track",
          score: 75,
          summary: "Strong week of training.",
          strengths: ["Consistent runs"],
          concerns: ["Low lifting volume"],
          suggestions: ["Add a strength day"],
        },
      },
    });

    render(<ProgressAnalysisCard />);

    expect(screen.getByText("Strong week of training.")).toBeDefined();
    expect(screen.getByText(/Consistent runs/)).toBeDefined();
    expect(screen.getByText(/Add a strength day/)).toBeDefined();
  });

  it("renders nothing when there is no data", () => {
    (useProgressAnalysis as jest.Mock).mockReturnValue({
      goal: null,
      hasData: false,
      isAnalyzing: false,
      error: null,
      analyze: jest.fn(),
      result: null,
    });

    const { container } = render(<ProgressAnalysisCard />);
    expect(container.firstChild).toBeNull();
  });
});
