import { z } from "zod";

export const TargetSchema = z.object({
  reps: z.string().nullish(),
  sets: z.string().nullish(),
  per_side: z.string().nullish(),
  duration: z.string().nullish(),
  distance: z.string().nullish(),
  weight: z.number().nullish(),
});

export const WorkoutGoalsSchema = z.object({
  goals: z.string().trim(),
  issues: z.string().trim().nullish(),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  timeAvailable: z.number().min(15).max(180),
  equipment: z.array(z.string()).nullish(),
  trainingDaysPerWeek: z.number().min(1).max(7).default(3),
  workoutType: z
    .enum([
      "upper-body",
      "lower-body",
      "full-body",
      "push",
      "pull",
      "legs",
      "cardio",
    ])
    .nullish(),
  previousProgram: z
    .array(
      z.object({
        title: z.string(),
        exercises: z.array(
          z.object({ name: z.string(), muscle_group: z.string() }),
        ),
      }),
    )
    .nullish(),
});

// Exercise schema for the unified workout structure
export const ExerciseSchema = z.object({
  id: z.string().nullish(),
  name: z.string(),
  type: z.enum(["reps", "reps-sets", "reps-per-side", "duration", "distance"]),
  target: TargetSchema,
  muscle_group: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  rest_seconds: z.number().nullish(),
  notes: z.string().trim().nullish(),
  video_url: z.string().trim().nullish(),
  workout_id: z.number().nullish(),
});

// Unified Workout schema - this replaces AIWorkoutResponseSchema and becomes the standard
export const WorkoutSchema = z
  .object({
    id: z.number().nullish(), // For database records
    title: z.string(),
    description: z.string().nullish(),
    day_of_week: z.string().nullish(), // For scheduled workouts
    expected_duration: z.number().nullish(),
    end_date: z.string().nullish(),
    suggested_playlist: z.string().nullish(),
    exercises: z.array(ExerciseSchema),
    // Database fields (nullish for AI-generated workouts)
    date_created: z.string().nullish(),
    is_active: z.boolean().nullish(),
    created_at: z.string().nullish(),
    updated_at: z.string().nullish(),
    // AI generation inputs
    ai_goals: z.string().nullish(),
    ai_issues: z.string().nullish(),
    ai_experience: z.enum(["beginner", "intermediate", "advanced"]).nullish(),
    ai_time_available: z.number().nullish(),
    ai_training_days: z.number().nullish(),
  })
  .transform((data) => {
    const today = new Date();
    const eightWeeksLater = new Date(today);
    eightWeeksLater.setDate(today.getDate() + 8 * 7); // 8 weeks = 56 days

    return {
      ...data,
      end_date: eightWeeksLater.toISOString(),
    };
  });

// Backward compatibility - keep the old name as an alias
export const AIExerciseSchema = ExerciseSchema;
export const AIWorkoutResponseSchema = WorkoutSchema;

// Schema for array of workouts (for workout splits)
export const WorkoutArraySchema = z.array(WorkoutSchema);
export const AIWorkoutArrayResponseSchema = WorkoutArraySchema; // Backward compatibility

// Union schema that accepts either a single workout or an array of workouts
export const WorkoutFlexibleSchema = z.union([
  WorkoutSchema,
  WorkoutArraySchema,
]);
export const AIWorkoutFlexibleResponseSchema = WorkoutFlexibleSchema; // Backward compatibility

// Workout Session Validation
export const SetInputSchema = z.object({
  weight: z
    .number()
    .min(0, "Weight cannot be negative")
    .max(1000, "Weight seems unrealistic"),
  reps: z
    .number()
    .min(0, "Reps cannot be negative")
    .max(100, "Reps cannot exceed 100"),
  is_completed: z.coerce.boolean().default(false),
});

export const SessionNotesSchema = z.string().trim().nullish();

export const SettingsSchema = z.object({
  weightUnit: z.enum(["kg", "lbs"]),
  defaultRestTime: z.number(),
  autoAdvanceAfterSet: z.boolean(),
  showExerciseDescriptions: z.boolean(),
  restTimerSound: z.enum(["none", "beep", "chime"]),
  vibrationEnabled: z.boolean(),
  theme: z.enum(["light", "dark", "auto"]),
});

// Progress analysis produced by the AI analyser (gym sessions + Strava runs vs goal)
export const WorkoutAnalysisSchema = z.object({
  onTrack: z.enum(["ahead", "on-track", "behind", "unclear"]),
  score: z.number().min(0).max(100),
  summary: z.string().trim(),
  strengths: z.array(z.string().trim()),
  concerns: z.array(z.string().trim()),
  suggestions: z.array(z.string().trim()),
});

// Type exports - unified types
export type WorkoutGoals = z.infer<typeof WorkoutGoalsSchema>;
export type WorkoutAnalysis = z.infer<typeof WorkoutAnalysisSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type WorkoutArray = z.infer<typeof WorkoutArraySchema>;
export type WorkoutFlexible = z.infer<typeof WorkoutFlexibleSchema>;

// Backward compatibility type exports
export type AIWorkoutResponse = Workout;
export type AIWorkoutArrayResponse = WorkoutArray;
export type AIWorkoutFlexibleResponse = WorkoutFlexible;

export type SetInput = z.infer<typeof SetInputSchema>;
export type SettingsInput = z.infer<typeof SettingsSchema>;

// Validation helper functions
export const validateWorkoutGoals = (data: unknown) => {
  return WorkoutGoalsSchema.safeParse(data);
};

export const validateWorkout = (data: unknown) => {
  return WorkoutSchema.safeParse(data);
};

export const validateExercise = (data: unknown) => {
  return ExerciseSchema.safeParse(data);
};

export const validateWorkoutArray = (data: unknown) => {
  return WorkoutArraySchema.safeParse(data);
};

export const validateWorkoutFlexible = (data: unknown) => {
  return WorkoutFlexibleSchema.safeParse(data);
};

// Backward compatibility validation functions
export const validateAIWorkoutResponse = validateWorkout;
export const validateAIWorkoutArrayResponse = validateWorkoutArray;
export const validateAIWorkoutFlexibleResponse = validateWorkoutFlexible;

export const validateSetInput = (data: unknown) => {
  return SetInputSchema.safeParse(data);
};

export const validateSettings = (data: unknown) => {
  return SettingsSchema.safeParse(data);
};

export const validateWorkoutAnalysis = (data: unknown) => {
  return WorkoutAnalysisSchema.safeParse(data);
};
