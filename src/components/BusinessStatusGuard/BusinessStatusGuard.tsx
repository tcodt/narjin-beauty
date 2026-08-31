import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useUserType } from "../../context/UserTypeContext";
import { useBusinessMe } from "../../hooks/business/useBusinessMe";
import { useJoinedBusiness } from "../../context/JoinedBusinessContext";
import { AxiosError } from "axios";

export const BusinessStatusGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const { userType, isReady } = useUserType();
  const { hasJoinedBusiness, isReady: joinReady } = useJoinedBusiness();
  const location = useLocation();
  const isOwnerFlow = userType === "owner";

  const {
    data: businessData,
    isLoading,
    isError,
    isFetched,
    error,
    refetch,
    isFetching,
  } = useBusinessMe();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isReady || !joinReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-green-500 border-t-transparent" />
      </div>
    );
  }

  // ---------- CUSTOMER ----------
  if (!isOwnerFlow) {
    const openWithoutSalon = [
      "/join-salon",
      "/logout",
      "/user-profile",
      "/dashboard",
    ];

    if (
      userType === "customer" &&
      !hasJoinedBusiness &&
      !openWithoutSalon.includes(location.pathname)
    ) {
      return <Navigate to="/join-salon" replace />;
    }

    return <>{children}</>;
  }

  // ---------- OWNER ----------
  if (isLoading || !isFetched || isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-green-500 border-t-transparent" />
          <p className="text-gray-600">درحال بررسی کسب و کار...</p>
        </div>
      </div>
    );
  }

  const ax = error as AxiosError | null;
  const errorStatus = ax?.response?.status;
  const isNetworkError =
    !!error &&
    (!ax?.response ||
      ax.code === "ERR_NETWORK" ||
      ax.message?.includes("Network Error") ||
      ax.message?.includes("ERR_CONNECTION"));

  // Only a real 404 means "no business yet"
  const noBusiness = errorStatus === 404 || (!isError && !businessData);

  // Network / 5xx → stay on app, show retry (do NOT send to create-business)
  if (isError && isNetworkError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-gray-800 dark:text-white">
          ارتباط با سرور برقرار نشد
        </p>
        <p className="max-w-sm text-sm text-gray-500">
          خطای شبکه است، نه مشکل حساب شما. چند لحظه صبر کنید و دوباره تلاش کنید.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-xl bg-primary-green-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (isError && errorStatus && errorStatus >= 500) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-gray-800 dark:text-white">
          سرور موقتاً در دسترس نیست
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-xl bg-primary-green-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (noBusiness) {
    if (
      location.pathname === "/create-business" ||
      location.pathname === "/role-authentication"
    ) {
      return <>{children}</>;
    }
    return <Navigate to="/create-business" replace />;
  }

  if (
    businessData &&
    !businessData.is_active &&
    location.pathname !== "/waiting-room"
  ) {
    return <Navigate to="/waiting-room" replace />;
  }

  return <>{children}</>;
};
