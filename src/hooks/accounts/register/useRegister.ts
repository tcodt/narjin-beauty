import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { registerFn } from "../../../services/accounts/register/registerFn";
import { clearAuthTokens, storeAuthTokens } from "../../../utils/tokenHelper";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useUserType } from "../../../context/UserTypeContext";
import { useJoinedBusiness } from "../../../context/JoinedBusinessContext";

interface ApiErrorResponse {
  phone_number?: string[];
  non_field_errors?: string[];
  detail?: string[] | string;
  [key: string]: string[] | string | undefined;
}

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
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;

        if (errorData) {
          if (errorData.phone_number?.[0]) {
            toast.error(errorData.phone_number[0]);
            return;
          }
          if (errorData.non_field_errors?.[0]) {
            toast.error(errorData.non_field_errors[0]);
            return;
          }
          if (typeof errorData.detail === "string") {
            toast.error(errorData.detail);
            return;
          }
          if (Array.isArray(errorData.detail) && errorData.detail[0]) {
            toast.error(errorData.detail[0]);
            return;
          }
          const firstFieldError = Object.values(errorData).find(
            (arr) => Array.isArray(arr) && arr.length > 0,
          );
          if (firstFieldError && typeof firstFieldError[0] === "string") {
            toast.error(firstFieldError[0]);
            return;
          }
        }

        if (axiosError.response?.status === 400) {
          toast.error("اطلاعات وارد شده معتبر نیست.");
          return;
        }
      }

      console.error("Register error:", error);
      toast.error("خطایی رخ داد! لطفاً دوباره تلاش کنید.");
      clearAuthTokens();
    },
  });
};
