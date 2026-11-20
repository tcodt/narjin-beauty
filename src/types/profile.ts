export interface GetProfile {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  image: string | null;
  birthday_day?: number | null;
  birthday_month?: number | null;
  is_owner: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

/** فقط فیلدهای قابل‌نوشتن بک‌اند */
export type UpdateProfilePayload = {
  first_name: string;
  last_name: string;
  image?: File | null;
  birthday_day?: number | null;
  birthday_month?: number | null;
};

/** فرم UI — phone فقط برای نمایش */
export type UpdateProfileFormValues = {
  first_name: string;
  last_name: string;
  phone_number: string; // فقط نمایش
  birthday_day?: number | null;
  birthday_month?: number | null;
};
