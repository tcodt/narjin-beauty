// import { Packages } from "../../types/packages";
import api from "../../utils/api";

export const addPackage = async (data: FormData) => {
  //! Log for bugs
  // for (const [key, value] of data.entries()) {
  //   console.log(key, value); // چک کن image File باشه (نه string)
  // }

  const response = await api.post("/packages/create/", data);
  return response.data;
};
