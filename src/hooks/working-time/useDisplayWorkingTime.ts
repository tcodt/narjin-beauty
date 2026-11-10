import { useQuery } from "@tanstack/react-query";
import { displayWorkingTime } from "../../services/working-time/displayWorkingTime";

export const useDisplayWorkingTime = (code: string | undefined) => {
  return useQuery({
    queryKey: ["working_time_user", code],
    queryFn: () => displayWorkingTime(code!),
    enabled: !!code?.trim(),
  });
};
