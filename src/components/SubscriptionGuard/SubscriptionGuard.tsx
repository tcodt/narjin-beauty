import React from "react";
import { Navigate, useLocation } from "react-router";
import { useFeatures, canUsePanel } from "../../hooks/subscription/useFeature";
import { useAcl } from "../../context/AclContext";
import Loading from "../Loading/Loading";

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

const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const { isBusinessOwner, isOwner, role, isLoading: aclLoading } = useAcl();
  const isOwnerClient = isBusinessOwner || isOwner || role === "admin";

  const { access, isLoading, status } = useFeatures(
    isOwnerClient && !aclLoading,
  );

  if (aclLoading) return <Loading />;
  if (!isOwnerClient) return <>{children}</>;

  if (isAllowedPath(location.pathname)) {
    return <>{children}</>;
  }

  if (isLoading) return <Loading />;

  // blocked یا بدون اشتراک → صفحهٔ انتخاب پلن
  if (!access || status === "blocked" || !canUsePanel(access)) {
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
