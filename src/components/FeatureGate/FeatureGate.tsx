import React from "react";
import { Navigate, useLocation } from "react-router";
import { getFeatureKeyForPath } from "../../constants/featureRoutes";
import FeatureLocked from "../FeatureLocked/FeatureLocked";
import Loading from "../Loading/Loading";
import { useFeatures } from "../../hooks/subscription/useFeature";

interface FeatureGateProps {
  children: React.ReactNode;
  /** اگر مشخص نشود، از مسیر فعلی با getFeatureKeyForPath گرفته می‌شود */
  featureKey?: string | null;
  /** در صورت قفل بودن، به جای صفحهٔ قفل، به /plans ریدایرکت شود */
  redirectOnLocked?: boolean;
}

/**
 * Route Guard فیچر
 * - منبع حقیقت: GET /landing/subscription/access/
 * - کلیدها کاملاً از backend می‌آیند
 * - null = مسیر بدون محدودیت فیچر
 */
const FeatureGate: React.FC<FeatureGateProps> = ({
  children,
  featureKey,
  redirectOnLocked = false,
}) => {
  const { pathname } = useLocation();
  const { hasFeature, isLocked, isLoading, panelOk, status, getFeature } =
    useFeatures();

  const key =
    featureKey !== undefined ? featureKey : getFeatureKeyForPath(pathname);

  if (isLoading) {
    return <Loading />;
  }

  // اشتراک مسدود / منقضی
  if (!panelOk || status === "blocked") {
    if (redirectOnLocked) {
      return (
        <Navigate
          to="/plans"
          replace
          state={{ from: pathname, reason: "subscription_required" }}
        />
      );
    }
    return (
      <FeatureLocked
        title="اشتراک شما منقضی شده"
        description="برای ادامه استفاده از پنل، یک پلن فعال تهیه کنید."
      />
    );
  }

  // مسیر بدون فیچر
  if (key === null || key === undefined) {
    return <>{children}</>;
  }

  // فیچر در locked_features
  if (isLocked(key)) {
    const feature = getFeature(key);
    if (redirectOnLocked) {
      return (
        <Navigate
          to="/plans"
          replace
          state={{ from: pathname, lockedFeature: key }}
        />
      );
    }
    return (
      <FeatureLocked
        title={
          feature?.title
            ? `قابلیت «${feature.title}» در پلن فعلی فعال نیست`
            : "این قابلیت در پلن فعلی فعال نیست"
        }
        description="برای استفاده از این بخش، پلن مناسب را انتخاب کنید."
      />
    );
  }

  // فیچر در features نیست
  if (!hasFeature(key)) {
    if (redirectOnLocked) {
      return (
        <Navigate
          to="/plans"
          replace
          state={{ from: pathname, lockedFeature: key }}
        />
      );
    }
    return (
      <FeatureLocked
        title="این قابلیت در پلن فعلی فعال نیست"
        description="برای استفاده از این بخش، پلن مناسب را انتخاب کنید."
        featureKey={key}
      />
    );
  }

  return <>{children}</>;
};

export default FeatureGate;
