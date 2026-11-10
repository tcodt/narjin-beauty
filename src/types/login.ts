import { User } from "./users";

export interface LoginType {
  phone_number: string;
  password: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
  user: User; // بدون password
}
