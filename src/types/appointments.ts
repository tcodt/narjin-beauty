import { GetEmployeesItem } from "./employees";
import { GetServicesItem } from "./services";

export interface ReservationRequest {
  status?: string;
  service_id: number;
  employee_id: number;
  time_slot_id: number;
  /** Required for customer book endpoint */
  random_code?: string;
}
export interface AppointmentDataType {
  date: string;
  time: string;
  service_id: number;
  status: string;
  user: number;
  employee_id: number;
  get_status?: string;
}

export enum AppointmentStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Canceled = "canceled",
  Completed = "completed",
}

export interface Appointment {
  id: number;
  // date: string;
  // time: string;
  status: AppointmentStatus;
  user: number;
  service: GetServicesItem;
  employee: GetEmployeesItem;
  get_status: string;
  employee_name: string;
}

export type Appointments = Appointment[];

export type AppointmentUpdate = {
  date: string;
  time: string;
  status: string;
  user: number;
  service_id: number;
  employee_id: number;
};

export interface AppointmentById {
  id: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  user: number;
  service: {
    id: number;
    name: string;
    price: string;
    description: string;
    duration: string;
    business: {
      id: number;
      name: string;
      business_type: string;
      address: string;
      telephone_number: string;
      phone_number: string;
      is_coffee_shop: boolean;
      is_parking: boolean;
      instagram_link: string;
      owner: number;
    };
    employee: {
      id: number;
      user: {
        id: number;
        first_name: string;
        last_name: string;
        phone_number: string;
        email: string;
        is_owner: boolean;
        is_active: boolean;
        is_staff: boolean;
        image: string;
      };
      skill: string;
    };
  };
  employee: {
    id: number;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      phone_number: string;
      email: string;
      is_owner: boolean;
      is_active: boolean;
      is_staff: boolean;
      image: string;
    };
    skill: string;
  };
  get_status: string;
  employee_name: string;
}
