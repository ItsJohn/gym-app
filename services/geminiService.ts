import {
  validateWorkoutArray,
  validateWorkoutGoals,
  Workout,
  WorkoutGoals,
} from "@/validation/schemas";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { YouTubeVerificationService } from "./youtubeVerificationService";

// You'll need to add your Gemini API key to your environment
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn(
    "Gemini API key not found. AI workout generation will not work.",
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiService {
  private static model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  private static validateInput(goals: WorkoutGoals): WorkoutGoals {
    const validationResult = validateWorkoutGoals(goals);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors
        .map((err) => err.message)
        .join(", ");
      throw new Error(`Invalid workout goals: ${errorMessages}`);
    }
    return validationResult.data;
  }

  private static validateOutput(workouts: Workout[]): Workout[] {
    const validationResult = validateWorkoutArray(workouts);
    if (!validationResult.success) {
      throw new Error(
        `Invalid workout array: ${validationResult.error.message}`,
      );
    }
    return validationResult.data;
  }

  static async generateWorkoutProgram(
    goalInput: WorkoutGoals,
  ): Promise<Workout[]> {
    if (!API_KEY) {
      throw new Error("Gemini API key not configured");
    }

    const goals = this.validateInput(goalInput);
    const prompt = this.buildWorkoutPrompt(goals);

    try {
      console.log("Generating workout program with Gemini...", prompt);
      const result = await this.model.generateContent(prompt);

      const cleanedText = this.removeAIResponseFormatting(
        result.response.text(),
      );

      // Pre-validate and fix common AI mistakes before Zod validation
      const fixedResponse = this.fixExerciseTypes(JSON.parse(cleanedText));

      // Verify and fix YouTube URLs using the dedicated service
      console.log("Verifying YouTube URLs...");
      const verifiedResponse =
        await YouTubeVerificationService.verifyAndCleanWorkoutUrls(
          fixedResponse,
        );

      // Validate AI response using Zod - should always be an array
      const validatedWorkouts = this.validateOutput(verifiedResponse);

      if (!validatedWorkouts || validatedWorkouts.length === 0) {
        throw new Error(
          "AI returned an empty workout array. Please try again.",
        );
      }

      // Ensure we have the correct number of workouts
      if (validatedWorkouts.length !== goals.trainingDaysPerWeek) {
        console.warn(
          `Expected ${goals.trainingDaysPerWeek} workouts but got ${validatedWorkouts.length}`,
        );
      }

      console.log("Validated workouts:", validatedWorkouts);
      return validatedWorkouts;
    } catch (error) {
      console.error("Error generating workout program with Gemini:", error);
      if (error instanceof SyntaxError) {
        throw new Error("AI returned invalid JSON. Please try again.");
      }
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to generate workout program. Please try again.",
      );
    }
  }

  private static buildWorkoutPrompt(goals: WorkoutGoals): string {
    const trainingDays = goals.trainingDaysPerWeek ?? 3;
    const workoutTypeGuidance = goals.workoutType
      ? `\nWORKOUT FOCUS: ${goals.workoutType} (create a workout specifically focused on this area)`
      : "";

    const previousProgramSection = goals.previousProgram?.length
      ? `\nPREVIOUS PROGRAM (vary and progress from this — do not repeat the same exercises):\n${goals.previousProgram.map((w) => `- "${w.title}": ${w.exercises.map((e) => `${e.name} (${e.muscle_group})`).join(", ")}`).join("\n")}\n`
      : "";

    return `You are a professional fitness trainer and exercise physiologist. Create a personalized ${trainingDays} day workout program based on the following information:

GOALS: ${goals.goals}
${goals.issues ? `PHYSICAL ISSUES/LIMITATIONS: ${goals.issues}` : ""}
EXPERIENCE LEVEL: ${goals.experience ?? "intermediate"}
TIME AVAILABLE: ${goals.timeAvailable ?? 60} minutes per workout
TRAINING FREQUENCY: ${trainingDays} days per week
${goals.equipment ? `AVAILABLE EQUIPMENT: ${goals.equipment.join(", ")}` : "EQUIPMENT: Standard gym equipment available"}${workoutTypeGuidance}${previousProgramSection}

IMPORTANT INSTRUCTIONS:
1. Create EXACTLY ${trainingDays} workout(s) for this program
2. If there are physical issues mentioned (like lower back pain, knee problems, etc.), prioritize safety and suggest modifications or alternative exercises
3. Create balanced workouts that address the stated goals
4. Consider the experience level when setting sets, reps, and exercise difficulty
5. Include proper rest periods between exercises (30-600 seconds)
6. Provide warnings for any exercises that might aggravate mentioned issues
7. Give recommendations for progression or modifications
8. If specific exercises are mentioned in the goals, prioritize including them in the workouts
9. Adjust the number of exercises and rest periods to fit within the specified time constraints

RESPONSE FORMAT - Return ONLY valid JSON in this exact structure (MUST be an array of ${trainingDays} workout objects):
[
  {
    "title": "Descriptive workout title for day 1",
    "description": "Brief description of the workout and its focus",
    "day_of_week": "The day of the week that this workout should be done as a string (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)",
    "expected_duration": "Expected duration of the workout in minutes as a number",
    "suggested_playlist": "A YouTube playlist URL for workout music. Try to use well-known fitness/workout playlists from popular channels. Format: https://www.youtube.com/playlist?list=PLAYLIST_ID",
    "exercises": [
      {
        "name": "Exercise Name",
        "type": "MUST be one of: reps|reps-sets|reps-per-side|duration|distance (NO OTHER VALUES ALLOWED)",
        "target": {
          "reps": "If type is 'reps', the number of reps to do as a string",
          "sets": "If type is 'reps-sets' or 'reps-per-side', the number of sets to do as a string",
          "per_side": "If type is 'reps-per-side', the number of reps to do per side as a string (for unilateral exercises like lunges, single-arm rows, etc.)",
          "duration": "If type is 'duration', the duration of the exercise in seconds as a string",
          "distance": "If type is 'distance', the distance of the exercise in meters as a string"
        },
        "muscle_group": "What is the primary muscle group that this exercise targets? (Chest, Back, Legs, Shoulders, Arms, Core, Full Body)",
        "difficulty": "beginner|intermediate|advanced",
        "rest_seconds": "How long should the rest be between this exercise and the next one in seconds as a number? (60 seconds is a good default)",
        "notes": "Optional safety notes, modifications or tips for this exercise",
        "video_url": "A YouTube video URL demonstrating proper form for this exercise. Use well-known fitness channels like Athlean-X, Jeff Nippard, FitnessBlender, etc. Format: https://www.youtube.com/watch?v=VIDEO_ID"
      }
    ]
  }${trainingDays > 1 ? ",\n  // ... repeat for each additional day up to day " + trainingDays : ""}
]

EXERCISE TYPE RULES - CRITICAL:
- Use "reps" for simple rep-based exercises (e.g., push-ups: 10 reps)
- Use "reps-sets" for exercises with multiple sets (e.g., bench press: 3 sets of 8 reps)
- Use "reps-per-side" for unilateral exercises (e.g., lunges: 12 per side, single-arm rows: 10 per side)
- Use "duration" for time-based exercises (e.g., plank: 30 seconds, wall sit: 45 seconds)
- Use "distance" for distance-based exercises (e.g., running: 1000 meters)
- NEVER use "reps-per-side-sets" or any other combination - it's invalid!
- For unilateral exercises with multiple sets, use "reps-per-side" and set the number of sets in the "sets" field

EXERCISE GUIDELINES:
- Include 6-10 exercises for a complete workout depending on the expected duration
- Vary muscle groups for balance unless a specific workout focus is requested
- Set appropriate rest periods (60-120 seconds typically)
- Use standard exercise names that are widely recognized
- For beginners: 2-3 sets, 8-12 reps, longer rest
- For intermediate: 3-4 sets, 8-15 reps, moderate rest
- For advanced: 3-5 sets, 6-20 reps depending on goals, shorter rest
- If specific exercises are mentioned in the goals, make sure to include them in appropriate workouts
- Adjust exercise volume and rest periods to fit within the specified time constraints

TIME MANAGEMENT GUIDELINES:
- Calculate total workout time: (exercise time + rest time) × number of exercises
- For ${goals.timeAvailable} minute workouts, plan accordingly:
  - 30-45 min: 4-6 exercises with shorter rest periods
  - 45-60 min: 6-8 exercises with moderate rest periods
  - 60-90 min: 8-10 exercises with standard rest periods
  - 90+ min: 10+ exercises with longer rest periods

YOUTUBE URL GUIDELINES:
- For exercise videos: Search for "[Exercise Name] proper form" or "[Exercise Name] technique"
- Prefer videos from established fitness channels with good production quality
- For playlists: Look for "workout music", "gym music", or "fitness motivation" playlists
- Use complete, properly formatted YouTube URLs
- If unsure about a URL, it's better to use a generic fitness-related URL than a fake one

Remember: Safety first, especially with mentioned physical limitations. Use clear, standard exercise names. All URLs will be verified, so try to use real YouTube content. Respond with ONLY the JSON array of ${trainingDays} workout objects, no additional text.`;
  }

  private static removeAIResponseFormatting(text: string): string {
    // Remove any markdown formatting or extra text
    let cleaned = text.trim();

    // Find JSON boundaries - check for both objects and arrays
    const objectStart = cleaned.indexOf("{");
    const arrayStart = cleaned.indexOf("[");

    let jsonStart = -1;
    let jsonEnd = -1;

    // Determine if we have an object or array, and which comes first
    if (objectStart !== -1 && (arrayStart === -1 || objectStart < arrayStart)) {
      // JSON object
      jsonStart = objectStart;
      jsonEnd = cleaned.lastIndexOf("}") + 1;
    } else if (arrayStart !== -1) {
      // JSON array
      jsonStart = arrayStart;
      jsonEnd = cleaned.lastIndexOf("]") + 1;
    }

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd);
    }

    // Remove any markdown code block markers
    cleaned = cleaned.replace(/```json\s*/g, "").replace(/```\s*/g, "");

    return cleaned;
  }

  private static fixExerciseTypes(response: any[]): any[] {
    return response.map((workout) => {
      if (!workout.exercises || !Array.isArray(workout.exercises)) {
        return workout;
      }

      const fixedExercises = workout.exercises.map((exercise: any) => {
        if (!exercise.type) {
          return exercise;
        }

        // Fix common invalid exercise types
        let fixedType = exercise.type;
        const validTypes = [
          "reps",
          "reps-sets",
          "reps-per-side",
          "duration",
          "distance",
        ];

        // Handle invalid combinations
        if (exercise.type === "reps-per-side-sets") {
          fixedType = "reps-per-side";
          // Add sets information to notes if not already present
          if (!exercise.notes || !exercise.notes.includes("sets")) {
            const setsInfo = exercise.target?.sets
              ? `${exercise.target.sets} sets`
              : "3 sets";
            exercise.notes = exercise.notes
              ? `${exercise.notes}. ${setsInfo}`
              : setsInfo;
          }
        }

        // If type is still invalid, try to infer the correct type
        if (!validTypes.includes(fixedType)) {
          console.warn(
            `Invalid exercise type "${exercise.type}" found, attempting to fix...`,
          );

          // Try to infer from exercise name or target values
          if (exercise.target?.duration) {
            fixedType = "duration";
          } else if (exercise.target?.distance) {
            fixedType = "distance";
          } else if (exercise.target?.per_side) {
            fixedType = "reps-per-side";
          } else if (exercise.target?.sets && exercise.target?.reps) {
            fixedType = "reps-sets";
          } else {
            // Default fallback
            fixedType = "reps-sets";
            console.warn(
              `Could not infer exercise type for "${exercise.name}", defaulting to "reps-sets"`,
            );
          }
        }

        return {
          ...exercise,
          type: fixedType,
        };
      });

      return {
        ...workout,
        exercises: fixedExercises,
      };
    });
  }
}
