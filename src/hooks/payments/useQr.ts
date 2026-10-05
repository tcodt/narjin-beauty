import { useQuery } from "@tanstack/react-query";
import { getBookingQr } from "../../services/payments/qr";

export const useBookingQr = (
  randomCode: string | undefined,
  baseUrl?: string,
) => {
  return useQuery({
    queryKey: ["booking-qr", randomCode, baseUrl],
    queryFn: () => getBookingQr(randomCode!, baseUrl),
    enabled: !!randomCode,
  });
};
