import * as WebBrowser from "expo-web-browser";
import { SettingsService } from "@/database/services/settingsService";
import {
  RunSessionService,
  StravaActivity,
} from "@/database/services/runSessionService";

const CLIENT_ID = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET ?? "";
const REDIRECT_URI = "gymsweattears://strava-auth";
const AUTH_URL = "https://www.strava.com/oauth/authorize";
const TOKEN_URL = "https://www.strava.com/oauth/token";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: { id: number; firstname: string; lastname: string };
}

export class StravaService {
  static async connect(): Promise<boolean> {
    if (!CLIENT_ID) {
      throw new Error("EXPO_PUBLIC_STRAVA_CLIENT_ID is not configured");
    }

    const authUrl =
      `${AUTH_URL}?client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&approval_prompt=auto` +
      `&scope=activity:read_all`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

    if (result.type !== "success" || !result.url) return false;

    const url = new URL(result.url);
    const code = url.searchParams.get("code");
    if (!code) return false;

    const tokens = await this.exchangeCode(code);
    await this.saveTokens(tokens);
    return true;
  }

  static async disconnect(): Promise<void> {
    await SettingsService.deleteSetting("strava_access_token");
    await SettingsService.deleteSetting("strava_refresh_token");
    await SettingsService.deleteSetting("strava_token_expiry");
    await SettingsService.deleteSetting("strava_athlete_id");
    await SettingsService.deleteSetting("last_strava_pull");
  }

  static async isConnected(): Promise<boolean> {
    const token = await SettingsService.getSetting("strava_access_token");
    return !!token;
  }

  static async getAthleteId(): Promise<string | null> {
    return await SettingsService.getSetting("strava_athlete_id");
  }

  static async getLastPullDate(): Promise<Date | null> {
    const val = await SettingsService.getSetting("last_strava_pull");
    return val ? new Date(val) : null;
  }

  private static async exchangeCode(code: string): Promise<TokenResponse> {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    });
    if (!response.ok) throw new Error("Failed to exchange Strava auth code");
    return response.json();
  }

  private static async refreshAccessToken(): Promise<string> {
    const refreshToken = await SettingsService.getSetting(
      "strava_refresh_token",
    );
    if (!refreshToken) throw new Error("No Strava refresh token stored");

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!response.ok) throw new Error("Failed to refresh Strava token");

    const tokens: TokenResponse = await response.json();
    await this.saveTokens(tokens);
    return tokens.access_token;
  }

  private static async saveTokens(tokens: TokenResponse): Promise<void> {
    await SettingsService.setSetting(
      "strava_access_token",
      tokens.access_token,
    );
    await SettingsService.setSetting(
      "strava_refresh_token",
      tokens.refresh_token,
    );
    await SettingsService.setSetting(
      "strava_token_expiry",
      String(tokens.expires_at),
    );
    await SettingsService.setSetting(
      "strava_athlete_id",
      String(tokens.athlete.id),
    );
  }

  private static async getValidAccessToken(): Promise<string> {
    const [accessToken, expiryStr] = await Promise.all([
      SettingsService.getSetting("strava_access_token"),
      SettingsService.getSetting("strava_token_expiry"),
    ]);

    if (!accessToken) throw new Error("Not connected to Strava");

    const expiry = expiryStr ? parseInt(expiryStr) * 1000 : 0;
    const isExpired = Date.now() >= expiry - 60_000; // refresh 1 min early

    if (isExpired) return await this.refreshAccessToken();
    return accessToken;
  }

  static async syncActivities(): Promise<number> {
    const token = await this.getValidAccessToken();
    const lastPull = await this.getLastPullDate();

    // Build query: fetch all runs since last pull (or last 90 days if first pull)
    const after = lastPull
      ? Math.floor(lastPull.getTime() / 1000)
      : Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);

    let page = 1;
    let imported = 0;

    while (true) {
      const url =
        `https://www.strava.com/api/v3/athlete/activities` +
        `?after=${after}&per_page=50&page=${page}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch Strava activities");

      const activities: StravaActivity[] = await response.json();
      if (activities.length === 0) break;

      const runs = activities.filter((a) =>
        ["Run", "TrailRun", "VirtualRun"].includes(a.type),
      );

      for (const run of runs) {
        await RunSessionService.upsertFromStrava(run);
        imported++;
      }

      if (activities.length < 50) break;
      page++;
    }

    await SettingsService.setSetting(
      "last_strava_pull",
      new Date().toISOString(),
    );
    return imported;
  }

  // Returns true if a sync is needed (no pull in last 5 minutes)
  static async needsSync(): Promise<boolean> {
    const connected = await this.isConnected();
    if (!connected) return false;

    const lastPull = await this.getLastPullDate();
    if (!lastPull) return true;

    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - lastPull.getTime() > fiveMinutes;
  }
}
