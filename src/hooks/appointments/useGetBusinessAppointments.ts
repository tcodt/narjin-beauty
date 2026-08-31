import { useQuery } from "@tanstack/react-query";
import { getBusinessAppointments } from "../../services/appointments/getBusinessAppointments";
import { useAuth } from "../../context/AuthContext";
import { useUserType } from "../../context/UserTypeContext";

export const useGetBusinessAppointments = () => {
  const { isAuthenticated, user } = useAuth();
  const { userType } = useUserType();
  const isOwner =
    userType === "owner" || !!(user as { is_owner?: boolean })?.is_owner;

  return useQuery({
    queryKey: ["business-appointments"],
    queryFn: getBusinessAppointments,
    enabled: isAuthenticated && isOwner,
    refetchInterval: 60_000, // poll for new requests
    retry: false,
  });
};
