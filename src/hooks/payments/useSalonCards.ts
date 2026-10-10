import { useQuery } from "@tanstack/react-query";
import { getSalonCards } from "../../services/payments/cards";

export const useSalonCards = (randomCode: string | undefined) => {
  return useQuery({
    queryKey: ["salon-cards", randomCode],
    queryFn: () => getSalonCards(randomCode!),
    enabled: !!randomCode,
  });
};
