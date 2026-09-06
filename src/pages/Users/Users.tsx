import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import PageTitle from "../../components/PageTitle/PageTitle";
import { useGetUsers } from "../../hooks/users/useGetUsers";
import toast from "react-hot-toast";
import { FaUser, FaRegTrashAlt } from "react-icons/fa";
import { IoCamera, IoEye, IoEyeOff } from "react-icons/io5";
import { FaPencil } from "react-icons/fa6";
import CustomModal from "../../components/CustomModal/CustomModal";
import { useQueryClient } from "@tanstack/react-query";
import Button from "../../components/Button/Button";
import { ThemeColorName, useThemeColor } from "../../context/ThemeColor";
import { useAddUser } from "../../hooks/users/useAddUser";
import { useUpdateUser } from "../../hooks/users/useUpdateUser";
import { useRemoveUser } from "../../hooks/users/useRemoveUser";
import { AxiosError } from "axios";
import { User } from "../../types/users";
import Dropdown from "../../components/Dropdown/Dropdown";
import { motion } from "framer-motion";
import { themeText } from "../../utils/themeClasses";

// Define interfaces for form data
interface UserFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
  image: File | null;
}

interface UpdateUserFormData extends UserFormData {
  is_owner: boolean;
  is_superuser: boolean;
  is_active: boolean;
  is_staff: boolean;
  groups: number[];
  user_permissions: number[];
}

// Utility function to handle image URLs
const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `https://api.narjin.ir${
    imagePath.startsWith("/") ? "" : "/"
  }${imagePath}`;
};

