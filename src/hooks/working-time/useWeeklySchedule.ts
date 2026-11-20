import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWeeklySchedule,
  upsertWeeklySchedule,
  updateWeeklyDay,
  deleteWeeklyDay,
} from "../../services/working-time/weekly";
import type { WeeklyUpsertPayload } from "../../types/working-time";

export const useWeeklySchedule = () =>
  useQuery({
    queryKey: ["working_hours", "weekly"],
    queryFn: getWeeklySchedule,
  });

export const useUpsertWeekly = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WeeklyUpsertPayload) => upsertWeeklySchedule(payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["working_hours", "weekly"] }),
  });
};

export const useUpdateWeeklyDay = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Parameters<typeof updateWeeklyDay>[1];
    }) => updateWeeklyDay(id, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["working_hours", "weekly"] }),
  });
};

export const useDeleteWeeklyDay = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteWeeklyDay,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["working_hours", "weekly"] }),
  });
};
