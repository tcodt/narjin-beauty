import { useMemo } from "react";
import { useSubscriptionAccess } from "./useSubscription";
import type {
  SubscriptionAccess,
  AccessFeature,
} from "../../types/subscription";

export const canUsePanel = (access?: SubscriptionAccess | null): boolean => {
  if (!access) return false;
  if (typeof access.can_use_panel === "boolean") return access.can_use_panel;
  return access.status === "trial" || access.status === "paid";
};

/**
 * منبع حقیقت فیچر و پرمیشن از access endpoint
 */
export const useFeatures = (enabled = true) => {
  const {
    data: access,
    isLoading,
    isError,
    isFetching,
  } = useSubscriptionAccess(enabled);

  const panelOk = canUsePanel(access);

  const { allowedKeys, featureMap, features, lockedFeatures, permissions } =
    useMemo(() => {
      const list: AccessFeature[] = access?.features ?? [];
      const map = new Map<string, AccessFeature>();
      const keys = new Set<string>();

      for (const item of list) {
        const key = item?.key?.trim();
        if (!key) continue;
        const normalized = key.toLowerCase();
        map.set(normalized, item);
        keys.add(normalized);
      }

      return {
        allowedKeys: keys,
        featureMap: map,
        features: list,
        lockedFeatures: access?.locked_features ?? [],
        permissions: access?.permissions ?? [],
      };
    }, [access]);

  /** نمایش منو / بخش: وجود کلید در features */
  const hasFeature = (key?: string | null): boolean => {
    if (!key) return panelOk;
    if (!panelOk) return false;
    return allowedKeys.has(key.toLowerCase());
  };

  /** دسترسی دقیق (مثلاً دکمهٔ حذف) */
  const hasPermission = (code?: string | null): boolean => {
    if (!code) return panelOk;
    if (!panelOk) return false;
    return permissions.includes(code);
  };

  /** قابلیت قفل‌شده → نمایش «ارتقا» */
  const isLocked = (key?: string | null): boolean => {
    if (!key) return false;
    return lockedFeatures.some(
      (f) => f.key.toLowerCase() === key.toLowerCase(),
    );
  };

  const getFeature = (key: string): AccessFeature | undefined =>
    featureMap.get(key.toLowerCase());

  return {
    isLoading: isLoading || isFetching,
    isError,
    panelOk,
    status: access?.status ?? null,
    daysRemaining: access?.days_remaining ?? null,
    features,
    lockedFeatures,
    permissions,
    allowedKeys,
    hasFeature,
    hasPermission,
    isLocked,
    getFeature,
    access: access ?? null,
  };
};
