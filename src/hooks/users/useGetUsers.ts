import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../../services/users/getUsers";
import { useAcl } from "../../context/AclContext";

/**
 * لیست کاربران پلتفرم فقط برای سوپریوزر / user_list.
 * صاحب سالن → 403؛ query را اصلاً fire نکن.
 */
export const useGetUsers = () => {
  const { isSuperuser, hasPermission } = useAcl();
  const allowed = isSuperuser || hasPermission("user_list");

  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: allowed,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 403 || status === 401) return false;
      return failureCount < 2;
    },
  });
};
