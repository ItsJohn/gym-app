import { z } from "zod";
import { TargetSchema } from "./schemas";

export const SessionSetSchema = z.object({
  id: z.number().int().positive().nullish(),
  session_id: z.number().int().positive(),
  exercise_id: z.string(),
  target: TargetSchema,
  is_completed: z.coerce.boolean().default(false),
  completed_at: z.string().datetime().nullish(),
  created_at: z.string().datetime().nullish(),
  updated_at: z.string().datetime().nullish(),
});

export type SessionSet = z.infer<typeof SessionSetSchema>;
