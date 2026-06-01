import { executeQuery, getAllRows, getFirstRow } from "../database";
import { RunSession } from "../types";

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  average_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  start_date: string;
  type: string;
}

export class RunSessionService {
  static async upsertFromStrava(activity: StravaActivity): Promise<void> {
    const stravaId = String(activity.id);
    const avgPaceSecs =
      activity.average_speed > 0 ? 1000 / activity.average_speed : null;

    await executeQuery(
      `INSERT OR REPLACE INTO run_sessions
         (strava_id, name, distance_m, duration_secs, avg_pace_secs_per_km, avg_hr, max_hr, started_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        stravaId,
        activity.name,
        activity.distance,
        activity.moving_time,
        avgPaceSecs,
        activity.average_heartrate ?? null,
        activity.max_heartrate ?? null,
        activity.start_date,
      ],
    );
  }

  static async getRecentSessions(limit = 20): Promise<RunSession[]> {
    return await getAllRows<RunSession>(
      "SELECT * FROM run_sessions ORDER BY started_at DESC LIMIT ?",
      [limit],
    );
  }

  static async getSessionById(id: number): Promise<RunSession | null> {
    return await getFirstRow<RunSession>(
      "SELECT * FROM run_sessions WHERE id = ?",
      [id],
    );
  }

  static async getSessionByStravaId(
    stravaId: string,
  ): Promise<RunSession | null> {
    return await getFirstRow<RunSession>(
      "SELECT * FROM run_sessions WHERE strava_id = ?",
      [stravaId],
    );
  }

  static async getTodaysRun(): Promise<RunSession | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await getFirstRow<RunSession>(
      `SELECT * FROM run_sessions
       WHERE started_at >= ? AND started_at < ?
       ORDER BY started_at DESC LIMIT 1`,
      [today.toISOString(), tomorrow.toISOString()],
    );
  }

  static async deleteAll(): Promise<void> {
    await executeQuery("DELETE FROM run_sessions");
  }

  static formatPace(avgPaceSecsPerKm: number): string {
    const mins = Math.floor(avgPaceSecsPerKm / 60);
    const secs = Math.round(avgPaceSecsPerKm % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}/km`;
  }

  static formatDistance(distanceM: number): string {
    return `${(distanceM / 1000).toFixed(2)} km`;
  }
}
