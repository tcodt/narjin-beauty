export interface Feature {
  id: number;
  title: string;
  key: string;
  description?: string;
}

export interface PlanFeature {
  feature: Feature;
  is_included?: boolean;
  /** فقط برای نمایش در صفحهٔ تعرفه */
  value?: string | null;
}

export interface Plan {
  id: number;
  title: string;
  price: number;
  duration_days: number;
  is_recommended?: boolean;
  features: PlanFeature[];
}

/** وضعیت اشتراک از access endpoint */
export type SubscriptionAccessStatus = "trial" | "paid" | "blocked";

export interface AccessFeature {
  key: string;
  title: string;
  is_core?: boolean;
  permissions?: string[];
  description?: string;
}

export interface LockedFeature {
  key: string;
  title: string;
  description?: string;
}

/**
 * پاسخ اصلی: GET /landing/subscription/access/
 * منبع حقیقت دسترسی و فیچر
 */
export interface SubscriptionAccess {
  status: SubscriptionAccessStatus;
  can_use_panel: boolean;
  days_remaining?: number | null;
  trial_end?: string | null;
  paid_until?: string | null;
  plan?: { id: number; title: string } | null;
  intended_plan?: { id: number; title: string } | null;
  features: AccessFeature[];
  locked_features: LockedFeature[];
  permissions: string[];
  message?: string | null;
}

/** GET /landing/subscription/status/ — features لیست رشته است */
export interface SubscriptionStatusResponse {
  status: SubscriptionAccessStatus | string;
  can_use_panel?: boolean;
  days_remaining?: number | null;
  trial_end?: string | null;
  paid_until?: string | null;
  plan?: { id: number; title: string } | null;
  features?: string[];
  feature_details?: AccessFeature[];
  locked_features?: LockedFeature[];
  permissions?: string[];
  message?: string | null;
}

/** سازگاری با کدهای قدیمی */
export type SubscriptionStatus = SubscriptionAccessStatus | string;

export interface Subscription {
  id?: number;
  can_use_panel?: boolean;
  status?: SubscriptionStatus;
  trial_end?: string | null;
  paid_until?: string | null;
  days_remaining?: number | null;
  plan?: { id: number; title: string; features?: PlanFeature[] } | null;
  features?: PlanFeature[] | string[] | AccessFeature[];
  feature_details?: AccessFeature[];
  locked_features?: LockedFeature[];
  permissions?: string[];
  active?: boolean;
  is_active?: boolean;
  message?: string | null;
}

export type SubscriptionOrderStatus =
  | "pending"
  | "awaiting_review"
  | "approved"
  | "rejected"
  | "cancelled";

export interface SubscriptionOrder {
  id: number;
  plan: Plan;
  plan_id: number;
  amount: number;
  status: SubscriptionOrderStatus;
  tracking_code: string;
  card_number?: string | null;
  receipt_image?: string | null;
  user_note?: string | null;
  admin_note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderPayload {
  plan_id: number;
  user_note?: string;
}

export interface SelectPlanPayload {
  plan_id: number;
}

export interface FeatureCheckResponse {
  allowed: boolean;
  status?: string;
  days_remaining?: number | null;
  key?: string;
  [key: string]: unknown;
}
