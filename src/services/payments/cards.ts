import api from "../../utils/api";
import {
  NumbersCard,
  CreateNumbersCardPayload,
  UpdateNumbersCardPayload,
} from "../../types/payments";

export const getMyCards = async (): Promise<NumbersCard[]> => {
  const { data } = await api.get("/payments/cards/number/");
  return Array.isArray(data) ? data : [];
};

export const getCard = async (id: number): Promise<NumbersCard> => {
  const { data } = await api.get(`/payments/cards/number/${id}/`);
  return data;
};

export const createCard = async (
  payload: CreateNumbersCardPayload,
): Promise<NumbersCard> => {
  const { data } = await api.post("/payments/cards/number/", payload);
  return data;
};

export const updateCard = async (
  id: number,
  payload: UpdateNumbersCardPayload,
): Promise<NumbersCard> => {
  const { data } = await api.patch(`/payments/cards/number/${id}/`, payload);
  return data;
};

export const deleteCard = async (id: number): Promise<void> => {
  await api.delete(`/payments/cards/number/${id}/`);
};

/** مشتری: لیست کارت‌های فعال یک سالن */
export const getSalonCards = async (
  randomCode: string,
): Promise<NumbersCard[]> => {
  const { data } = await api.get(`/payments/cards/number/user/${randomCode}/`);
  return Array.isArray(data) ? data : [];
};

export const getSalonCardsByQuery = async (
  businessCode: string,
): Promise<NumbersCard[]> => {
  const { data } = await api.get("/payments/cards/number/user/", {
    params: { business_code: businessCode },
  });
  return Array.isArray(data) ? data : [];
};
