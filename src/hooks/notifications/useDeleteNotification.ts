import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification } from "../../services/notifications/deleteNotification";

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
