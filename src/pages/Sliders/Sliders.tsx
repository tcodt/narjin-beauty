import React, { useState } from "react";
import { useAddSlider } from "../../hooks/sliders/useAddSlider";
import { useForm } from "react-hook-form";
import { SliderItems } from "../../types/sliders";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import Button from "../../components/Button/Button";
import CustomModal from "../../components/CustomModal/CustomModal";
import { useGetSliders } from "../../hooks/sliders/useGetSliders";
import Loading from "../../components/Loading/Loading";
import { FaPencil } from "react-icons/fa6";
import { FaRegTrashAlt } from "react-icons/fa";
import { useRemoveSlider } from "../../hooks/sliders/useRemoveSlider";
import { useUpdateSlider } from "../../hooks/sliders/useUpdateSlider";
import PageTitle from "../../components/PageTitle/PageTitle";
import { useThemeColor } from "../../context/ThemeColor";
import Dropdown from "../../components/Dropdown/Dropdown";
import { motion } from "framer-motion";
import { IoCamera } from "react-icons/io5";
import { LuImage } from "react-icons/lu";
import {
  themeText,
  themeBgSolid,
  themeBorder,
  mediaUrl,
} from "../../utils/themeClasses";

const parentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const childrenVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

const Sliders: React.FC = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedSliderId, setSelectedSliderId] = useState<number | null>(null);
  const [selectedSlider, setSelectedSlider] = useState<SliderItems | null>(
    null,
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SliderItems>({
    defaultValues: { title: "", sub_title: "", is_active: true },
  });

  const slidersMutation = useAddSlider();
  const removeSliderMutation = useRemoveSlider();
  const updateSliderMutation = useUpdateSlider();
  const { data: sliders, isPending, isError, error } = useGetSliders();
  const queryClient = useQueryClient();
  const { themeColor } = useThemeColor();
  const tc = themeColor;

  if (isPending) return <Loading />;

  if (isError) {
    toast.error("خطا در بارگذاری بنرها!");
    console.log(error);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      toast.error("فقط PNG / JPG / WEBP مجاز است");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("حجم فایل نباید بیشتر از ۵ مگابایت باشد");
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleAddSlider = (data: SliderItems) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("sub_title", data.sub_title);
    formData.append("is_active", String(!!data.is_active));
    if (selectedImage) formData.append("image", selectedImage);

    const toastId = toast.loading("در حال ایجاد بنر...");
    slidersMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("بنر ایجاد شد", { id: toastId });
        queryClient.invalidateQueries({ queryKey: ["sliders"] });
        reset();
        clearImage();
        setIsAddOpen(false);
      },
      onError: (err) => {
        console.log(err as AxiosError);
        toast.error("خطا در ایجاد بنر", { id: toastId });
      },
    });
  };

  const handleRemoveSlider = (id: number) => {
    const toastId = toast.loading("در حال حذف...");
    removeSliderMutation.mutate(id, {
      onSuccess: () => {
        toast.success("بنر حذف شد", { id: toastId });
        queryClient.invalidateQueries({ queryKey: ["sliders"] });
      },
      onError: (err) => {
        console.log(err as AxiosError);
        toast.error("خطا در حذف بنر", { id: toastId });
      },
    });
  };

  const openEdit = (slider: SliderItems) => {
    setSelectedSlider(slider);
    setSelectedSliderId(slider.id);
    setImagePreview(
      typeof slider.image === "string" ? mediaUrl(slider.image) : null,
    );
    setSelectedImage(null);
    setIsUpdateOpen(true);
  };

  const handleUpdateSlider = () => {
    if (!selectedSlider || !selectedSliderId) {
      toast.error("بنر معتبری انتخاب نشده");
      return;
    }

    const formData = new FormData();
    formData.append("id", String(selectedSliderId));
    formData.append("title", selectedSlider.title || "");
    formData.append("sub_title", selectedSlider.sub_title || "");
    formData.append("is_active", String(!!selectedSlider.is_active));
    if (selectedImage) formData.append("image", selectedImage);

    const toastId = toast.loading("در حال بروزرسانی...");
    updateSliderMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("بنر بروزرسانی شد", { id: toastId });
        setIsUpdateOpen(false);
        setSelectedSlider(null);
        clearImage();
        queryClient.invalidateQueries({ queryKey: ["sliders"] });
      },
      onError: (err) => {
        console.log(err as AxiosError);
        toast.error("خطا در بروزرسانی", { id: toastId });
      },
    });
  };

  const ImageField = ({ inputId }: { inputId: string }) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        تصویر
      </label>
      <label htmlFor={inputId} className="block cursor-pointer">
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 transition hover:border-gray-300 dark:border-gray-600 dark:bg-gray-900">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="h-36 w-full rounded-xl object-cover"
            />
          ) : (
            <>
              <IoCamera size={28} className={themeText[tc]} />
              <span className="text-xs text-gray-500">انتخاب تصویر بنر</span>
            </>
          )}
        </div>
      </label>
      <input
        type="file"
        className="hidden"
        id={inputId}
        accept="image/png,image/jpeg,image/webp"
        onChange={handleImageChange}
      />
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* ADD */}
      <CustomModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          clearImage();
          reset();
        }}
        title="افزودن بنر"
      >
        <form
          onSubmit={handleSubmit(handleAddSlider)}
          className="mt-4 space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              عنوان
            </label>
            <input
              type="text"
              className="primary-input"
              {...register("title", {
                required: "عنوان الزامی است",
                maxLength: { value: 30, message: "حداکثر ۳۰ کاراکتر" },
              })}
            />
            {errors.title && (
              <span className="text-sm text-rose-500">
                {errors.title.message}
              </span>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              زیرعنوان
            </label>
            <textarea
              rows={3}
              className="primary-input h-auto min-h-[5rem]"
              {...register("sub_title", {
                required: "زیرعنوان الزامی است",
                maxLength: { value: 60, message: "حداکثر ۶۰ کاراکتر" },
              })}
            />
            {errors.sub_title && (
              <span className="text-sm text-rose-500">
                {errors.sub_title.message}
              </span>
            )}
          </div>

          <ImageField inputId="add-slider-image" />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_id"
              {...register("is_active")}
              className="h-4 w-4 rounded"
            />
            <label
              htmlFor="is_active_id"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              فعال باشد
            </label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || slidersMutation.isPending}
          >
            {slidersMutation.isPending ? "در حال ارسال..." : "ایجاد بنر"}
          </Button>
        </form>
      </CustomModal>

      {/* UPDATE */}
      <CustomModal
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
          setSelectedSlider(null);
          clearImage();
        }}
        title="بروزرسانی بنر"
      >
        {selectedSlider ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="عنوان"
              value={selectedSlider.title || ""}
              onChange={(e) =>
                setSelectedSlider((prev) =>
                  prev ? { ...prev, title: e.target.value } : null,
                )
              }
              className="primary-input"
            />
            <textarea
              rows={3}
              placeholder="زیرعنوان"
              value={selectedSlider.sub_title || ""}
              onChange={(e) =>
                setSelectedSlider((prev) =>
                  prev ? { ...prev, sub_title: e.target.value } : null,
                )
              }
              className="primary-input h-auto min-h-[5rem]"
            />
            <ImageField inputId="update-slider-image" />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="update_is_active_id"
                checked={!!selectedSlider.is_active}
                onChange={(e) =>
                  setSelectedSlider((prev) =>
                    prev ? { ...prev, is_active: e.target.checked } : null,
                  )
                }
                className="h-4 w-4 rounded"
              />
              <label
                htmlFor="update_is_active_id"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                فعال باشد
              </label>
            </div>
            <Button
              type="button"
              onClick={handleUpdateSlider}
              disabled={updateSliderMutation.isPending}
            >
              {updateSliderMutation.isPending
                ? "در حال بروزرسانی..."
                : "ذخیره تغییرات"}
            </Button>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">بنری انتخاب نشده</p>
        )}
      </CustomModal>

      {/* DELETE */}
      <CustomModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="حذف بنر"
      >
        <div className="space-y-3">
          {(sliders ?? []).length === 0 ? (
            <p className="text-center text-sm text-gray-500">بنری وجود ندارد</p>
          ) : (
            (sliders ?? []).map((slider) => (
              <div
                key={slider.id}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800"
              >
                {typeof slider.image === "string" && (
                  <img
                    src={mediaUrl(slider.image)}
                    alt={slider.title}
                    className="h-12 w-16 rounded-lg object-cover"
                  />
                )}
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                  {slider.title}
                </p>
                <button
                  type="button"
                  className="text-rose-500 hover:text-rose-600"
                  onClick={() => handleRemoveSlider(slider.id)}
                >
                  <FaRegTrashAlt />
                </button>
              </div>
            ))
          )}
        </div>
      </CustomModal>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="بنرها" />
        <Dropdown
          isAddOpen={isAddOpen}
          setIsAddOpen={setIsAddOpen}
          isUpdateOpen={isUpdateOpen}
          setIsUpdateOpen={setIsUpdateOpen}
          isDeleteOpen={isDeleteOpen}
          setIsDeleteOpen={setIsDeleteOpen}
        />
      </div>

      {/* Card grid */}
      {!(sliders && sliders.length) ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white py-16 dark:border-gray-600 dark:bg-gray-800">
          <LuImage size={48} className="text-gray-300" />
          <p className="font-semibold text-gray-700 dark:text-gray-200">
            هنوز بنری ثبت نشده
          </p>
          <Button type="button" onClick={() => setIsAddOpen(true)}>
            افزودن بنر
          </Button>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          variants={parentVariants}
          initial="hidden"
          animate="visible"
        >
          {sliders.map((slider) => (
            <motion.article
              key={slider.id}
              variants={childrenVariants}
              className={`overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800 border-s-4 ${themeBorder[tc]}`}
            >
              <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-700">
                {typeof slider.image === "string" ? (
                  <img
                    src={mediaUrl(slider.image)}
                    alt={slider.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    <LuImage size={40} />
                  </div>
                )}
              </div>

              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {slider.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      slider.is_active
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    }`}
                  >
                    {slider.is_active ? "فعال" : "غیرفعال"}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                  {slider.sub_title}
                </p>
              </div>

              <div className="flex gap-2 border-t border-gray-100 px-4 py-3 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => openEdit(slider)}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white ${themeBgSolid[tc]}`}
                >
                  <FaPencil size={12} />
                  ویرایش
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSlider(slider.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 dark:bg-rose-950/40"
                >
                  <FaRegTrashAlt size={12} />
                  حذف
                </button>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Sliders;
