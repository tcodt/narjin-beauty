import api from "../../utils/api";

/** DELETE /business/employees/{id}/ */
export const removeEmployee = async (id: number) => {
  const response = await api.delete(`/business/employees/${id}/`);
  return response.data;
};
