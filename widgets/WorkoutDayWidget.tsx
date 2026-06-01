import React from "react";
import type { ColorProp } from "react-native-android-widget";
import { FlexWidget, TextWidget } from "react-native-android-widget";

export type WidgetDayType = "run" | "gym" | "rest";

export interface WorkoutDayWidgetProps {
  dayType: WidgetDayType;
  title: string;
  detail: string;
}

const DARK_BG: ColorProp = "#1a1a2e";
const TEXT_PRIMARY: ColorProp = "#ECEDEE";
const TEXT_SECONDARY: ColorProp = "#9BA1A6";

const LIGHT_BG: ColorProp = "#f0f4f8";
const LIGHT_TEXT_PRIMARY: ColorProp = "#11181C";
const LIGHT_TEXT_SECONDARY: ColorProp = "#687076";

const DAY_COLORS: Record<WidgetDayType, ColorProp> = {
  run: "#66bb6a",
  gym: "#4fc3f7",
  rest: "#ff8a65",
};

const DAY_LABELS: Record<WidgetDayType, string> = {
  run: "🏃 RUN DAY",
  gym: "💪 GYM DAY",
  rest: "😴 REST DAY",
};

function WidgetContent({
  dayType,
  title,
  detail,
  bg,
  textPrimary,
  textSecondary,
}: WorkoutDayWidgetProps & {
  bg: ColorProp;
  textPrimary: ColorProp;
  textSecondary: ColorProp;
}) {
  const accentColor = DAY_COLORS[dayType];

  return (
    <FlexWidget
      style={{
        width: "match_parent",
        height: "match_parent",
        backgroundColor: bg,
        borderRadius: 16,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        padding: 16,
      }}
    >
      {/* Header */}
      <TextWidget
        text="GYM SWEAT & TEARS"
        style={{
          fontSize: 9,
          color: textSecondary,
          fontWeight: "600",
          letterSpacing: 1,
        }}
      />

      {/* Spacer */}
      <FlexWidget style={{ flex: 1 }} />

      {/* Accent bar */}
      <FlexWidget
        style={{
          width: 32,
          height: 3,
          backgroundColor: accentColor,
          borderRadius: 2,
          marginBottom: 8,
        }}
      />

      {/* Day type label */}
      <TextWidget
        text={DAY_LABELS[dayType]}
        style={{
          fontSize: 16,
          color: textPrimary,
          fontWeight: "bold",
          marginBottom: 4,
        }}
      />

      {/* Workout title */}
      <TextWidget
        text={title}
        maxLines={1}
        truncate="END"
        style={{
          fontSize: 12,
          color: accentColor,
          fontWeight: "600",
          marginBottom: 2,
        }}
      />

      {/* Detail */}
      {detail ? (
        <TextWidget
          text={detail}
          maxLines={1}
          truncate="END"
          style={{
            fontSize: 11,
            color: textSecondary,
          }}
        />
      ) : null}
    </FlexWidget>
  );
}

export function WorkoutDayWidget(props: WorkoutDayWidgetProps) {
  return {
    light: (
      <WidgetContent
        {...props}
        bg={LIGHT_BG}
        textPrimary={LIGHT_TEXT_PRIMARY}
        textSecondary={LIGHT_TEXT_SECONDARY}
      />
    ),
    dark: (
      <WidgetContent
        {...props}
        bg={DARK_BG}
        textPrimary={TEXT_PRIMARY}
        textSecondary={TEXT_SECONDARY}
      />
    ),
  };
}