const Users: React.FC = () => {
  const { data: usersData } = useGetUsers();
  const addUserMutation = useAddUser();
  const updateUserMutation = useUpdateUser();
  const removeUserMutation = useRemoveUser();
  const queryClient = useQueryClient();
  const { themeColor } = useThemeColor();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isUpdatePassVisible, setIsUpdatePassVisible] =
    useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [addPreview, setAddPreview] = useState<string | null>(null);
  const [updatePreview, setUpdatePreview] = useState<string | null>(null);

  // Form hooks for add and update
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: addErrors },
    reset: resetAdd,
    setValue: setAddValue,
  } = useForm<UserFormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      password: "",
      image: null,
    },
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: updateErrors },
    reset: resetUpdate,
    setValue: setUpdateValue,
  } = useForm<UpdateUserFormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      password: "",
      image: null,
      is_owner: false,
      is_superuser: false,
      is_active: true,
      is_staff: false,
      groups: [],
      user_permissions: [],
    },
  });

  // Handle image change for both add and update modals
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isUpdate: boolean,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("لطفا یک فایل تصویری انتخاب کنید");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم فایل بیش از حد مجاز است (حداکثر ۵ مگابایت)");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      if (isUpdate) {
        setUpdateValue("image", file);
        setUpdatePreview(previewUrl);
      } else {
        setAddValue("image", file);
        setAddPreview(previewUrl);
      }
    }
  };

  // Clean up preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (addPreview) URL.revokeObjectURL(addPreview);
      if (updatePreview) URL.revokeObjectURL(updatePreview);
    };
  }, [addPreview, updatePreview]);

  // Handle add user
  const handleAddUser: SubmitHandler<UserFormData> = (data) => {
    if (!data.image) {
      toast.error("لطفا یک تصویر انتخاب کنید");
      return;
    }

    if (!/^\d{11}$/.test(data.phone_number)) {
      toast.error("شماره تلفن باید ۱۱ رقم باشد");
      return;
    }

    const toastId = toast.loading("در حال افزودن کاربر...");

    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("phone_number", data.phone_number);
    formData.append("password", data.password);
    formData.append("image", data.image);

    addUserMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("کاربر با موفقیت اضافه شد!", { id: toastId });
        setIsAddOpen(false);
        resetAdd();
        setAddPreview(null);
        queryClient.invalidateQueries({ queryKey: ["users"] });
      },
      onError: (error) => {
        const axiosError = error as AxiosError;
        const errorData = axiosError.response?.data as
          | {
              image?: string[];
              first_name?: string[];
              last_name?: string[];
              phone_number?: string[];
              password?: string[];
            }
          | undefined;
        const errorMessage =
          errorData?.image?.[0] ||
          errorData?.first_name?.[0] ||
          errorData?.last_name?.[0] ||
          errorData?.phone_number?.[0] ||
          errorData?.password?.[0] ||
          "خطا در افزودن کاربر!";
        toast.error(errorMessage, { id: toastId });
        console.error("Add User Error:", axiosError);
      },
    });
  };

  // Handle select user for update
  const handleSelectUserForUpdate = (id: number, user: User) => {
    setUpdatingUserId(id);
    setUpdateValue("first_name", user.first_name);
    setUpdateValue("last_name", user.last_name);
    setUpdateValue("phone_number", user.phone_number);
    setUpdateValue("password", "");
    setUpdateValue("image", null);
    setUpdateValue("is_owner", user.is_owner);
    setUpdateValue("is_superuser", user.is_superuser ?? false);
    setUpdateValue("is_active", user.is_active);
    setUpdateValue("is_staff", user.is_staff);
    setUpdateValue("groups", user.groups ?? []);
    setUpdateValue("user_permissions", user.user_permissions ?? []);
    setUpdatePreview(getImageUrl(user.image));
    toast.success("خوبه! حالا اطلاعات کاربر را بروزرسانی کنید");
  };

  // Handle update user
  const handleUpdateUser: SubmitHandler<UpdateUserFormData> = async (data) => {
    if (!updatingUserId) {
      toast.error("هیچ کاربری انتخاب نشده است");
      return;
    }

    if (!data.first_name || !data.phone_number) {
      toast.error("لطفا نام و شماره تلفن را وارد کنید");
      return;
    }

    if (!/^\d{11}$/.test(data.phone_number)) {
      toast.error("شماره تلفن باید ۱۱ رقم باشد");
      return;
    }

    const toastId = toast.loading("در حال بروزرسانی کاربر...");

    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("phone_number", data.phone_number);
    if (data.password) formData.append("password", data.password);
    if (data.image) formData.append("image", data.image);
    formData.append("is_owner", String(data.is_owner));
    formData.append("is_superuser", String(data.is_superuser));
    formData.append("is_active", String(data.is_active));
    formData.append("is_staff", String(data.is_staff));
    data.groups.forEach((id) => formData.append("groups[]", id.toString()));
    data.user_permissions.forEach((id) =>
      formData.append("user_permissions[]", id.toString()),
    );

    updateUserMutation.mutate(
      { id: updatingUserId, userData: formData },
      {
        onSuccess: () => {
          toast.success("کاربر با موفقیت بروزرسانی شد!", { id: toastId });
          setIsUpdateOpen(false);
          setUpdatingUserId(null);
          resetUpdate();
          setUpdatePreview(null);
          queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error) => {
          const axiosError = error as AxiosError;
          const errorData = axiosError.response?.data as
            | {
                image?: string[];
                first_name?: string[];
                last_name?: string[];
                phone_number?: string[];
                password?: string[];
              }
            | undefined;
          const errorMessage =
            errorData?.image?.[0] ||
            errorData?.first_name?.[0] ||
            errorData?.last_name?.[0] ||
            errorData?.phone_number?.[0] ||
            errorData?.password?.[0] ||
            "خطا در بروزرسانی کاربر!";
          toast.error(errorMessage, { id: toastId });
          console.error("Update User Error:", axiosError);
        },
      },
    );
  };

  // Handle remove user
  const handleRemoveUser = (id: number) => {
    const toastId = toast.loading("لطفا منتظر بمانید...");
    removeUserMutation.mutate(id, {
      onSuccess: () => {
        toast.success("کاربر با موفقیت حذف شد", { id: toastId });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      },
      onError: (error) => {
        toast.error("خطا در حذف کاربر!", { id: toastId });
        console.error("Remove User Error:", error);
      },
    });
  };

  const toggle = () => setIsVisible(!isVisible);
  const toggleUpdatePass = () => setIsUpdatePassVisible(!isUpdatePassVisible);

  return (
    <section className="space-y-6">
      {/* Add User Modal */}
      <CustomModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setAddPreview(null);
          resetAdd();
        }}
        title="افزودن کاربر"
      >
        <form
          onSubmit={handleSubmitAdd(handleAddUser)}
          className="flex flex-col gap-4"
        >
          <div className="w-full">
            <input
              type="text"
              placeholder="نام"
              {...registerAdd("first_name", { required: "نام الزامی است" })}
              className={`py-2 px-4 h-11 bg-slate-100 rounded-xl outline-none border-2 border-gray-300 focus:border-${themeColor}-500 text-gray-700 text-base transition dark:bg-gray-700 dark:border-gray-500 dark:text-white dark:focus:border-${themeColor}-500 w-full`}
            />
            {addErrors.first_name && (
              <p className="text-red-500 text-sm mt-1">
                {addErrors.first_name.message}
              </p>
            )}
          </div>
          <div className="w-full">
            <input
              type="text"
              placeholder="نام خانوادگی"
              {...registerAdd("last_name")}
              className={`py-2 px-4 h-11 bg-slate-100 rounded-xl outline-none border-2 border-gray-300 focus:border-${themeColor}-500 text-gray-700 text-base transition dark:bg-gray-700 dark:border-gray-500 dark:text-white dark:focus:border-${themeColor}-500 w-full`}
            />
          </div>
          <div className="w-full">
            <input
              type="text"
              placeholder="شماره تلفن"
              maxLength={11}
              {...registerAdd("phone_number", {
                required: "شماره تلفن الزامی است",
                pattern: {
                  value: /^\d{11}$/,
                  message: "شماره تلفن باید ۱۱ رقم باشد",
                },
              })}
              className={`py-2 px-4 h-11 bg-slate-100 rounded-xl outline-none border-2 border-gray-300 focus:border-${themeColor}-500 text-gray-700 text-base transition dark:bg-gray-700 dark:border-gray-500 dark:text-white dark:focus:border-${themeColor}-500 w-full`}
            />
            {addErrors.phone_number && (
              <p className="text-red-500 text-sm mt-1">
                {addErrors.phone_number.message}
              </p>
            )}
          </div>
          <div className="relative">
            <span
              className="absolute top-4 left-2 text-gray-500 text-lg cursor-pointer"
              onClick={toggle}
            >
              {isVisible ? <IoEye /> : <IoEyeOff />}
            </span>
            <input
              type={isVisible ? "text" : "password"}
              placeholder="رمز عبور"
              {...registerAdd("password", { required: "رمز عبور الزامی است" })}
              className={`py-2 px-4 h-11 bg-slate-100 rounded-xl outline-none border-2 border-gray-300 focus:border-${themeColor}-500 text-gray-700 text-base transition dark:bg-gray-700 dark:border-gray-500 dark:text-white dark:focus:border-${themeColor}-500 w-full`}
            />
            {addErrors.password && (
              <p className="text-red-500 text-sm mt-1">
                {addErrors.password.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="add-user-image">
              <div className="bg-white text-gray-500 hover:bg-slate-100 border-2 border-gray-300 rounded-xl border-dashed p-4 cursor-pointer dark:bg-gray-900 dark:border-gray-600">
                <span className="flex items-center gap-2">
                  انتخاب عکس <IoCamera size={20} />
                </span>
              </div>
            </label>
            <input
              type="file"
              className="hidden"
              id="add-user-image"
              accept="image/*"
              onChange={(e) => handleImageChange(e, false)}
            />
            {addPreview && (
              <img
                src={addPreview}
                alt="Preview"
                className="mt-2 w-32 rounded-md"
              />
            )}
            {addErrors.image && (
              <p className="text-red-500 text-sm mt-1">
                {addErrors.image.message}
              </p>
            )}
          </div>
          <Button
            variant="primary"
            type="submit"
            disabled={addUserMutation.isPending}
          >
            {addUserMutation.isPending ? "در حال افزودن..." : "ثبت کاربر"}
          </Button>
        </form>
      </CustomModal>

      {/* Update User Modal */}
      <CustomModal
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
          setUpdatingUserId(null);
          setUpdatePreview(null);
          resetUpdate();
        }}
        title="بروزرسانی کاربران"
      >
        <form
          onSubmit={handleSubmitUpdate(handleUpdateUser)}
          className="flex flex-col gap-4 mb-8"
        >
          <div className="w-full">
            <input
              type="text"
              placeholder="نام"
              {...registerUpdate("first_name", { required: "نام الزامی است" })}
              className={`py-2 px-4 h-11 bg-slate-100 rounded-xl outline-none border-2 border-gray-300 focus:border-${themeColor}-500 text-gray-700 text-base transition dark:bg-gray-700 dark:border-gray-500 dark:text-white dark:focus:border-${themeColor}-500 w-full`}
            />
            {updateErrors.first_name && (
              <p className="text-red-500 text-sm mt-1">
                {updateErrors.first_name.message}
              </p>
            )}
          </div>
          <div className="w-full">
            <input
              type="text"
              placeholder="نام خانوادگی"
              {...registerUpdate("last_name")}
              className={`py-2 px-4 h-11 bg-slate-100 rounded-xl outline-none border-2 border-gray-300 focus:border-${themeColor}-500 text-gray-700 text-base transition dark:bg-gray-700 dark:border-gray-500 dark:text-white dark:focus:border-${themeColor}-500 w-full`}
            />
          </div>
          <div className="w-full">
            <input
              type="text"
              placeholder="شماره تلفن"
              maxLength={11}
              {...registerUpdate("phone_number", {
                required: "شماره تلفن الزامی است",
                pattern: {
                  value: /^\d{11}$/,
                  message: "شماره تلفن باید ۱۱ رقم باشد",
                },
              })}
              className={`py-2 px-4 h-11 bg-slate-100 rounded-xl outline-none border-2 border-gray-300 focus:border-${themeColor}-500 text-gray-700 text-base transition dark:bg-gray-700 dark:border-gray-500 dark:text-white dark:focus:border-${themeColor}-500 w-full`}
            />
            {updateErrors.phone_number && (
              <p className="text-red-500 text-sm mt-1">
                {updateErrors.phone_number.message}
              </p>
            )}
          </div>
          <div className="relative">
            <span
              className="absolute top-4 left-2 text-gray-500 text-lg cursor-pointer"
              onClick={toggleUpdatePass}
            >
              {isUpdatePassVisible ? <IoEye /> : <IoEyeOff />}
            </span>
            <input
              type={isUpdatePassVisible ? "text" : "password"}
              placeholder="رمز عبور (اختیاری)"
              {...registerUpdate("password")}
              className={`py-2 px-4 h-11 bg-slate-100 rounded-xl outline-none border-2 border-gray-300 focus:border-${themeColor}-500 text-gray-700 text-base transition dark:bg-gray-700 dark:border-gray-500 dark:text-white dark:focus:border-${themeColor}-500 w-full`}
            />
          </div>
          <div>
            <label htmlFor="update-user-image">
              <div className="bg-white text-gray-500 hover:bg-slate-100 border-2 border-gray-300 rounded-xl border-dashed p-4 cursor-pointer dark:bg-gray-900 dark:border-gray-600">
                <span className="flex items-center gap-2">
                  انتخاب عکس <IoCamera size={20} />
                </span>
              </div>
            </label>
            <input
              type="file"
              className="hidden"
              id="update-user-image"
              accept="image/*"
              onChange={(e) => handleImageChange(e, true)}
            />
            {updatePreview && (
              <img
                src={updatePreview}
                alt="Preview"
                className="mt-2 w-32 rounded-md"
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-gray-700 dark:text-white">
              <input
                type="checkbox"
                {...registerUpdate("is_owner")}
                className="h-4 w-4"
              />
              مدیر
            </label>
            <label className="flex items-center gap-2 text-gray-700 dark:text-white">
              <input
                type="checkbox"
                {...registerUpdate("is_superuser")}
                className="h-4 w-4"
              />
              سوپر کاربر
            </label>
            <label className="flex items-center gap-2 text-gray-700 dark:text-white">
              <input
                type="checkbox"
                {...registerUpdate("is_active")}
                className="h-4 w-4"
              />
              فعال
            </label>
            <label className="flex items-center gap-2 text-gray-700 dark:text-white">
              <input
                type="checkbox"
                {...registerUpdate("is_staff")}
                className="h-4 w-4"
              />
              کارمند
            </label>
          </div>
          <Button
            variant="primary"
            type="submit"
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending
              ? "در حال بروزرسانی..."
              : "بروزرسانی کاربر"}
          </Button>
          <div className="flex flex-col gap-6">
            {usersData?.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 relative border-s-2 border-s-${themeColor}-500 rounded-e-xl p-2 bg-slate-100 dark:bg-gray-700 shadow-md`}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 border border-gray-300 text-gray-500">
                  {getImageUrl(user.image) ? (
                    <img
                      src={getImageUrl(user.image)!}
                      alt="User Image"
                      className="object-cover rounded-full w-full h-full"
                    />
                  ) : (
                    <FaUser size={20} />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-base text-gray-800 font-normal dark:text-white">
                    {user.first_name} {user.last_name}
                  </h4>
                  <span className="text-sm text-gray-500 font-thin dark:text-gray-300">
                    {user.phone_number}
                  </span>
                </div>
                <button
                  className={`text-xl text-${themeColor}-500 absolute top-7 left-4 hover:${themeText[themeColor as ThemeColorName]} transition`}
                  onClick={() => handleSelectUserForUpdate(user.id, user)}
                  type="button"
                >
                  <FaPencil />
                </button>
              </div>
            ))}
          </div>
        </form>
      </CustomModal>

      {/* Delete User Modal */}
      <CustomModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="حذف کاربر"
      >
        <div className="flex flex-col gap-6">
          {usersData?.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 relative border-s-2 border-s-red-500 rounded-e-xl bg-slate-100 dark:bg-gray-700 shadow-md p-2"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 border border-gray-300 text-gray-500">
                {getImageUrl(user.image) ? (
                  <img
                    src={getImageUrl(user.image)!}
                    alt="User Image"
                    className="object-cover rounded-full w-full h-full"
                  />
                ) : (
                  <FaUser size={20} />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-base text-gray-800 font-normal dark:text-white">
                  {user.first_name} {user.last_name}
                </h4>
                <span className="text-sm text-gray-500 font-thin dark:text-gray-300">
                  {user.phone_number}
                </span>
              </div>
              <button
                className="text-xl text-red-500 absolute top-7 left-4 hover:text-red-600 transition"
                onClick={() => handleRemoveUser(user.id)}
              >
                <FaRegTrashAlt />
              </button>
            </div>
          ))}
        </div>
      </CustomModal>

      <div className="flex flex-row justify-between items-center mt-8">
        <PageTitle title="کاربران" />
        {/* Edit Box */}
        <div className="flex flex-row flex-wrap items-center gap-2">
          <Dropdown
            isAddOpen={isAddOpen}
            setIsAddOpen={setIsAddOpen}
            isUpdateOpen={isUpdateOpen}
            setIsUpdateOpen={setIsUpdateOpen}
            isDeleteOpen={isDeleteOpen}
            setIsDeleteOpen={setIsDeleteOpen}
          />
        </div>
      </div>

      {usersData?.length === 0 ? (
        <p className="text-gray-600">کاربری یافت نشد.</p>
      ) : (
        usersData?.map((user) => (
          <motion.div
            key={user.id}
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 border border-gray-300 text-gray-500">
                {getImageUrl(user.image) ? (
                  <img
                    src={getImageUrl(user.image)!}
                    alt={`${user.first_name}`}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <FaUser size={24} />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {user.phone_number}
                </p>
              </div>
            </div>
            <table className="table-auto w-full text-sm text-gray-600 dark:text-gray-300">
              <tbody>
                <tr>
                  <td className="font-medium py-2">وضعیت:</td>
                  <td className="py-2 text-end">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.is_active
                          ? "bg-green-100 text-green-500 dark:bg-green-500 dark:text-white"
                          : "bg-red-100 text-red-500 dark:bg-red-500 dark:text-white"
                      }`}
                    >
                      {user.is_active ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="font-medium py-2">نقش:</td>
                  <td className="py-2 text-end">
                    {user.is_owner
                      ? "مالک"
                      : user.is_staff
                        ? "کارمند"
                        : user.is_superuser
                          ? "سوپر کاربر"
                          : "کاربر"}
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        ))
      )}
    </section>
  );
};

export default Users;
