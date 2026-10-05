import api from "../../utils/api";
import {
  ManualPayment,
  CreateManualPaymentPayload,
  ReviewManualPaymentPayload,
} from "../../types/payments";

export const getManualPayments = async (): Promise<ManualPayment[]> => {
  const { data } = await api.get("/payments/manual-payments/");
  return Array.isArray(data) ? data : [];
};

export const getManualPayment = async (id: number): Promise<ManualPayment> => {
  const { data } = await api.get(`/payments/manual-payments/${id}/`);
  return data;
};

export const createManualPayment = async (
  payload: CreateManualPaymentPayload,
): Promise<ManualPayment> => {
  const form = new FormData();
  form.append("business_code", payload.business_code);
  form.append("amount", String(payload.amount));
  form.append("tracking_code", payload.tracking_code);
  if (payload.appointment != null) {
    form.append("appointment", String(payload.appointment));
  }
  form.append("receipt_image", payload.receipt_image);

  const { data } = await api.post("/payments/manual-payments/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const reviewManualPayment = async (
  id: number,
  payload: ReviewManualPaymentPayload,
): Promise<void> => {
  await api.patch(`/payments/manual-payments/${id}/status/`, payload);
};
