import { Exercise, Workout } from "@/validation/schemas";

export interface DatabaseSetting {
  id: number;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: number;
  workout_id: number;
  started_at: string;
  completed_at?: string;
  is_completed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseSet {
  id: number;
  session_id: number;
  exercise_id: string;
  set_number: number;
  weight?: number;
  reps?: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Input types for creating new records
export interface CreateWorkout {
  title: string;
  description?: string;
  end_date?: string;
  day_of_week?: string;
  expected_duration?: number;
  suggested_playlist?: string;
}

export interface CreateWorkoutSession {
  workout_id: number;
  notes?: string;
}

export interface CreateExerciseSet {
  session_id: number;
  exercise_id: string;
  set_number: number;
  weight?: number;
  reps?: number;
}

// Update types
export interface UpdateWorkout {
  title?: string;
  description?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface UpdateExercise {
  name?: string;
  target_sets?: number;
  target_reps?: number;
  muscle_group?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  rest_seconds?: number;
}

export interface UpdateExerciseSet {
  weight?: number;
  reps?: number;
  is_completed?: boolean;
}

// Extended types with relationships
export interface WorkoutWithExercises extends Workout {
  exercises: Exercise[];
}

// Database-specific workout with exercises (for database operations)
export interface DatabaseWorkoutWithExercises extends Workout {
  exercises: Exercise[];
}

export interface ExerciseWithSets extends Exercise {
  sets: ExerciseSet[];
}

export interface WorkoutSessionWithDetails extends WorkoutSession {
  workout: Workout;
  exercise_sets: (ExerciseSet & { exercise: Exercise })[];
}

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const DAYS_OF_WEEK_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export type DayOfWeekShort = (typeof DAYS_OF_WEEK_SHORT)[number];

// Workout with assigned day information
export interface WorkoutWithDay extends Workout {
  dayName?: string;
  dayOfWeek?: DayOfWeek;
  isScheduled?: boolean;
}
