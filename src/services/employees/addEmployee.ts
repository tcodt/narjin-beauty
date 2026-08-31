import {
  EmployeeCreatePayload,
  NewEmployeePromiseType,
} from "../../types/employees";
import api from "../../utils/api";

/**
 * POST /business/employees/create/
 * Owner enters name + phone + skill; backend creates a new user account.
 * No user_id / no users list.
 */
export const addEmployee = async (
  payload: EmployeeCreatePayload,
): Promise<NewEmployeePromiseType> => {
  const body: Record<string, string> = {
    first_name: payload.first_name.trim(),
    last_name: payload.last_name.trim(),
    phone_number: payload.phone_number.trim(),
    skill: payload.skill.trim(),
  };

  if (payload.password?.trim()) {
    body.password = payload.password.trim();
  }

  const response = await api.post("/business/employees/create/", body);
  return response.data;
};
