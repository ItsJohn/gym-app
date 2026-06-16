jest.mock("react-native", () => ({
  Platform: {
    OS: "android",
    select: (obj: Record<string, unknown>) => obj.android,
  },
}));

import notifee from "@notifee/react-native";
import {
  cancelRestTimerNotification,
  showRestTimerNotification,
} from "../restTimerNotification";

describe("restTimerNotification", () => {
  it("shows an ongoing countdown and schedules a completion alert at the end time", async () => {
    const endTime = Date.now() + 60_000;

    await showRestTimerNotification(endTime, "Resting between sets");

    expect(notifee.displayNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        android: expect.objectContaining({
          ongoing: true,
          showChronometer: true,
          chronometerDirection: "down",
          timestamp: endTime,
        }),
      }),
    );
    expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ timestamp: endTime }),
    );
  });

  it("cancels both the countdown and the pending completion alert", async () => {
    await cancelRestTimerNotification();

    expect(notifee.cancelNotification).toHaveBeenCalledWith("rest-timer");
    expect(notifee.cancelNotification).toHaveBeenCalledWith("rest-timer-done");
  });
});
