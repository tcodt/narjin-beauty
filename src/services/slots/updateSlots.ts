import { SlotsRequest } from "../../types/slots";
import api from "../../utils/api";
import { normalizeTime } from "../../utils/date";

export const updateSlots = async (data: {
  updateSlot: SlotsRequest;
  id: number;
}) => {
  const payload = {
    service_id: Number(data.updateSlot.service_id),
    date: data.updateSlot.date,
    start_time: normalizeTime(data.updateSlot.start_time),
    is_available: data.updateSlot.is_available !== false,
  };

  const response = await api.put(`/business/slots/${data.id}/`, payload);
  return response.data;
};
