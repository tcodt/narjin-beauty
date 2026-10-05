import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyCards,
  createCard,
  updateCard,
  deleteCard,
  getSalonCards,
} from "../../services/payments/cards";
import {
  CreateNumbersCardPayload,
  UpdateNumbersCardPayload,
} from "../../types/payments";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export const useMyCards = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["my-cards"],
    queryFn: getMyCards,
    enabled: isAuthenticated,
  });
};

export const useSalonCards = (randomCode: string | undefined) => {
  return useQuery({
    queryKey: ["salon-cards", randomCode],
    queryFn: () => getSalonCards(randomCode!),
    enabled: !!randomCode,
  });
};

export const useCreateCard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNumbersCardPayload) => createCard(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-cards"] });
      toast.success("کارت با موفقیت اضافه شد");
    },
    onError: () => toast.error("خطا در افزودن کارت"),
  });
};

export const useUpdateCard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateNumbersCardPayload;
    }) => updateCard(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-cards"] });
      toast.success("کارت ویرایش شد");
    },
    onError: () => toast.error("خطا در ویرایش کارت"),
  });
};

export const useDeleteCard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCard(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-cards"] });
      toast.success("کارت حذف شد");
    },
    onError: () => toast.error("خطا در حذف کارت"),
  });
};
