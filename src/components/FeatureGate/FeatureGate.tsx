import React from "react";
import { useLocation } from "react-router";
import { getFeatureKeyForPath } from "../../constants/featureRoutes";
import FeatureLocked from "../FeatureLocked/FeatureLocked";
import Loading from "../Loading/Loading";
import { useFeatures } from "../../hooks/subscription/useFeature";

interface Props {
  children: React.ReactNode;
  /** فقط در موارد خاص override — معمولاً لازم نیست */
  featureKey?: string | null;
}

/**
 * key را از pathname → FEATURE_ROUTE_MAP می‌گیرد.
 * صفحه هیچ keyی نمی‌نویسد.
 */
const FeatureGate: React.FC<Props> = ({ children, featureKey }) => {
  const { pathname } = useLocation();
  const { hasFeature, isLoading, panelOk } = useFeatures();

  const key =
    featureKey !== undefined ? featureKey : getFeatureKeyForPath(pathname);

  if (isLoading) return <Loading />;

  if (!panelOk) {
    return (
      <FeatureLocked
        title="اشتراک شما منقضی شده"
        description="برای ادامه استفاده از پنل، یک پلن فعال تهیه کنید."
      />
    );
  }

  // این route به فیچر خاصی وصل نیست
  if (key === null || key === undefined) {
    return <>{children}</>;
  }

  if (!hasFeature(key)) {
    return (
      <FeatureLocked
        title="این قابلیت در پلن فعلی فعال نیست"
        description="برای استفاده از این بخش، پلن مناسب را انتخاب کنید."
      />
    );
  }

  return <>{children}</>;
};

export default FeatureGate;
