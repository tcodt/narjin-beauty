import { useFeatures, canUsePanel } from "./useFeature";

export { canUsePanel };

/**
 * @param featureKey از FEATURE / FEATURE_ROUTE_MAP بیاید — داخل صفحه hardcode نکن
 */
export const useHasFeature = (featureKey?: string | null, enabled = true) => {
  const { hasFeature, isLoading, getFeatureValue, panelOk } =
    useFeatures(enabled);

  if (!featureKey) {
    return {
      hasFeature: panelOk,
      isLoading,
      value: null as string | null,
      allowed: panelOk,
    };
  }

  const allowed = hasFeature(featureKey);

  return {
    hasFeature: allowed,
    isLoading,
    value: getFeatureValue(featureKey),
    allowed,
  };
};
