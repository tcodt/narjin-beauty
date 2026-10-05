export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  image: string | null;
  appointments_count: number;
}
