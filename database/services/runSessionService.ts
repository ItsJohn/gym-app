import { executeQuery, getAllRows, getFirstRow } from "../database";
import { RunSession, RunSplit } from "../types";

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  average_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  total_elevation_gain?: number;
  elev_high?: number;
  elev_low?: number;
  average_cadence?: number;
  start_date: string;
  type: string;
}

export interface StravaSplit {
  split: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  elevation_difference?: number;
  average_speed?: number;
  average_heartrate?: number;
  average_cadence?: number;
  pace_zone?: number;
}

export interface StravaActivityDetail extends StravaActivity {
  suffer_score?: number;
  splits_metric?: StravaSplit[];
}

export class RunSessionService {
  static async upsertFromStrava(activity: StravaActivity): Promise<number> {
    const stravaId = String(activity.id);
    const avgPaceSecs =
      activity.average_speed > 0 ? 1000 / activity.average_speed : null;

    await executeQuery(
      `INSERT INTO run_sessions
         (strava_id, name, distance_m, duration_secs, avg_pace_secs_per_km, avg_hr, max_hr,
          total_elevation_gain, elev_high, elev_low, avg_cadence, started_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(strava_id) DO UPDATE SET
         name = excluded.name,
         distance_m = excluded.distance_m,
         duration_secs = excluded.duration_secs,
         avg_pace_secs_per_km = excluded.avg_pace_secs_per_km,
         avg_hr = excluded.avg_hr,
         max_hr = excluded.max_hr,
         total_elevation_gain = excluded.total_elevation_gain,
         elev_high = excluded.elev_high,
         elev_low = excluded.elev_low,
         avg_cadence = excluded.avg_cadence`,
      [
        stravaId,
        activity.name,
        activity.distance,
        activity.moving_time,
        avgPaceSecs,
        activity.average_heartrate ?? null,
        activity.max_heartrate ?? null,
        activity.total_elevation_gain ?? null,
        activity.elev_high ?? null,
        activity.elev_low ?? null,
        activity.average_cadence ?? null,
        activity.start_date,
      ],
    );

    const row = await getFirstRow<{ id: number }>(
      "SELECT id FROM run_sessions WHERE strava_id = ?",
      [stravaId],
    );
    return row!.id;
  }

  static async upsertSplits(
    sessionId: number,
    splits: StravaSplit[],
  ): Promise<void> {
    await executeQuery("DELETE FROM run_splits WHERE run_session_id = ?", [
      sessionId,
    ]);

    for (const s of splits) {
      const avgPace =
        s.average_speed && s.average_speed > 0 ? 1000 / s.average_speed : null;
      await executeQuery(
        `INSERT INTO run_splits
           (run_session_id, split_number, distance_m, moving_time_secs, elapsed_time_secs,
            elevation_diff_m, avg_pace_secs_per_km, avg_hr, avg_cadence, pace_zone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          s.split,
          s.distance,
          s.moving_time,
          s.elapsed_time,
          s.elevation_difference ?? null,
          avgPace,
          s.average_heartrate ?? null,
          s.average_cadence ?? null,
          s.pace_zone ?? null,
        ],
      );
    }

    await executeQuery(
      "UPDATE run_sessions SET splits_fetched = 1 WHERE id = ?",
      [sessionId],
    );
  }

  static async updateSufferScore(
    sessionId: number,
    sufferScore: number,
  ): Promise<void> {
    await executeQuery(
      "UPDATE run_sessions SET suffer_score = ? WHERE id = ?",
      [sufferScore, sessionId],
    );
  }

  static async hasSplits(sessionId: number): Promise<boolean> {
    const row = await getFirstRow<{ splits_fetched: number }>(
      "SELECT splits_fetched FROM run_sessions WHERE id = ?",
      [sessionId],
    );
    return row?.splits_fetched === 1;
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

  static async getSplits(sessionId: number): Promise<RunSplit[]> {
    return await getAllRows<RunSplit>(
      "SELECT * FROM run_splits WHERE run_session_id = ? ORDER BY split_number ASC",
      [sessionId],
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
