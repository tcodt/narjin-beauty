import {
  EmployeeUpdatePayload,
  NewEmployeePromiseType,
} from "../../types/employees";
import api from "../../utils/api";

/**
 * PUT /business/employees/update/{id}/
 */
export const updateEmployee = async (data: {
  id: number;
  values: EmployeeUpdatePayload;
}): Promise<NewEmployeePromiseType> => {
  const body = {
    first_name: data.values.first_name.trim(),
    last_name: data.values.last_name.trim(),
    skill: data.values.skill.trim(),
  };

  const response = await api.put(
    `/business/employees/update/${data.id}/`,
    body,
  );
  return response.data;
};
