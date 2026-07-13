const ROLLBAR_ENDPOINT = "https://api.rollbar.com/api/1/item/";

type Level = "debug" | "info" | "warning" | "error" | "critical";

interface Frame {
  filename: string;
  lineno?: number;
  colno?: number;
  method?: string;
}

// Hermes/V8 stacks: "    at method (filename:line:col)" or "    at filename:line:col"
const FRAME_PATTERN = /^\s*at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/;

function parseFrames(error: Error): Frame[] {
  const frames: Frame[] = [];
  for (const line of error.stack?.split("\n") ?? []) {
    const match = FRAME_PATTERN.exec(line);
    if (!match) continue;
    frames.push({
      method: match[1] ?? "<unknown>",
      filename: match[2],
      lineno: Number(match[3]),
      colno: Number(match[4]),
    });
  }
  // Rollbar orders frames oldest-first; JS stacks are newest-first.
  return frames.reverse();
}

function buildBody(message: string | Error) {
  if (!(message instanceof Error)) {
    return { message: { body: message } };
  }
  return {
    trace: {
      // `frames` is required by the API — an empty array is still accepted.
      frames: parseFrames(message),
      exception: {
        class: message.name,
        message: message.message,
        description: message.stack,
      },
    },
  };
}

// Metro defines __DEV__; guard so non-Metro contexts (Jest) don't throw.
const environment =
  typeof __DEV__ !== "undefined" && __DEV__ ? "development" : "production";

async function send(
  level: Level,
  message: string | Error,
  extra?: Record<string, unknown>,
): Promise<void> {
  const token = process.env.EXPO_PUBLIC_ROLLBAR_TOKEN;
  if (!token) return;

  const payload = JSON.stringify({
    access_token: token,
    data: {
      environment,
      platform: "browser",
      level,
      body: buildBody(message),
      custom: extra,
      language: "javascript",
      notifier: { name: "gym-sweat-tears", version: "1.0.0" },
      timestamp: Math.floor(Date.now() / 1000),
    },
  });

  try {
    const response = await fetch(ROLLBAR_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    // fetch resolves on 4xx/5xx, so a rejected payload is invisible without this.
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[rollbar] ${response.status}: ${detail}`);
    }
  } catch (error) {
    console.warn("[rollbar] request failed:", error);
  }
}

export const rollbar = {
  debug: (message: string | Error, extra?: Record<string, unknown>) =>
    send("debug", message, extra),
  info: (message: string | Error, extra?: Record<string, unknown>) =>
    send("info", message, extra),
  warning: (message: string | Error, extra?: Record<string, unknown>) =>
    send("warning", message, extra),
  error: (message: string | Error, extra?: Record<string, unknown>) =>
    send("error", message, extra),
  critical: (message: string | Error, extra?: Record<string, unknown>) =>
    send("critical", message, extra),
};

let installed = false;

/**
 * Routes uncaught errors and unhandled promise rejections to Rollbar.
 * Safe to call more than once; only the first call registers handlers.
 */
export function initRollbar(): void {
  if (installed) return;
  installed = true;

  type GlobalErrorHandler = (error: Error, isFatal?: boolean) => void;
  const errorUtils = (
    globalThis as typeof globalThis & {
      ErrorUtils?: {
        getGlobalHandler: () => GlobalErrorHandler | undefined;
        setGlobalHandler: (handler: GlobalErrorHandler) => void;
      };
    }
  ).ErrorUtils;

  if (errorUtils) {
    const previousHandler = errorUtils.getGlobalHandler();
    errorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      rollbar.error(error, { isFatal });
      previousHandler?.(error, isFatal);
    });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const tracking = require("promise/setimmediate/rejection-tracking") as {
      enable: (options: {
        allRejections: boolean;
        onUnhandled: (id: number, error: unknown) => void;
        onHandled: () => void;
      }) => void;
    };
    tracking.enable({
      allRejections: true,
      onUnhandled: (_id, error) => {
        rollbar.error(
          error instanceof Error ? error : new Error(String(error)),
        );
      },
      onHandled: () => {},
    });
  } catch {
    // `promise` polyfill unavailable (e.g. web) — uncaught errors still report.
  }
}
