import { Business, BusinessItem } from "./business";
import { Employee } from "./employees";

export interface GetServicesItem {
  id: number;
  business?: Business | number | null;
  employee?: Employee | null;
  name: string;
  description: string;
  duration: string;
  price: string;
  is_active?: boolean;
}

export interface ServicesItem {
  id: number;
  business: BusinessItem;
  employee: Employee;
  name: string;
  description: string;
  duration: string;
  price: string;
}

export type GetServices = GetServicesItem[];

/** Write payload — business is always the owner's salon from /business/me/ */
export type PostServicesData = {
  name: string;
  price: string;
  description: string;
  duration: string;
  business_id?: number;
  employee_id: number;
};
