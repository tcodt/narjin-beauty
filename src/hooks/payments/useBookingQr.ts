import { useQuery } from "@tanstack/react-query";
import { getBookingQr } from "../../services/payments/qr";

export const useBookingQr = (
  randomCode: string | undefined | null,
  baseUrl?: string,
) => {
  const code = (randomCode ?? "").trim();

  return useQuery({
    queryKey: ["booking-qr", code, baseUrl ?? ""],
    queryFn: () => getBookingQr(code, baseUrl),
    enabled: code.length > 0,
    staleTime: 5 * 60_000,
  });
};
