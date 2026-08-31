import { SlotsRequest, SlotsResponse } from "../../types/slots";
import api from "../../utils/api";
import { normalizeTime } from "../../utils/date";

export const addSlots = async (
  newSlot: SlotsRequest,
): Promise<SlotsResponse> => {
  const payload = {
    service_id: Number(newSlot.service_id),
    date: newSlot.date, // must be Gregorian YYYY-MM-DD
    start_time: normalizeTime(newSlot.start_time),
    is_available: newSlot.is_available !== false,
  };

  const response = await api.post("/business/slots/create/", payload);
  return response.data;
};
