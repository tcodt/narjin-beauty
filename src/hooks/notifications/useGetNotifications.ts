import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../../services/notifications/getNotifications";
import { useAuth } from "../../context/AuthContext";

export const useGetNotifications = (options?: { is_read?: boolean }) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["notifications", options?.is_read ?? "all"] as const,
    queryFn: () => getNotifications(options),
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
};
