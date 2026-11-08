export interface Feature {
  id: number;
  title: string;
  key: string;
  description?: string;
}

export interface PlanFeature {
  feature: Feature;
  value: string; // دارد | ندارد | 5 | نامحدود
}

export interface Plan {
  id: number;
  title: string;
  price: number;
  duration_days: number;
  features: PlanFeature[];
}

/** وضعیت اشتراک مالک (از GET /subscription/ یا /status/) */
export type SubscriptionStatus =
  | "trial"
  | "pending"
  | "paid"
  | "expired"
  | "rejected"
  | string;

export interface Subscription {
  id: number;
  plan: Plan | null;
  plan_id?: number | null;
  business_id?: number;
  trial_start?: string | null;
  trial_end?: string | null;
  expires_at?: string | null;
  end_date?: string | null;
  active?: boolean;
  is_active?: boolean;
  status?: SubscriptionStatus;
  /** اگر بک‌اند بفرستد */
  can_use_panel?: boolean;
  features?: PlanFeature[];
  plan_name?: string | null;
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
  /** در schema نیست؛ اگر API بفرستد استفاده می‌کنیم */
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
  key: string;
  has_feature?: boolean;
  allowed?: boolean;
  value?: string | null;
  [key: string]: unknown;
}
