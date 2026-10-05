import api from "../../utils/api";
import { QrResponse } from "../../types/payments";

export const getBookingQr = async (
  randomCode: string,
  baseUrl?: string,
): Promise<QrResponse> => {
  const { data } = await api.get(`/payments/qr/${randomCode}/`, {
    params: baseUrl ? { base_url: baseUrl } : undefined,
  });
  return data;
};
