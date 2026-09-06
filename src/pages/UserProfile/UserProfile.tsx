import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  FaUser,
  FaCopy,
  FaStore,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { IoCamera, IoCheckmarkCircle } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { motion } from "framer-motion";

import { useGetProfile } from "../../hooks/profile/useGetProfile";
import { useUpdateProfile } from "../../hooks/profile/useUpdateProfile";
import { useBusinessMe } from "../../hooks/business/useBusinessMe";
import { useUpdateBusiness } from "../../hooks/business/useUpdateBusiness";
import { UpdateProfile } from "../../types/profile";
import { ThemeColorName, useThemeColor } from "../../context/ThemeColor";
import { useAcl } from "../../context/AclContext";
import CustomModal from "../../components/CustomModal/CustomModal";
import Button from "../../components/Button/Button";
import { themeBgSoft, themeText } from "../../utils/themeClasses";

type BusinessFormValues = {
  name: string;
  address: string;
  phone_number: string;
  telephone_number: string;
  business_type: "male_salon" | "female_salon";
};

const BUSINESS_TYPE_LABEL: Record<string, string> = {
  male_salon: "آرایشگاه مردانه",
  female_salon: "آرایشگاه زنانه",
};

const UserProfile: React.FC = () => {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isBusinessEditOpen, setIsBusinessEditOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { data: userProfile } = useGetProfile();
  const { data: business, isLoading: businessLoading } = useBusinessMe();
  const updateProfileMutation = useUpdateProfile();
  const updateBusinessMutation = useUpdateBusiness();
  const queryClient = useQueryClient();
  const { themeColor } = useThemeColor();
  const { role, isBusinessOwner, isOwner } = useAcl();

  const showBusiness =
    isBusinessOwner || isOwner || role === "admin" || !!business;

  const roleLabel =
    role === "admin" || isBusinessOwner
      ? "صاحب کسب‌وکار"
      : role === "employee"
        ? "کارمند"
        : "مشتری";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateProfile>({
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
    },
  });

  const {
    register: registerBusiness,
    handleSubmit: handleSubmitBusiness,
    reset: resetBusiness,
    formState: { errors: businessErrors },
  } = useForm<BusinessFormValues>({
    defaultValues: {
      name: "",
      address: "",
      phone_number: "",
      telephone_number: "",
      business_type: "male_salon",
    },
  });

  useEffect(() => {
    if (!userProfile) return;
    setValue("first_name", userProfile.first_name || "");
    setValue("last_name", userProfile.last_name || "");
    setValue("phone_number", userProfile.phone_number || "");
  }, [userProfile, setValue]);

  useEffect(() => {
    if (!business) return;
    resetBusiness({
      name: business.name || "",
      address: business.address || "",
      phone_number: business.phone_number || "",
      telephone_number: business.telephone_number || "",
      business_type:
        business.business_type === "female_salon"
          ? "female_salon"
          : "male_salon",
    });
  }, [business, resetBusiness]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم فایل بیش از حد مجاز است");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("فرمت فایل مجاز نیست");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmitProfile = (data: UpdateProfile) => {
    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("phone_number", data.phone_number);
    if (image) formData.append("image", image);

    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        toast.success("پروفایل بروزرسانی شد");
        setIsUpdateOpen(false);
        setImage(null);
        setPreview(null);
      },
      onError: (err) => {
        toast.error("خطا در بروزرسانی پروفایل");
        console.error(err as AxiosError);
      },
    });
  };

  const onSaveBusiness = handleSubmitBusiness((data) => {
    if (!business?.id) return;
    updateBusinessMutation.mutate(
      { id: business.id, data },
      {
        onSuccess: () => {
          toast.success("اطلاعات سالن ذخیره شد");
          setIsBusinessEditOpen(false);
          queryClient.invalidateQueries({ queryKey: ["business-me"] });
        },
        onError: () => toast.error("خطا در ذخیره کسب‌وکار"),
      },
    );
  });

  const copyCode = async () => {
    if (!business?.random_code) return;
    try {
      await navigator.clipboard.writeText(business.random_code);
      toast.success("کد کپی شد");
    } catch {
      toast.error("کپی انجام نشد");
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-5 pb-12">
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-${themeColor}-500 to-${themeColor}-700 p-6 text-white shadow-lg`}
      >
        <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 left-20 h-28 w-28 rounded-full bg-white/10" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/40 bg-white/20 shadow-inner">
            {userProfile?.image ? (
              <img
                src={userProfile.image}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <FaUser className="text-3xl text-white/90" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold">
              {userProfile?.first_name} {userProfile?.last_name}
            </h1>
            <p className="mt-0.5 text-sm text-white/85" dir="ltr">
              {userProfile?.phone_number}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
              <IoCheckmarkCircle />
              {roleLabel}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsUpdateOpen(true)}
          className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-white/25"
        >
          <FaPencil className="text-xs" />
          ویرایش پروفایل
        </button>
      </motion.div>

      {/* Business section */}
      {showBusiness && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-${themeColor}-50 ${themeText[themeColor as ThemeColorName]} dark:bg-gray-700`}
              >
                <FaStore />
              </span>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                سالن من
              </h2>
            </div>
            {business && (
              <button
                type="button"
                onClick={() => setIsBusinessEditOpen(true)}
                className={`text-sm font-semibold ${themeText[themeColor as ThemeColorName]} hover:opacity-80`}
              >
                ویرایش
              </button>
            )}
          </div>

          {businessLoading && (
            <p className="text-sm text-gray-500">در حال بارگذاری...</p>
          )}

          {!businessLoading && !business && (
            <div className="rounded-2xl bg-gray-50 p-4 text-center dark:bg-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                هنوز سالنی ثبت نکرده‌اید
              </p>
              <Link
                to="/create-business"
                className={`mt-2 inline-block text-sm font-semibold ${themeText[themeColor as ThemeColorName]}`}
              >
                ثبت کسب‌وکار
              </Link>
            </div>
          )}

          {business && (
            <div className="space-y-3">
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {business.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {BUSINESS_TYPE_LABEL[business.business_type] ||
                    business.business_type}
                  {business.is_active ? (
                    <span className="mr-2 text-green-600"> · فعال</span>
                  ) : (
                    <span className="mr-2 text-amber-600">
                      {" "}
                      · در انتظار تأیید
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <FaMapMarkerAlt className="mt-0.5 shrink-0 text-gray-400" />
                <span>{business.address || "—"}</span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                <span className="inline-flex items-center gap-1.5">
                  <FaPhone className="text-gray-400" />
                  {business.phone_number || "—"}
                </span>
                {business.telephone_number && (
                  <span className="inline-flex items-center gap-1.5">
                    <FaPhone className="text-gray-400" />
                    {business.telephone_number}
                  </span>
                )}
              </div>

              {/* Salon code */}
              <div
                className={`mt-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-${themeColor}-50 px-4 py-3 dark:bg-gray-700/80`}
              >
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    کد ورود مشتریان
                  </p>
                  <code
                    className={`text-xl font-bold tracking-[0.2em] text-${themeColor}-700 dark:text-${themeColor}-300`}
                    dir="ltr"
                  >
                    {business.random_code}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className={`inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-${themeColor}-700 shadow-sm dark:bg-gray-800 dark:text-${themeColor}-300`}
                >
                  <FaCopy /> کپی کد
                </button>

                {business?.random_code && (
                  <div
                    className={`col-span-full flex flex-col items-center gap-3 rounded-2xl border border-gray-100 p-5 dark:border-gray-700 ${themeBgSoft[themeColor]}`}
                  >
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      کد سالن:{" "}
                      <b className={themeText[themeColor]} dir="ltr">
                        {business.random_code}
                      </b>
                    </p>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        String(business.random_code),
                      )}`}
                      alt="QR Code"
                      width={200}
                      height={200}
                      className="rounded-2xl border border-white bg-white p-2 shadow-sm"
                    />
                    <p className="text-center text-[11px] text-gray-500">
                      مشتری با اسکن این کد یا وارد کردن عدد، به سالن شما وصل
                      می‌شود
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
                {[
                  { to: "/manage-employees", label: "آرایشگران" },
                  { to: "/manage-services", label: "خدمات" },
                  { to: "/available-times", label: "زمان‌ها" },
                  { to: "/dashboard", label: "گزارشات" },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="rounded-xl border border-gray-100 py-2.5 text-center text-xs font-medium text-gray-700 transition hover:border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <p className="px-1 text-center text-xs leading-5 text-gray-400 dark:text-gray-500">
        با ویرایش اطلاعات، صحت آن‌ها بر عهده شماست.
      </p>

      {/* Edit profile modal */}
      <CustomModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        title="ویرایش پروفایل"
      >
        <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-500">نام</label>
              <input
                className={`primary-input ${errors.first_name ? "border-red-500" : ""}`}
                {...register("first_name", {
                  required: "نام الزامی است",
                  minLength: { value: 2, message: "حداقل ۲ کاراکتر" },
                })}
              />
              {errors.first_name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.first_name.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-500">
                نام خانوادگی
              </label>
              <input
                className={`primary-input ${errors.last_name ? "border-red-500" : ""}`}
                {...register("last_name", {
                  required: "نام خانوادگی الزامی است",
                  minLength: { value: 2, message: "حداقل ۲ کاراکتر" },
                })}
              />
              {errors.last_name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">موبایل</label>
            <input
              className={`primary-input ${errors.phone_number ? "border-red-500" : ""}`}
              {...register("phone_number", {
                required: "شماره الزامی است",
                pattern: {
                  value: /^09[0-9]{9}$/,
                  message: "شماره معتبر نیست",
                },
              })}
            />
            {errors.phone_number && (
              <p className="mt-1 text-xs text-red-500">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="profile-image" className="cursor-pointer">
              <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900">
                <IoCamera size={18} />
                تغییر عکس پروفایل
              </div>
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {preview && (
              <img
                src={preview}
                alt=""
                className="mt-2 h-24 w-24 rounded-2xl object-cover"
              />
            )}
          </div>

          <Button variant="primary" type="submit">
            {updateProfileMutation.isPending ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </form>
      </CustomModal>

      {/* Edit business modal */}
      <CustomModal
        isOpen={isBusinessEditOpen}
        onClose={() => setIsBusinessEditOpen(false)}
        title="ویرایش سالن"
      >
        <form onSubmit={onSaveBusiness} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-gray-500">نام سالن</label>
            <input
              className="primary-input"
              {...registerBusiness("name", {
                required: "الزامی",
                minLength: { value: 3, message: "حداقل ۳ کاراکتر" },
              })}
            />
            {businessErrors.name && (
              <p className="mt-1 text-xs text-red-500">
                {businessErrors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">نوع</label>
            <select
              className="primary-input"
              {...registerBusiness("business_type")}
            >
              <option value="male_salon">آرایشگاه مردانه</option>
              <option value="female_salon">آرایشگاه زنانه</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">آدرس</label>
            <textarea
              rows={3}
              className="primary-input min-h-[5rem]"
              {...registerBusiness("address", {
                required: "الزامی",
                minLength: { value: 10, message: "آدرس کامل‌تر وارد کنید" },
              })}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">موبایل</label>
              <input
                className="primary-input"
                {...registerBusiness("phone_number", {
                  required: "الزامی",
                  pattern: {
                    value: /^09\d{9}$/,
                    message: "موبایل معتبر نیست",
                  },
                })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                تلفن ثابت
              </label>
              <input
                className="primary-input"
                placeholder="021-..."
                {...registerBusiness("telephone_number", {
                  required: "الزامی",
                  minLength: { value: 8, message: "کوتاه است" },
                })}
              />
            </div>
          </div>

          {business?.random_code && (
            <p className="text-xs text-gray-500">
              کد سالن قابل تغییر نیست:{" "}
              <code className="font-mono" dir="ltr">
                {business.random_code}
              </code>
            </p>
          )}

          <Button variant="primary" type="submit">
            {updateBusinessMutation.isPending
              ? "در حال ذخیره..."
              : "ذخیره تغییرات"}
          </Button>
        </form>
      </CustomModal>
    </section>
  );
};

export default UserProfile;
