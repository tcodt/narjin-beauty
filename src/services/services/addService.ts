import { PostServicesData } from "../../types/services";
import api from "../../utils/api";

/**
 * POST /business/services/create/
 * Write fields: name, price, description, duration, employee_id
 * business is scoped by owner token (optional business_id)
 */
export const addService = async (serviceData: PostServicesData) => {
  const payload: Record<string, unknown> = {
    name: serviceData.name.trim(),
    price: String(serviceData.price),
    description: serviceData.description?.trim() ?? "",
    duration: serviceData.duration,
    employee_id: Number(serviceData.employee_id),
  };

  if (serviceData.business_id) {
    payload.business_id = Number(serviceData.business_id);
  }

  const response = await api.post("/business/services/create/", payload);
  return response.data;
};
