import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "../../services/notifications/getUnreadCount";
import { useAuth } from "../../context/AuthContext";

export const useUnreadCount = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["notifications", "unread-count"] as const,
    queryFn: getUnreadCount,
    enabled: isAuthenticated,
    staleTime: 20_000,
    refetchInterval: 45_000,
  });
};
