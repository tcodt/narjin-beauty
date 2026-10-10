import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getBusinessMe,
  updateBusinessLogo,
} from "../../services/business/updateBusinessLogo";
import { useAuth } from "../../context/AuthContext";

export const useBusinessMe = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["business-me"],
    queryFn: getBusinessMe,
    enabled: isAuthenticated,
  });
};

export const useUpdateBusinessLogo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => updateBusinessLogo(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business-me"] });
      toast.success("لوگو با موفقیت به‌روز شد");
    },
    onError: () => toast.error("خطا در آپلود لوگو"),
  });
};
