import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ExerciseService } from "@/database/services/exerciseService";
import { UpdateExercise } from "@/database/types";
import { Exercise } from "@/validation/schemas";

export const exerciseKeys = {
  exercises: () => ["exercise"] as const,
  exercise: (id: string) => ["exercise", id] as const,
};

export const useCreateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exercise: Exercise) =>
      ExerciseService.createExercise(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.exercises() });
    },
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateExercise }) =>
      ExerciseService.updateExercise(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.exercise(id) });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.exercises() });
    },
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ExerciseService.deleteExercise(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.exercises() });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.exercise(id) });
    },
  });
};
