jest.mock("react-native", () => ({
  Platform: {
    OS: "android",
    select: (obj: Record<string, unknown>) => obj.android,
  },
}));

import * as Notifications from "expo-notifications";
import {
  cancelRestTimerNotification,
  showRestTimerNotification,
} from "../restTimerNotification";

describe("restTimerNotification", () => {
  it("shows a rest notification and schedules a completion alert at the end time", async () => {
    const endTime = Date.now() + 60_000;

    await showRestTimerNotification(endTime, "Resting between sets");

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: "Rest complete" }),
        trigger: expect.objectContaining({
          type: "date",
          date: endTime,
          channelId: "rest-timer-done",
        }),
      }),
    );
  });

  it("cancels the scheduled notifications", async () => {
    await showRestTimerNotification(Date.now() + 60_000, "Resting");
    await cancelRestTimerNotification();

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalled();
  });
});
