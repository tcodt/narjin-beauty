export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  image: string | null;
  is_owner: boolean;
  is_superuser?: boolean;
  is_active: boolean;
  is_staff: boolean;
  groups?: number[];
  user_permissions?: number[];
  last_login?: string | null;
}

export type Users = User[];

export interface CreateUser {
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
  image: string;
}
