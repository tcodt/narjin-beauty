import api from "../../utils/api";
import { QrResponse } from "../../types/payments";

export const getBookingQr = async (
  randomCode: string,
  baseUrl?: string,
): Promise<QrResponse> => {
  const code = randomCode.trim();
  const { data } = await api.get(`/payments/qr/${encodeURIComponent(code)}/`, {
    params: baseUrl ? { base_url: baseUrl } : undefined,
  });
  return data;
};
