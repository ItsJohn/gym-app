import { StravaService } from "@/services/stravaService";
import { SettingsService } from "@/database/services/settingsService";

jest.mock("@/database/services/settingsService");
jest.mock("expo-web-browser", () => ({}));
jest.mock("@/database/services/runSessionService", () => ({
  RunSessionService: {},
}));

const mockedSettings = SettingsService as jest.Mocked<typeof SettingsService>;

describe("StravaService.syncActivities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSettings.getSetting.mockImplementation(async (key: string) => {
      if (key === "strava_access_token") return "token";
      if (key === "strava_token_expiry")
        return String(Math.floor(Date.now() / 1000) + 3600);
      return null;
    });
  });

  it("should include Strava status and message when activity fetch fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: { get: () => "100,1000" },
      json: async () => ({ message: "Rate Limit Exceeded" }),
    }) as unknown as typeof fetch;

    await expect(StravaService.syncActivities()).rejects.toThrow(
      "Fetch activities (page 1) failed (Strava 429): Rate limit exceeded — usage 100,1000 — Rate Limit Exceeded",
    );
  });

  it("should surface field-level errors from an auth failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => null },
      json: async () => ({
        message: "Authorization Error",
        errors: [
          { resource: "Athlete", field: "access_token", code: "invalid" },
        ],
      }),
    }) as unknown as typeof fetch;

    await expect(StravaService.syncActivities()).rejects.toThrow(
      "Fetch activities (page 1) failed (Strava 401): Authorization Error — Athlete.access_token.invalid",
    );
  });
});
