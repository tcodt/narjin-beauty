import api from "../../utils/api";
import type {
  Plan,
  Subscription,
  SubscriptionAccess,
  SubscriptionStatusResponse,
  SubscriptionOrder,
  CreateOrderPayload,
  SelectPlanPayload,
  FeatureCheckResponse,
} from "../../types/subscription";

export const getPlans = async (): Promise<Plan[]> => {
  const { data } = await api.get<Plan[]>("/landing/plans/");
  return data;
};

/**
 * منبع اصلی حقیقت دسترسی و فیچر
 * GET /landing/subscription/access/
 * 404 = کاربر سالن ندارد (مثلاً سوپریوزر یا مشتری)
 */
export const getSubscriptionAccess =
  async (): Promise<SubscriptionAccess | null> => {
    try {
      const { data } = await api.get<SubscriptionAccess>(
        "/landing/subscription/access/",
      );
      return data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) return null;
      throw err;
    }
  };

/** GET /landing/subscription/status/ — features الان لیست رشته است */
export const getSubscriptionStatus =
  async (): Promise<SubscriptionStatusResponse | null> => {
    try {
      const { data } = await api.get<SubscriptionStatusResponse>(
        "/landing/subscription/status/",
      );
      return data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) return null;
      throw err;
    }
  };

/** GET /landing/subscription/ — سازگاری */
export const getSubscription = async (): Promise<Subscription | null> => {
  try {
    const { data } = await api.get<Subscription>("/landing/subscription/");
    return data;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response
      ?.status;
    if (status === 404) return null;
    throw err;
  }
};

export const checkFeature = async (
  key: string,
): Promise<FeatureCheckResponse> => {
  const { data } = await api.get<FeatureCheckResponse>(
    `/landing/subscription/features/${encodeURIComponent(key)}/`,
  );
  return data;
};

export const selectPlan = async (
  payload: SelectPlanPayload,
): Promise<unknown> => {
  const { data } = await api.post(
    "/landing/subscription/select-plan/",
    payload,
  );
  return data;
};

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<SubscriptionOrder> => {
  const { data } = await api.post<SubscriptionOrder>(
    "/landing/subscription/orders/",
    payload,
  );
  return data;
};

export const listOrders = async (): Promise<SubscriptionOrder[]> => {
  const { data } = await api.get<SubscriptionOrder[]>(
    "/landing/subscription/orders/list/",
  );
  return data;
};

export const uploadReceipt = async (
  orderId: number,
  file: File,
  userNote?: string,
): Promise<SubscriptionOrder> => {
  const formData = new FormData();
  formData.append("receipt_image", file);
  if (userNote) formData.append("user_note", userNote);

  const { data } = await api.post<SubscriptionOrder>(
    `/landing/subscription/orders/${orderId}/receipt/`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};
