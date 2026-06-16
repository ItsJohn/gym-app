import { Platform } from "react-native";
import notifee, {
  AlarmType,
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
  TriggerType,
} from "@notifee/react-native";

const COUNTDOWN_CHANNEL_ID = "rest-timer";
const DONE_CHANNEL_ID = "rest-timer-done";
const COUNTDOWN_ID = "rest-timer";
const DONE_ID = "rest-timer-done";

const isAndroid = Platform.OS === "android";

let channelsReady = false;

async function ensureChannels() {
  if (channelsReady) return;
  await notifee.createChannel({
    id: COUNTDOWN_CHANNEL_ID,
    name: "Rest Timer",
    importance: AndroidImportance.LOW,
    visibility: AndroidVisibility.PUBLIC,
    vibration: false,
  });
  await notifee.createChannel({
    id: DONE_CHANNEL_ID,
    name: "Rest Complete",
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    vibration: true,
  });
  channelsReady = true;
}

/**
 * Prepares the notification channels. Safe to call repeatedly; only the first
 * call has any effect. No-op off Android.
 */
export async function initRestTimerNotifications(): Promise<void> {
  if (!isAndroid) return;
  await ensureChannels();
}

/**
 * Requests notification permission (Android 13+). Returns true if granted.
 */
export async function requestRestTimerPermission(): Promise<boolean> {
  if (!isAndroid) return false;
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
}

/**
 * Shows an ongoing chronometer notification counting down to `endTime`, and
 * schedules a one-shot alert for when the timer finishes. Android renders the
 * countdown itself, so it keeps ticking and the completion alert fires even
 * while the app is backgrounded or closed — no foreground service required.
 *
 * @param endTime - epoch milliseconds when the timer finishes
 * @param label - short description shown in the notification body
 */
export async function showRestTimerNotification(
  endTime: number,
  label: string,
): Promise<void> {
  if (!isAndroid) return;
  await ensureChannels();

  await notifee.displayNotification({
    id: COUNTDOWN_ID,
    title: "Rest timer",
    body: label,
    android: {
      channelId: COUNTDOWN_CHANNEL_ID,
      ongoing: true,
      onlyAlertOnce: true,
      smallIcon: "ic_launcher",
      showChronometer: true,
      chronometerDirection: "down",
      timestamp: endTime,
      pressAction: { id: "default", launchActivity: "default" },
    },
  });

  if (endTime <= Date.now()) return;

  await notifee.createTriggerNotification(
    {
      id: DONE_ID,
      title: "Rest complete",
      body: "Time for your next set",
      android: {
        channelId: DONE_CHANNEL_ID,
        smallIcon: "ic_launcher",
        pressAction: { id: "default", launchActivity: "default" },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: endTime,
      alarmManager: { type: AlarmType.SET_AND_ALLOW_WHILE_IDLE },
    },
  );
}

/**
 * Removes the countdown notification and cancels the pending completion alert.
 */
export async function cancelRestTimerNotification(): Promise<void> {
  if (!isAndroid) return;
  await notifee.cancelNotification(COUNTDOWN_ID);
  await notifee.cancelNotification(DONE_ID);
}
