import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const COUNTDOWN_CHANNEL_ID = "rest-timer";
const DONE_CHANNEL_ID = "rest-timer-done";

const isAndroid = Platform.OS === "android";

let channelsReady = false;
let handlerReady = false;
let countdownId: string | null = null;
let doneId: string | null = null;

function ensureForegroundHandler(): void {
  if (handlerReady) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  handlerReady = true;
}

async function ensureChannels(): Promise<void> {
  if (!isAndroid || channelsReady) return;
  await Notifications.setNotificationChannelAsync(COUNTDOWN_CHANNEL_ID, {
    name: "Rest Timer",
    importance: Notifications.AndroidImportance.LOW,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: null,
  });
  await Notifications.setNotificationChannelAsync(DONE_CHANNEL_ID, {
    name: "Rest Complete",
    importance: Notifications.AndroidImportance.HIGH,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
  channelsReady = true;
}

/**
 * Prepares the notification channels and foreground handler. Safe to call
 * repeatedly; only the first call has any effect.
 */
export async function initRestTimerNotifications(): Promise<void> {
  ensureForegroundHandler();
  await ensureChannels();
}

/**
 * Requests notification permission. Returns true if granted.
 */
export async function requestRestTimerPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

function dateTrigger(
  date: number,
  channelId: string,
): Notifications.DateTriggerInput {
  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
    ...(isAndroid ? { channelId } : {}),
  };
}

/**
 * Shows a notification that the rest period is active and schedules a
 * completion alert for when the timer finishes. Replaces any timer already
 * running. The completion alert fires even while the app is backgrounded.
 *
 * @param endTime - epoch milliseconds when the timer finishes
 * @param label - short description shown in the notification body
 */
export async function showRestTimerNotification(
  endTime: number,
  label: string,
): Promise<void> {
  ensureForegroundHandler();
  await ensureChannels();
  await cancelRestTimerNotification();

  countdownId = await Notifications.scheduleNotificationAsync({
    content: { title: "Rest timer", body: label },
    trigger: dateTrigger(Date.now() + 1, COUNTDOWN_CHANNEL_ID),
  });

  if (endTime <= Date.now()) return;

  doneId = await Notifications.scheduleNotificationAsync({
    content: { title: "Rest complete", body: "Time for your next set" },
    trigger: dateTrigger(endTime, DONE_CHANNEL_ID),
  });
}

/**
 * Cancels the rest notification and the pending completion alert.
 */
export async function cancelRestTimerNotification(): Promise<void> {
  if (countdownId) {
    await Notifications.cancelScheduledNotificationAsync(countdownId);
    await Notifications.dismissNotificationAsync(countdownId).catch(() => {});
    countdownId = null;
  }
  if (doneId) {
    await Notifications.cancelScheduledNotificationAsync(doneId);
    doneId = null;
  }
}
