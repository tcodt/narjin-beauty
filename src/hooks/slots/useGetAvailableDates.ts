import { useQuery } from "@tanstack/react-query";
import { getAvailableDatesForService } from "../../services/slots/getAvaialbleDates";

export const useGetAvailableDates = (
  serviceId: number | null | undefined,
  daysAhead = 60,
) => {
  return useQuery({
    queryKey: ["available-dates", serviceId, daysAhead] as const,
    queryFn: () => getAvailableDatesForService(serviceId!, daysAhead),
    enabled: !!serviceId && serviceId > 0,
    staleTime: 60_000,
    retry: false,
  });
};
