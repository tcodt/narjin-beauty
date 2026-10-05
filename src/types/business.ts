export type BusinessType = "male_salon" | "female_salon";

export interface BusinessItem {
  id: number;
  name: string;
  business_type: BusinessType | string;
  address: string;
  telephone_number: string;
  phone_number: string;
  is_coffee_shop?: boolean;
  is_parking?: boolean;
  instagram_link?: string;
  owner?: number;
  slug?: string;
  random_code?: string;
  is_active?: boolean;
  logo?: string | null;
}

export interface BusinessResponse {
  id: number;
  name: string;
  slug: string;
  random_code: string;
  business_type: BusinessType | string;
  address: string;
  telephone_number: string;
  phone_number: string;
  is_active: boolean;
}

export interface BusinessRequest {
  name: string;
  slug: string;
  business_type: BusinessType;
  address: string;
  telephone_number: string;
  phone_number: string;
}

export type BusinessMeResponse = BusinessResponse;

export type Business = BusinessItem[];
