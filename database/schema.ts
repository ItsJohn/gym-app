export const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

export const CREATE_WORKOUTS_TABLE = `
  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME,
    expected_duration INTEGER,
    day_of_week TEXT,
    suggested_playlist TEXT,
    is_active BOOLEAN DEFAULT 1,
    ai_goals TEXT,
    ai_issues TEXT,
    ai_experience TEXT,
    ai_time_available INTEGER,
    ai_training_days INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

export const CREATE_RUN_SESSIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS run_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    strava_id TEXT UNIQUE NOT NULL,
    name TEXT,
    distance_m REAL NOT NULL,
    duration_secs INTEGER NOT NULL,
    avg_pace_secs_per_km REAL,
    avg_hr INTEGER,
    max_hr INTEGER,
    total_elevation_gain REAL,
    elev_high REAL,
    elev_low REAL,
    avg_cadence REAL,
    suffer_score INTEGER,
    splits_fetched BOOLEAN DEFAULT 0,
    started_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

export const CREATE_RUN_SPLITS_TABLE = `
  CREATE TABLE IF NOT EXISTS run_splits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_session_id INTEGER NOT NULL,
    split_number INTEGER NOT NULL,
    distance_m REAL NOT NULL,
    moving_time_secs INTEGER NOT NULL,
    elapsed_time_secs INTEGER NOT NULL,
    elevation_diff_m REAL,
    avg_pace_secs_per_km REAL,
    avg_hr REAL,
    avg_cadence REAL,
    pace_zone INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (run_session_id) REFERENCES run_sessions (id) ON DELETE CASCADE
  );
`;

export const MIGRATIONS = [
  "ALTER TABLE workouts ADD COLUMN ai_goals TEXT;",
  "ALTER TABLE workouts ADD COLUMN ai_issues TEXT;",
  "ALTER TABLE workouts ADD COLUMN ai_experience TEXT;",
  "ALTER TABLE workouts ADD COLUMN ai_time_available INTEGER;",
  "ALTER TABLE workouts ADD COLUMN ai_training_days INTEGER;",
  "ALTER TABLE run_sessions ADD COLUMN total_elevation_gain REAL;",
  "ALTER TABLE run_sessions ADD COLUMN elev_high REAL;",
  "ALTER TABLE run_sessions ADD COLUMN elev_low REAL;",
  "ALTER TABLE run_sessions ADD COLUMN avg_cadence REAL;",
  "ALTER TABLE run_sessions ADD COLUMN suffer_score INTEGER;",
  "ALTER TABLE run_sessions ADD COLUMN splits_fetched BOOLEAN DEFAULT 0;",
];

export const CREATE_EXERCISES_TABLE = `
  CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('reps', 'reps-sets', 'reps-per-side', 'duration', 'distance')),
    target TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    rest_seconds INTEGER,
    notes TEXT,
    video_url TEXT,
    workout_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
  );
`;

export const CREATE_WORKOUT_SESSIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS workout_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    is_completed BOOLEAN DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
  );
`;

export const CREATE_EXERCISE_SETS_TABLE = `
  CREATE TABLE IF NOT EXISTS session_set (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    exercise_id TEXT NOT NULL,
    target TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT 0,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES workout_sessions (id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
  );
`;

export const CREATE_WORKOUT_SCHEDULES_TABLE = `
  CREATE TABLE IF NOT EXISTS workout_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    workout_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
  );
`;

export const CREATE_INDEXES = [
  "CREATE INDEX IF NOT EXISTS idx_settings_key ON settings (key);",
  "CREATE INDEX IF NOT EXISTS idx_workouts_active ON workouts (is_active);",
  "CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises (workout_id);",
  "CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises (muscle_group);",
  "CREATE INDEX IF NOT EXISTS idx_workout_sessions_workout_id ON workout_sessions (workout_id);",
  "CREATE INDEX IF NOT EXISTS idx_session_set_session_id ON session_set (session_id);",
  "CREATE INDEX IF NOT EXISTS idx_session_set_exercise_id ON session_set (exercise_id);",
  "CREATE INDEX IF NOT EXISTS idx_workout_schedules_day_of_week ON workout_schedules (day_of_week);",
  "CREATE INDEX IF NOT EXISTS idx_workout_schedules_workout_id ON workout_schedules (workout_id);",
  "CREATE INDEX IF NOT EXISTS idx_workout_schedules_active ON workout_schedules (is_active);",
  "CREATE INDEX IF NOT EXISTS idx_workout_sessions_completed_at ON workout_sessions (completed_at);",
  "CREATE INDEX IF NOT EXISTS idx_session_set_created_at ON session_set (created_at);",
  "CREATE INDEX IF NOT EXISTS idx_run_splits_session_id ON run_splits (run_session_id);",
  "CREATE INDEX IF NOT EXISTS idx_run_sessions_started_at ON run_sessions (started_at);",
];

export const ALL_TABLES = [
  CREATE_SETTINGS_TABLE,
  CREATE_WORKOUTS_TABLE,
  CREATE_EXERCISES_TABLE,
  CREATE_WORKOUT_SESSIONS_TABLE,
  CREATE_EXERCISE_SETS_TABLE,
  CREATE_WORKOUT_SCHEDULES_TABLE,
  CREATE_RUN_SESSIONS_TABLE,
  CREATE_RUN_SPLITS_TABLE,
  ...CREATE_INDEXES,
];
