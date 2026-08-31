// src/hooks/business/useBusinessMe.ts
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useUserType } from "../../context/UserTypeContext";
import { businessMe } from "../../services/business/businessMe";

export const useBusinessMe = () => {
  const { isAuthenticated } = useAuth();
  const { userType } = useUserType();

  return useQuery({
    queryKey: ["business-me"],
    queryFn: businessMe,
    enabled: isAuthenticated && userType === "owner",
    retry: 2,
    retryDelay: 1500,
    staleTime: 30_000,
  });
};
