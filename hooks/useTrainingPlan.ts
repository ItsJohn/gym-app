import { TrainingPlanService } from "@/database/services/trainingPlanService";
import { ActivePlanDay, TrainingPlan } from "@/database/types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export const trainingPlanKeys = {
  all: ["trainingPlan"] as const,
  active: () => [...trainingPlanKeys.all, "active"] as const,
  todaysDay: () => [...trainingPlanKeys.all, "todaysDay"] as const,
};

export function useActivePlan() {
  return useQuery({
    queryKey: trainingPlanKeys.active(),
    queryFn: () => TrainingPlanService.getActivePlan(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTodaysPlanDay() {
  return useQuery<ActivePlanDay | null>({
    queryKey: trainingPlanKeys.todaysDay(),
    queryFn: () => TrainingPlanService.getTodaysPlanDay(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurrentWeekPlan() {
  return useQuery({
    queryKey: [...trainingPlanKeys.all, "currentWeek"] as const,
    queryFn: () => TrainingPlanService.getCurrentWeekDays(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: number) => TrainingPlanService.deletePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingPlanKeys.all });
    },
  });
}

export function useDeactivatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => TrainingPlanService.deactivateAllPlans(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingPlanKeys.all });
    },
  });
}
