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
import { ThemeColorName, useThemeColor } from "../../context/ThemeColor";
import Dropdown from "../../components/Dropdown/Dropdown";
import { motion } from "framer-motion";
import { IoCamera } from "react-icons/io5";
import { themeText } from "../../utils/themeClasses";

const parentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const childrenVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
  },
};

const Sliders: React.FC = () => {
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState<boolean>(false);
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
  } = useForm<SliderItems>();
  const slidersMutation = useAddSlider();
  const removeSliderMutation = useRemoveSlider();
  const updateSliderMutation = useUpdateSlider();
  const { data: sliders, isPending, isError, error } = useGetSliders();
  const queryClient = useQueryClient();
  const { themeColor } = useThemeColor();

  if (isPending) return <Loading />;

  if (isError) {
    toast.error("خطا در بارگذاری بنرها!");
    console.log(error);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is PNG
      if (file.type !== "image/png") {
        toast.error("فقط فایل‌های PNG مجاز هستند!");
        setSelectedImage(null);
        setImagePreview(null);
        return;
      }
      // Check if file size is less than 5MB (5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم فایل نباید بیشتر از ۵ مگابایت باشد!");
        setSelectedImage(null);
        setImagePreview(null);
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleAddSlider = (data: SliderItems) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("sub_title", data.sub_title);
    formData.append("is_active", data.is_active.toString());
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    const addSliderToast = toast.loading("درحال ایجاد بنر...");

    slidersMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("بنر با موفقیت ایجاد شد!", { id: addSliderToast });
        queryClient.invalidateQueries({ queryKey: ["sliders"] });
        reset();
        setSelectedImage(null);
        setImagePreview(null);
      },
      onError: (error) => {
        const axiosError = error as AxiosError;
        console.log(axiosError);
        toast.error("خطا در ایجاد بنر!", { id: addSliderToast });
      },
    });
    setIsAddOpen(false);
  };

  const handleRemoveEmployee = (id: number) => {
    const removeSliderId = toast.loading("لطفا منتظر بمانید...");
    removeSliderMutation.mutate(id, {
      onSuccess: () => {
        toast.success("بنر مورد نظر با موفقیت حذف شد", {
          id: removeSliderId,
        });
        queryClient.invalidateQueries({ queryKey: ["sliders"] });
      },
      onError: (error: unknown) => {
        const axiosError = error as AxiosError;
        console.log(axiosError);
        toast.error("خطا در حذف بنر!", { id: removeSliderId });
      },
    });
  };

  const handleSlider = (slider: SliderItems) => {
    setSelectedSlider(slider);
    setSelectedSliderId(slider.id);
    setImagePreview(typeof slider.image === "string" ? slider.image : null);
    setSelectedImage(null);
  };

  const handleUpdateSlider = () => {
    if (!selectedSlider) {
      toast.error("لطفا بنر مورد نظر را انتخاب کنید!");
      return;
    } else if (!selectedSliderId) {
      toast.error("شناسه بنر معتبر نیست!");
      return;
    }

    const formData = new FormData();
    formData.append("id", selectedSliderId.toString());
    formData.append("title", selectedSlider.title || "");
    formData.append("sub_title", selectedSlider.sub_title || "");
    formData.append("is_active", selectedSlider.is_active.toString());
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    updateSliderMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("بنر با موفقیت بروزرسانی شد!");
        setIsUpdateOpen(false);
        setSelectedImage(null);
        setImagePreview(null);
        queryClient.invalidateQueries({ queryKey: ["sliders"] });
      },
      onError: (error) => {
        const axiosEror = error as AxiosError;
        console.log(axiosEror);
        toast.error("خطا در بروزرسانی بنر!");
      },
    });
  };

  return (
    <div>
      {/* Add Slider Modal */}
      <CustomModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setSelectedImage(null);
          setImagePreview(null);
          reset();
        }}
        title="افزودن بنر"
      >
        <form
          onSubmit={handleSubmit(handleAddSlider)}
          className="space-y-5 mt-8"
        >
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              عنوان
            </label>
            <input
              type="text"
              {...register("title", {
                required: "عنوان الزامی است",
                maxLength: {
                  value: 30,
                  message: "عنوان نمیتواند بیشتر از 30 کاراکتر باشد",
                },
              })}
              className="primary-input"
            />
            {errors.title && (
              <span className="text-red-500 text-sm">
                {errors.title.message}
              </span>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              زیرعنوان
            </label>
            <textarea
              {...register("sub_title", {
                required: "زیرعنوان الزامی است",
                maxLength: {
                  value: 60,
                  message: "زیرعنوان نمیتواند بیشتر از 60 کاراکتر باشد",
                },
              })}
              className="primary-input"
              rows={3}
            ></textarea>
            {errors.sub_title && (
              <span className="text-red-500 text-sm">
                {errors.sub_title.message}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="add-package-image"
              className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
            >
              تصویر
            </label>
            <label htmlFor="add-package-image">
              <div className="bg-white text-gray-500 hover:bg-slate-100 border-2 border-gray-300 rounded-xl border-dashed p-4 cursor-pointer dark:bg-gray-900 dark:border-gray-600">
                <span className="flex items-center gap-2">
                  انتخاب عکس <IoCamera size={20} />
                </span>
              </div>
            </label>
            <input
              type="file"
              className="hidden"
              id="add-package-image"
              accept="image/png"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 w-32 rounded-md"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("is_active")}
              className={`accent-${themeColor}-500`}
              id="is_active_id"
            />
            <label
              htmlFor="is_active_id"
              className="text-gray-700 dark:text-gray-300"
            >
              فعال باشد
            </label>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "در حال ارسال..." : "ایجاد بنر"}
          </Button>
        </form>
      </CustomModal>

      {/* Update Slider Modal */}
      <CustomModal
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
          setSelectedSlider(null);
          setSelectedImage(null);
          setImagePreview(null);
          reset();
        }}
        title="بروزرسانی بنر"
      >
        {sliders && sliders.length ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="عنوان"
              value={selectedSlider?.title || ""}
              onChange={(e) => {
                setSelectedSlider((prev) =>
                  prev ? { ...prev, title: e.target.value } : null,
                );
              }}
              className="primary-input"
            />
            <textarea
              rows={2}
              className="primary-input"
              placeholder="زیرعنوان"
              value={selectedSlider?.sub_title || ""}
              onChange={(e) =>
                setSelectedSlider((prev) =>
                  prev ? { ...prev, sub_title: e.target.value } : null,
                )
              }
            ></textarea>
            <div>
              <label
                htmlFor="package-image"
                className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
              >
                تصویر
              </label>
              <label htmlFor="package-image">
                <div className="bg-white text-gray-500 hover:bg-slate-100 border-2 border-gray-300 rounded-xl border-dashed p-4 cursor-pointer dark:bg-gray-900 dark:border-gray-600">
                  <span className="flex items-center gap-2">
                    انتخاب عکس <IoCamera size={20} />
                  </span>
                </div>
              </label>
              <input
                type="file"
                className="hidden"
                id="package-image"
                accept="image/png"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 w-32 rounded-md"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSlider?.is_active || false}
                onChange={(e) =>
                  setSelectedSlider((prev) =>
                    prev ? { ...prev, is_active: e.target.checked } : null,
                  )
                }
                className={`accent-${themeColor}-500`}
                id="update_is_active_id"
              />
              <label
                htmlFor="update_is_active_id"
                className="text-gray-700 dark:text-gray-300"
              >
                فعال باشد
              </label>
            </div>
            <Button onClick={handleUpdateSlider}>
              {updateSliderMutation.isPending
                ? "درحال بروزرسانی..."
                : "بروزرسانی بنر"}
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-base font-medium text-gray-500 dark:text-gray-300">
              هیچ بنری برای بروزرسانی وجود ندارد!
            </p>
          </div>
        )}
      </CustomModal>

      {/* Remove Slider Modal */}
      <CustomModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="حذف بنر"
      >
        <div className="space-y-4">
          {sliders && sliders.length ? (
            sliders?.map((slider) => (
              <div
                key={slider.id}
                className="flex items-center gap-4 relative border-s-2 border-s-red-500 rounded-e-xl p-4 bg-slate-100 dark:bg-gray-700 shadow-md"
              >
                <p className="text-base text-gray-600 dark:text-gray-300">
                  {slider.title}
                </p>
                {typeof slider.image === "string" && (
                  <img
                    src={slider.image}
                    alt={slider.title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
                <button
                  className="text-xl text-red-500 absolute top-5 left-3 hover:text-red-600 transition"
                  onClick={() => handleRemoveEmployee(slider.id)}
                >
                  <FaRegTrashAlt />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center">
              <p className="text-base font-medium text-gray-500 dark:text-gray-300">
                هیچ بنری برای حذف وجود ندارد!
              </p>
            </div>
          )}
        </div>
      </CustomModal>

      <div className="flex flex-row justify-between items-center mt-8">
        <PageTitle title="بنر ها" />
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

      <div className="mt-5">
        <motion.div
          className="grid grid-cols-1 gap-4"
          variants={parentVariants}
          initial="hidden"
          animate="visible"
        >
          {sliders && sliders.length ? (
            sliders?.map((slider) => (
              <motion.div
                key={slider.id}
                className="rounded-xl p-4 transition bg-white shadow-md dark:bg-gray-700"
                variants={childrenVariants}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2 dark:text-white">
                      {slider.title}
                    </h4>
                    <p
                      className="text-sm text-gray-500 mb-4 line-clamp-2 cursor-pointer dark:text-gray-300"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        target.classList.toggle("line-clamp-2");
                      }}
                    >
                      {slider.sub_title}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                        slider.is_active
                          ? "bg-green-100 text-green-600 dark:bg-green-500 dark:text-white"
                          : "bg-red-100 text-red-600 dark:bg-red-500 dark:text-white"
                      }`}
                    >
                      {slider.is_active ? "فعال" : "غیرفعال"}
                    </span>
                  </div>
                  {typeof slider.image === "string" && (
                    <img
                      src={slider.image}
                      alt={slider.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <button
                    className={`text-xl text-${themeColor}-500 hover:${themeText[themeColor as ThemeColorName]} transition`}
                    onClick={() => handleSlider(slider)}
                  >
                    <FaPencil />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center">
              <p className="text-base font-medium text-gray-500 dark:text-gray-300">
                هیچ بنری وجود ندارد!
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Sliders;
