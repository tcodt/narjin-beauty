import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getBusinessMe,
  updateBusinessLogo,
} from "../../services/business/businessMe";
import { useAuth } from "../../context/AuthContext";

export const useBusinessMe = (enabled = true) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["business-me"],
    queryFn: getBusinessMe,
    enabled: isAuthenticated && enabled,
    staleTime: 60_000,
  });
};

export const useUpdateBusinessLogo = () => {
  const qc = useQueryClient();
  const { data: business } = useBusinessMe();

  return useMutation({
    mutationFn: async (file: File) => {
      const id = business?.id;
      if (!id) {
        // اگر cache خالی بود یک‌بار از API بگیر
        const me = await getBusinessMe();
        if (!me?.id) throw new Error("business id not found");
        return updateBusinessLogo(me.id, file);
      }
      return updateBusinessLogo(id, file);
    },
    onSuccess: (data) => {
      qc.setQueryData(["business-me"], data);
      qc.invalidateQueries({ queryKey: ["business-me"] });
      qc.invalidateQueries({ queryKey: ["booking-qr"] });
      toast.success("لوگو با موفقیت به‌روز شد");
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 405) {
        toast.error("این مسیر از آپلود پشتیبانی نمی‌کند");
      } else {
        toast.error("خطا در آپلود لوگو");
      }
    },
  });
};
