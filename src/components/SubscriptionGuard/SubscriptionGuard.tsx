import React from "react";
import { Navigate, useLocation } from "react-router";
import { useSubscriptionStatus } from "../../hooks/subscription/useSubscription";
import { canUsePanel } from "../../hooks/subscription/useHasFeature";
import { useAcl } from "../../context/AclContext";
import Loading from "../Loading/Loading";

interface Props {
  children: React.ReactNode;
}

/** مسیرهایی که مالک بدون اشتراک فعال هم باید ببیند */
const OWNER_ALLOWED_WITHOUT_PANEL = [
  "/plans",
  "/subscription",
  "/dashboard",
  "/user-profile",
  "/settings",
  "/logout",
  "/waiting-room",
  "/create-business",
  "/business-logo",
];

const isAllowedPath = (pathname: string) =>
  OWNER_ALLOWED_WITHOUT_PANEL.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

const SubscriptionGuard: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const { isBusinessOwner, isOwner, role, isLoading: aclLoading } = useAcl();
  const isOwnerClient = isBusinessOwner || isOwner || role === "admin";

  const { data, isLoading, isError, isFetching } = useSubscriptionStatus(
    isOwnerClient && !aclLoading,
  );

  // مشتری / غیرمالک: گارد اشتراک اصلاً اعمال نشود
  if (aclLoading) return <Loading />;
  if (!isOwnerClient) return <>{children}</>;

  if (isAllowedPath(location.pathname)) {
    return <>{children}</>;
  }

  if (isLoading || isFetching) return <Loading />;

  // ۴۰۴ / بدون اشتراک / trial تمام / pending پرداخت
  if (isError || !canUsePanel(data)) {
    return (
      <Navigate
        to="/plans"
        replace
        state={{ from: location.pathname, reason: "subscription_required" }}
      />
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
