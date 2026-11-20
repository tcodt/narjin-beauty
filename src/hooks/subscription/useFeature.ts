import { useMemo } from "react";
import { useSubscriptionStatus } from "./useSubscription";
import type { PlanFeature, Subscription } from "../../types/subscription";

export const canUsePanel = (sub?: Subscription | null): boolean => {
  if (!sub) return false;
  if (typeof sub.can_use_panel === "boolean") return sub.can_use_panel;
  if (sub.active === true || sub.is_active === true) return true;
  if (sub.status === "paid") return true;
  if (sub.status === "trial") {
    if (sub.trial_end) return Date.now() < new Date(sub.trial_end).getTime();
    return true;
  }
  if (sub.trial_end) return Date.now() < new Date(sub.trial_end).getTime();
  return false;
};

const isEnabledValue = (value?: string | null): boolean => {
  if (value == null) return false;
  const v = String(value).trim();
  if (!v) return false;
  const lower = v.toLowerCase();
  if (
    lower === "ندارد" ||
    lower === "0" ||
    lower === "false" ||
    lower === "no"
  ) {
    return false;
  }
  return true;
};

const extractPlanFeatures = (sub?: Subscription | null): PlanFeature[] => {
  if (!sub) return [];
  if (Array.isArray(sub.features) && sub.features.length > 0) {
    return sub.features;
  }
  if (Array.isArray(sub.plan?.features) && sub.plan!.features!.length > 0) {
    return sub.plan!.features!;
  }
  return [];
};

/**
 * منبع حقیقت فیچرها از بک‌اند (subscription status)
 */
export const useFeatures = (enabled = true) => {
  const {
    data: sub,
    isLoading,
    isError,
    isFetching,
  } = useSubscriptionStatus(enabled);

  const panelOk = canUsePanel(sub);

  const { allowedKeys, featureMap, features } = useMemo(() => {
    const list = extractPlanFeatures(sub);
    const map = new Map<string, PlanFeature>();
    const keys = new Set<string>();

    for (const item of list) {
      const key = item?.feature?.key?.trim();
      if (!key) continue;
      const normalized = key.toLowerCase();
      map.set(normalized, item);
      if (isEnabledValue(item.value)) {
        keys.add(normalized);
      }
    }

    return {
      allowedKeys: keys,
      featureMap: map,
      features: list,
    };
  }, [sub]);

  const hasFeature = (key?: string | null): boolean => {
    if (!key) return panelOk;
    if (!panelOk) return false;
    return allowedKeys.has(key.toLowerCase());
  };

  const getFeatureValue = (key: string): string | null => {
    return featureMap.get(key.toLowerCase())?.value ?? null;
  };

  return {
    isLoading: isLoading || isFetching,
    isError,
    panelOk,
    features,
    allowedKeys,
    hasFeature,
    getFeatureValue,
    subscription: sub ?? null,
  };
};
