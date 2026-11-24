import { useFeatures, canUsePanel } from "./useFeature";

export { canUsePanel };

export const useHasFeature = (featureKey?: string | null, enabled = true) => {
  const { hasFeature, isLoading, panelOk, getFeature } = useFeatures(enabled);

  if (!featureKey) {
    return {
      hasFeature: panelOk,
      isLoading,
      allowed: panelOk,
      feature: null,
    };
  }

  const allowed = hasFeature(featureKey);

  return {
    hasFeature: allowed,
    isLoading,
    allowed,
    feature: getFeature(featureKey) ?? null,
  };
};
