import { useSubscriptionStatus } from "./useSubscription";
import type { Subscription } from "../../types/subscription";

export const canUsePanel = (sub?: Subscription | null): boolean => {
  if (!sub) return false;
  if (typeof sub.can_use_panel === "boolean") return sub.can_use_panel;
  if (sub.active === true || sub.is_active === true) return true;
  if (sub.status === "paid" || sub.status === "trial") {
    if (sub.trial_end && sub.status === "trial") {
      return Date.now() < new Date(sub.trial_end).getTime();
    }
    return true;
  }
  if (sub.trial_end) {
    return Date.now() < new Date(sub.trial_end).getTime();
  }
  return false;
};

export const useHasFeature = (featureKey: string) => {
  const { data: sub, isLoading, isError } = useSubscriptionStatus();

  if (isLoading) {
    return { hasFeature: false, isLoading: true, value: null as string | null };
  }

  if (isError || !sub || !canUsePanel(sub)) {
    return { hasFeature: false, isLoading: false, value: null };
  }

  const features = sub.features ?? sub.plan?.features ?? [];
  const found = features.find(
    (f) => f.feature.key.toLowerCase() === featureKey.toLowerCase(),
  );

  if (!found) {
    return { hasFeature: false, isLoading: false, value: null };
  }

  const value = found.value?.trim() ?? null;
  const hasFeature =
    value !== "ندارد" && value !== "0" && value !== "" && value != null;

  return { hasFeature, isLoading: false, value };
};
