import { PostServicesData } from "../../types/services";
import api from "../../utils/api";

/**
 * PUT /business/services/{id}/
 */
export const updateService = async (data: {
  id: number;
  values: PostServicesData;
}) => {
  const payload: Record<string, unknown> = {
    name: data.values.name.trim(),
    price: String(data.values.price),
    description: data.values.description?.trim() ?? "",
    duration: data.values.duration,
    employee_id: Number(data.values.employee_id),
  };

  if (data.values.business_id) {
    payload.business_id = Number(data.values.business_id);
  }

  const response = await api.put(`/business/services/${data.id}/`, payload);
  return response.data;
};
