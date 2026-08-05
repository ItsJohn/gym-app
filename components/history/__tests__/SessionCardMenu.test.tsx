import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { SessionCardMenu } from "../SessionCardMenu";

jest.mock("react-native", () => ({
  StyleSheet: { create: (s: any) => s },
  Modal: ({ visible, children }: any) =>
    visible ? <div>{children}</div> : null,
  TouchableOpacity: ({ children, onPress }: any) => (
    <button onClick={onPress}>{children}</button>
  ),
}));

jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children }: any) => <div>{children}</div>,
}));

describe("SessionCardMenu", () => {
  it("calls onCopy when the copy option is pressed", () => {
    const onCopy = jest.fn();
    render(
      <SessionCardMenu
        visible
        onClose={jest.fn()}
        onCopy={onCopy}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText("📋 Copy Workout Details"));
    expect(onCopy).toHaveBeenCalledTimes(1);
  });
});
