// Import unified types from validation schemas
import { Exercise } from "@/validation/schemas";

// Use the unified Exercise type as the base for form data
export type ExerciseFormData = Exercise;

// Use the unified Workout type as the base for form data
export interface WorkoutFormData {
  title: string;
  description: string;
  day_of_week: string;
  expected_duration: number;
  end_date: string;
  suggested_playlist: string;
  exercises: ExerciseFormData[];
}
