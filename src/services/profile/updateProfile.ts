import { GetProfile } from "../../types/profile";
import api from "../../utils/api";

export const updateProfile = async (
  profileData: FormData,
): Promise<GetProfile> => {
  // فقط first_name, last_name, image, birthday_day, birthday_month
  // phone_number را اصلاً نفرستید
  const response = await api.patch(
    "/dashboard/users/profile/update/",
    profileData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};
