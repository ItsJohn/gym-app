import { z } from "zod";

export const SessionSchema = z.object({
  id: z.number().int().positive().nullish(),
  workout_id: z.number().int().positive(),
  started_at: z.string().datetime().nullish(),
  completed_at: z.string().datetime().nullish(),
  is_completed: z.boolean().default(false),
  notes: z.string().nullable(),
  created_at: z.string().datetime().nullish(),
  updated_at: z.string().datetime().nullish(),
});

export type Session = z.infer<typeof SessionSchema>;
