import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getPlans,
  getSubscriptionAccess,
  getSubscriptionStatus,
  selectPlan,
  createOrder,
  uploadReceipt,
  listOrders,
  checkFeature,
} from "../../services/landing/subscription";
import { useAuth } from "../../context/AuthContext";
import type {
  CreateOrderPayload,
  SelectPlanPayload,
} from "../../types/subscription";

export const subscriptionKeys = {
  all: ["subscription"] as const,
  access: ["subscription-access"] as const,
  status: ["subscription-status"] as const,
  plans: ["landing-plans"] as const,
  orders: ["subscription-orders"] as const,
  feature: (key: string) => ["subscription-feature", key] as const,
};

export const usePlans = () =>
  useQuery({
    queryKey: subscriptionKeys.plans,
    queryFn: getPlans,
    staleTime: 5 * 60_000,
  });

/**
 * اصلی‌ترین هوک — فقط از access استفاده کن
 */
export const useSubscriptionAccess = (enabled = true) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: subscriptionKeys.access,
    queryFn: getSubscriptionAccess,
    enabled: Boolean(isAuthenticated && enabled),
    staleTime: 30_000,
    retry: false,
  });
};

/** فقط برای سازگاری یا صفحهٔ وضعیت */
export const useSubscriptionStatus = (enabled = true) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: subscriptionKeys.status,
    queryFn: getSubscriptionStatus,
    enabled: Boolean(isAuthenticated && enabled),
    staleTime: 30_000,
    retry: false,
  });
};

export const useOrders = (enabled = true) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: subscriptionKeys.orders,
    queryFn: listOrders,
    enabled: Boolean(isAuthenticated && enabled),
    staleTime: 30_000,
  });
};

export const useFeatureCheck = (key: string, enabled = true) =>
  useQuery({
    queryKey: subscriptionKeys.feature(key),
    queryFn: () => checkFeature(key),
    enabled: Boolean(key && enabled),
    staleTime: 60_000,
    retry: false,
  });

export const useSelectPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SelectPlanPayload | number) =>
      selectPlan(typeof payload === "number" ? { plan_id: payload } : payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.access });
      qc.invalidateQueries({ queryKey: subscriptionKeys.status });
      toast.success("پلن انتخاب شد.");
    },
    onError: () => toast.error("خطا در انتخاب پلن"),
  });
};

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.orders });
      qc.invalidateQueries({ queryKey: subscriptionKeys.access });
    },
    onError: () => toast.error("خطا در ایجاد سفارش"),
  });
};

export const useUploadReceipt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      file,
      userNote,
    }: {
      orderId: number;
      file: File;
      userNote?: string;
    }) => uploadReceipt(orderId, file, userNote),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.access });
      qc.invalidateQueries({ queryKey: subscriptionKeys.orders });
      toast.success("فیش ارسال شد. منتظر بررسی ادمین باشید.");
    },
    onError: () => toast.error("خطا در ارسال فیش"),
  });
};
