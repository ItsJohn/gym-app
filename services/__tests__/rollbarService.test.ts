process.env.EXPO_PUBLIC_ROLLBAR_TOKEN = "test-token";

import { rollbar } from "../rollbarService";

interface RollbarPayload {
  access_token: string;
  data: {
    level: string;
    body: {
      trace?: {
        frames: { filename: string; lineno?: number; method?: string }[];
        exception: { class: string; message: string };
      };
      message?: { body: string };
    };
  };
}

function lastPayload(): RollbarPayload {
  const mockFetch = global.fetch as jest.Mock;
  const [, init] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
  return JSON.parse(init.body);
}

describe("rollbarService", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
  });

  it("sends an Error with the trace.frames the API requires", async () => {
    const error = new Error("boom");
    error.stack = [
      "Error: boom",
      "    at doWork (app/workout.tsx:12:9)",
      "    at app/_layout.tsx:3:1",
    ].join("\n");

    await rollbar.error(error);

    const { data } = lastPayload();
    expect(data.level).toBe("error");
    expect(data.body.trace?.exception).toMatchObject({
      class: "Error",
      message: "boom",
    });
    // Oldest frame first — the reverse of the JS stack order.
    expect(data.body.trace?.frames).toEqual([
      { filename: "app/_layout.tsx", lineno: 3, colno: 1, method: "<unknown>" },
      { filename: "app/workout.tsx", lineno: 12, colno: 9, method: "doWork" },
    ]);
  });

  it("sends a string message as a message body", async () => {
    await rollbar.info("just a note");

    const { data } = lastPayload();
    expect(data.level).toBe("info");
    expect(data.body.message).toEqual({ body: "just a note" });
    expect(data.body.trace).toBeUndefined();
  });
});
