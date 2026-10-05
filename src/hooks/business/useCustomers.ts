import { useQuery } from "@tanstack/react-query";
import { getMyCustomers } from "../../services/business/customers";
import { useAuth } from "../../context/AuthContext";

export const useMyCustomers = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["my-customers"],
    queryFn: getMyCustomers,
    enabled: isAuthenticated,
  });
};
