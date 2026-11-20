import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { registerFn } from "../../../services/accounts/register/registerFn";
import { clearAuthTokens, storeAuthTokens } from "../../../utils/tokenHelper";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useUserType } from "../../../context/UserTypeContext";
import { useJoinedBusiness } from "../../../context/JoinedBusinessContext";
import { parseApiError } from "../../../utils/parseApiError";
import { isRateLimited } from "../../../utils/rateLimit";

export const useRegister = () => {
  const queryClient = useQueryClient();
  const { login: loginContext } = useAuth();
  const navigate = useNavigate();
  const { clearUserType } = useUserType();
  const { clearJoinedBusiness } = useJoinedBusiness();

  return useMutation({
    mutationFn: registerFn,
    onSuccess: (data) => {
      // New account → wipe previous role / salon from this browser
      clearUserType();
      clearJoinedBusiness();
      localStorage.removeItem("userType");
      localStorage.removeItem("joinedBusiness");

      storeAuthTokens(data);
      queryClient.setQueryData(["userProfile"], data.user);
      loginContext({ access: data.access, refresh: data.refresh }, data.user);

      toast.success("ثبت‌نام با موفقیت انجام شد!");
      navigate("/role-authentication", { replace: true });
    },
    onError: (error: unknown) => {
      toast.error(parseApiError(error));
      if (!isRateLimited(error)) {
        clearAuthTokens();
      }
    },
  });
};
