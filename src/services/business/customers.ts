import api from "../../utils/api";
import { Customer } from "../../types/customers";

export const getMyCustomers = async (): Promise<Customer[]> => {
  const { data } = await api.get("/business/customers/mine/");
  return Array.isArray(data) ? data : [];
};
