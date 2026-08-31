import { useQuery } from "@tanstack/react-query";
import {
  getOwnerServices,
  getCustomerServices,
} from "../../services/services/getServices";
import { useAuth } from "../../context/AuthContext";
import { useUserType } from "../../context/UserTypeContext";
import { useJoinedBusiness } from "../../context/JoinedBusinessContext";

export const useGetServices = () => {
  const { isAuthenticated, user } = useAuth();
  const { userType } = useUserType();
  const { joinedBusiness, hasJoinedBusiness, isReady } = useJoinedBusiness();

  const isOwner =
    userType === "owner" || !!(user as { is_owner?: boolean } | null)?.is_owner;

  const code = (joinedBusiness?.random_code ?? "").trim();

  return useQuery({
    queryKey: isOwner
      ? (["services", "owner"] as const)
      : (["services", "customer", code] as const),
    queryFn: () => (isOwner ? getOwnerServices() : getCustomerServices(code)),
    enabled:
      isAuthenticated &&
      isReady !== false &&
      (isOwner || (hasJoinedBusiness && code.length > 0)),
    retry: false,
  });
};
