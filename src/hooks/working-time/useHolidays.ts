import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getHolidays,
  createHoliday,
  deleteHoliday,
} from "../../services/working-time/holidays";

export const useHolidays = () =>
  useQuery({
    queryKey: ["working_hours", "holidays"],
    queryFn: getHolidays,
  });

export const useCreateHoliday = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createHoliday,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["working_hours", "holidays"] }),
  });
};

export const useDeleteHoliday = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["working_hours", "holidays"] }),
  });
};
