import {
  validateWorkoutArray,
  validateWorkoutGoals,
  Workout,
  WorkoutGoals,
} from "@/validation/schemas";
import { CreatePlanDayInput } from "@/database/services/trainingPlanService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { YouTubeVerificationService } from "./youtubeVerificationService";

export interface TrainingPlanAIResponse {
  plan_name: string;
  total_weeks: number;
  gym_workouts: Workout[];
  schedule: Array<{
    week: number;
    days: Array<{
      day_of_week: number;
      type:
        | "easy_run"
        | "tempo_run"
        | "intervals"
        | "long_run"
        | "race"
        | "gym"
        | "rest";
      distance_km?: number;
      pace_note?: string;
      duration_minutes?: number;
      notes?: string;
      gym_workout_index?: number;
    }>;
  }>;
}

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

    return `You are a professional fitness trainer and exercise physiologist with deep knowledge of safe, evidence-based programming. Create a personalized ${trainingDays}-day workout program based on the following user profile:

USER PROFILE
GOALS: ${goals.goals}
${goals.issues ? `PHYSICAL ISSUES / LIMITATIONS: ${goals.issues}` : ""}
EXPERIENCE LEVEL: ${goals.experience ?? "intermediate"}
TIME AVAILABLE: ${goals.timeAvailable ?? 60} minutes per workout
TRAINING FREQUENCY: ${trainingDays} days per week
${goals.equipment ? `AVAILABLE EQUIPMENT: ${goals.equipment.join(", ")}` : "EQUIPMENT: Standard gym equipment available"}
${workoutTypeGuidance ?? ""}
${previousProgramSection ?? ""}

CORE REQUIREMENTS
1. Create EXACTLY ${trainingDays} workout objects — no more, no less.
2. Prioritize safety above all.
3. Scale sets, reps, rest, and exercise complexity to the experience level.
4. Respect time availability by limiting total exercises and volume.
5. Use only widely recognized, standard exercise names.
6. Do NOT invent exercise variations or novel naming.
7. Do NOT include advanced intensity techniques unless experience level is "advanced".
8. If user specified exercises in goals, include them prominently.

SAFETY RULES (MANDATORY)
If physical limitations are provided:
* Avoid known contraindicated movements.
* Avoid heavy spinal loading if back pain is mentioned.
* Avoid deep knee flexion if knee pain is mentioned unless stated tolerable.
* Avoid overhead pressing if shoulder impingement is mentioned.
* Provide safer alternatives or modification notes when relevant.
* Include at least one stability, mobility, or corrective element if limitations exist.
If no limitations are provided, still program conservatively and safely.

PROGRAM STRUCTURE RULES
Choose an appropriate split based on frequency:
* 2 days → Full Body or Upper/Lower
* 3 days → Full Body or Push/Pull/Legs
* 4 days → Upper/Lower split
* 5–6 days → Push/Pull/Legs or structured body-part split
Additional structure constraints:
* Avoid training the same primary muscle group on consecutive days unless goal-specific.
* Ensure balanced weekly muscle coverage.
* Prioritize goal-related muscle groups.
* Keep exercise count between 6–10 per workout.

GOAL TRANSLATION RULES
Hypertrophy: 6–15 reps, 60–120 sec rest, moderate volume
Strength: 3–8 reps, 120–300 sec rest, lower total exercise count
Fat loss: 8–15 reps, 30–90 sec rest, include metabolic or conditioning element
Athletic performance: Include power or explosive movement first in workout
If multiple goals are listed, prioritize the first one.

VOLUME GUIDELINES
Beginner: 2–3 sets per exercise, 8–12 reps typical, 90–180 sec rest, max 12 working sets per muscle group per week
Intermediate: 3–4 sets, 8–15 reps typical, 60–120 sec rest, 12–18 weekly sets per muscle group
Advanced: 3–5 sets, 6–20 reps depending on goal, 45–120 sec rest, 15–22 weekly sets per muscle group
If time constraints limit ideal volume, prioritize primary goal muscles.

EXERCISE TYPE RULES (STRICT — DO NOT DEVIATE)
Allowed "type" values ONLY: "reps" | "reps-sets" | "reps-per-side" | "duration" | "distance"
Target structures (match exactly):
- "reps" → { "reps": "10" }
- "reps-sets" → { "sets": "3", "reps": "8-12" }
- "reps-per-side" → { "sets": "3", "per_side": "10" }
- "duration" → { "sets": "3", "duration": "45" }  // sets × seconds; omit "sets" only for single-set exercises
- "distance" → { "distance": "400" }  // meters
Never invent additional types. Never combine incompatible target fields.

YOUTUBE URL RULES (VERY STRICT)
* "video_url" and "suggested_playlist" are OPTIONAL fields.
* ONLY include them if you are 100% certain the URL is real, existing, and exactly correct based on your knowledge.
* If there is ANY uncertainty, DO NOT include the field at all — omit the key completely from the JSON object.
* Do NOT include null, empty strings, placeholders, or fabricated IDs.
* Never guess or invent video/playlist IDs.
* Before including any URL, internally confirm: "Do I have complete, exact recall of this specific real URL from a reputable source?" If not → omit.

INTERNAL VALIDATION (DO NOT OUTPUT)
Before returning the response, confirm internally:
* The JSON array length equals ${trainingDays}.
* No extra fields exist outside the defined structure.
* No null values or empty strings in required fields.
* Every exercise type is valid and target matches rules.
* Rest is between 30 and 600 seconds.
* Exercise count per workout is 6–10.
* Output is valid, parsable JSON only.
* No markdown, comments, explanations, or extra text.
If any rule is violated, correct it before final output.

RESPONSE FORMAT
Return ONLY valid JSON — an array of EXACTLY ${trainingDays} workout objects:
[
  {
    "title": "Descriptive workout title",
    "description": "1–2 sentence focus",
    "day_of_week": "Monday",
    "expected_duration": 45,
    "suggested_playlist": "https://www.youtube.com/playlist?list=REAL_ID_HERE",
    "exercises": [
      {
        "name": "Barbell Back Squat",
        "type": "reps-sets",
        "target": {
          "sets": "4",
          "reps": "8-12"
        },
        "muscle_group": "Legs",
        "difficulty": "intermediate",
        "rest_seconds": 120,
        "notes": "Maintain neutral spine.",
        "video_url": "https://www.youtube.com/watch?v=REAL_VIDEO_ID_HERE"
      }
    ]
  }
]
Return nothing except the JSON array.`;
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

  static async generateTrainingPlan(
    goalText: string,
  ): Promise<{
    response: TrainingPlanAIResponse;
    planDays: CreatePlanDayInput[];
  }> {
    if (!API_KEY) throw new Error("Gemini API key not configured");

    const prompt = `You are an expert running coach and strength trainer. A user has described their fitness goal: "${goalText}"

Analyze this goal and create a structured training plan that combines running and gym workouts. The plan should prepare them for their goal safely and progressively.

REQUIREMENTS:
1. Determine appropriate total_weeks based on the goal (8-20 weeks typical for half marathon)
2. Create 2-3 gym workouts specifically designed for runners (legs/glutes, core stability, upper body endurance)
3. Build the weekly schedule with progressive overload - runs get longer/harder each week
4. Include rest days (at least 1-2 per week)
5. Running day types: easy_run (recovery), tempo_run (comfortably hard), intervals (speed work), long_run (weekly long run), race

GYM WORKOUT FORMAT (same as existing app format):
${JSON.stringify(
  {
    title: "Runner's Strength A",
    description: "Lower body and core for running power",
    expected_duration: 45,
    exercises: [
      {
        name: "Bulgarian Split Squat",
        type: "reps-sets",
        target: { sets: "3", reps: "10-12" },
        muscle_group: "Legs",
        difficulty: "intermediate",
        rest_seconds: 90,
        notes: "Single leg strength for running",
      },
    ],
  },
  null,
  2,
)}

EXERCISE TYPE RULES (STRICT):
- "reps" → { "reps": "10" }
- "reps-sets" → { "sets": "3", "reps": "8-12" }
- "reps-per-side" → { "sets": "3", "per_side": "10" }
- "duration" → { "sets": "3", "duration": "45" }
- "distance" → { "distance": "400" }

YOUTUBE URL RULES: Only include video_url if 100% certain the URL exists. Otherwise omit.

RESPONSE FORMAT - Return ONLY valid JSON:
{
  "plan_name": "Half Marathon Training Plan",
  "total_weeks": 10,
  "gym_workouts": [...],
  "schedule": [
    {
      "week": 1,
      "days": [
        { "day_of_week": 1, "type": "easy_run", "distance_km": 5, "pace_note": "Easy conversational pace", "notes": "First run, keep it relaxed" },
        { "day_of_week": 2, "type": "gym", "gym_workout_index": 0 },
        { "day_of_week": 3, "type": "rest" },
        { "day_of_week": 4, "type": "tempo_run", "distance_km": 4, "pace_note": "Comfortably hard, can speak short phrases" },
        { "day_of_week": 5, "type": "gym", "gym_workout_index": 1 },
        { "day_of_week": 6, "type": "long_run", "distance_km": 10, "pace_note": "Slow and steady, much slower than race pace" },
        { "day_of_week": 0, "type": "rest" }
      ]
    }
  ]
}

day_of_week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
gym_workout_index: index into the gym_workouts array (0-based)
Each week must have EXACTLY 7 day entries (one per day_of_week 0-6).
Return nothing except the JSON object.`;

    const result = await this.model.generateContent(prompt);
    const cleanedText = this.removeAIResponseFormatting(result.response.text());

    let parsed: TrainingPlanAIResponse;
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      throw new Error(
        "AI returned invalid JSON for training plan. Please try again.",
      );
    }

    // Fix gym workout exercise types
    if (parsed.gym_workouts && Array.isArray(parsed.gym_workouts)) {
      parsed.gym_workouts = this.fixExerciseTypes(parsed.gym_workouts);
      parsed.gym_workouts =
        await YouTubeVerificationService.verifyAndCleanWorkoutUrls(
          parsed.gym_workouts,
        );
    }

    // Convert AI response into CreatePlanDayInput array
    const planDays: CreatePlanDayInput[] = [];
    const runTypeMap: Record<
      string,
      "easy" | "tempo" | "intervals" | "long" | "race"
    > = {
      easy_run: "easy",
      tempo_run: "tempo",
      intervals: "intervals",
      long_run: "long",
      race: "race",
    };

    for (const week of parsed.schedule) {
      for (const day of week.days) {
        if (day.type === "rest") {
          planDays.push({
            week_number: week.week,
            day_of_week: day.day_of_week,
            day_type: "rest",
          });
        } else if (day.type === "gym") {
          const gymWorkout = parsed.gym_workouts[day.gym_workout_index ?? 0];
          planDays.push({
            week_number: week.week,
            day_of_week: day.day_of_week,
            day_type: "gym",
            // workout_id will be set after gym workouts are saved to DB
            // Store gym_workout_index in notes field temporarily via metadata
          });
          // Attach gym_workout_index for caller to resolve
          (planDays[planDays.length - 1] as any)._gym_workout_index =
            day.gym_workout_index ?? 0;
        } else {
          const runType = runTypeMap[day.type] ?? "easy";
          planDays.push({
            week_number: week.week,
            day_of_week: day.day_of_week,
            day_type: "run",
            run_target: {
              run_type: runType,
              distance_km: day.distance_km ?? 5,
              pace_note: day.pace_note,
              duration_minutes: day.duration_minutes,
              notes: day.notes,
            },
          });
        }
      }
    }

    return { response: parsed, planDays };
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
