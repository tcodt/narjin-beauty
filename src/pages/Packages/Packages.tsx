/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { IoCamera } from "react-icons/io5";
import CustomModal from "../../components/CustomModal/CustomModal";
import Button from "../../components/Button/Button";
import { useGetPackages } from "../../hooks/packages/useGetPackages";
import { useGetServices } from "../../hooks/services/useGetServices";
import { useAddPackage } from "../../hooks/packages/useAddPackage";
import Loading from "../../components/Loading/Loading";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  AddPackage,
  Packages as PackagesType,
  UpdatePackage,
} from "../../types/packages";
import { useNavigate } from "react-router";
import { FaPencil } from "react-icons/fa6";
import { FaRegTrashAlt } from "react-icons/fa";
import { useRemovePackage } from "../../hooks/packages/useRemovePackage";
import { useUpdatePackage } from "../../hooks/packages/useUpdatePackage";
import PageTitle from "../../components/PageTitle/PageTitle";
import { useThemeColor } from "../../context/ThemeColor";
import Dropdown from "../../components/Dropdown/Dropdown";
import { motion } from "framer-motion";
import { useBusinessMe } from "../../hooks/business/useBusinessMe";
import {
  mediaUrl,
  themeBgSolid,
  themeText,
  themeBorder,
} from "../../utils/themeClasses";
import { LuPackage } from "react-icons/lu";

const parentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const childrenVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const Packages: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackagesType | null>(
    null,
  );
  const navigate = useNavigate();
  const { themeColor } = useThemeColor();
  const { data: myBusiness } = useBusinessMe();
  const myBusinessId = myBusiness?.id ?? 0;

  const addForm = useForm<AddPackage>({
    defaultValues: {
      business_id: 0,
      name: "",
      desc: "",
      total_price: "",
      service_ids: [],
    },
  });

  const updateForm = useForm<UpdatePackage>({
    defaultValues: {
      business_id: 0,
      name: "",
      desc: "",
      total_price: "",
      service_ids: [],
    },
  });

  const {
    register: addRegister,
    handleSubmit: addHandleSubmit,
    formState: { errors: addErrors },
    reset: addReset,
    watch: addWatch,
    setValue: addSetValue,
  } = addForm;

  const {
    register: updateRegister,
    handleSubmit: updateHandleSubmit,
    // formState: { errors: updateErrors },
    reset: updateReset,
    watch: updateWatch,
    setValue: updateSetValue,
  } = updateForm;

  const { data: packages = [], isPending, isError, error } = useGetPackages();
  const { data: servicesData = [] } = useGetServices();
  const addPackageMutation = useAddPackage();
  const removePackageMutation = useRemovePackage();
  const updatePackageMutation = useUpdatePackage();
  const queryClient = useQueryClient();

  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE) {
      toast.error("حجم فایل بیش از ۵ مگابایت است");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("فقط JPG / PNG / WEBP");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const toggleServiceId = (
    id: number,
    current: number[],
    set: (ids: number[]) => void,
  ) => {
    if (current.includes(id)) set(current.filter((x) => x !== id));
    else set([...current, id]);
  };

  const handleAddPackage = (data: AddPackage) => {
    if (!myBusinessId) {
      toast.error("کسب‌وکار شما یافت نشد");
      return;
    }
    const serviceIds = (data.service_ids ?? []).map(Number).filter(Boolean);
    if (!serviceIds.length) {
      toast.error("حداقل یک سرویس انتخاب کنید");
      return;
    }
    if (!image) {
      toast.error("تصویر پکیج الزامی است");
      return;
    }

    const toastId = toast.loading("در حال افزودن پکیج...");
    const formData = new FormData();
    formData.append("business_id", String(myBusinessId));
    formData.append("name", data.name);
    formData.append("desc", data.desc);
    formData.append("total_price", data.total_price.replace(/,/g, ""));
    formData.append("image", image);
    serviceIds.forEach((id) => formData.append("service_ids", String(id)));

    addPackageMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("پکیج اضافه شد", { id: toastId });
        queryClient.invalidateQueries({ queryKey: ["packages"] });
        addReset();
        setImage(null);
        setPreview(null);
        setIsAddOpen(false);
      },
      onError: (err) => {
        toast.error("خطا در افزودن پکیج", { id: toastId });
        console.error(err);
      },
    });
  };

  const handleRemovePackage = (id: number) => {
    const toastId = toast.loading("در حال حذف...");
    removePackageMutation.mutate(id, {
      onSuccess: () => {
        toast.success("حذف شد", { id: toastId });
        queryClient.invalidateQueries({ queryKey: ["packages"] });
      },
      onError: () => toast.error("خطا در حذف", { id: toastId }),
    });
  };

  const openUpdate = (pkg: PackagesType) => {
    setSelectedPackage(pkg);
    updateReset({
      business_id: pkg.business?.id || myBusinessId,
      name: pkg.name,
      desc: pkg.desc,
      total_price: pkg.total_price,
      service_ids: pkg.services?.map((s) => s.id) ?? [],
    });
    setPreview(pkg.image ? mediaUrl(pkg.image) : null);
    setImage(null);
    setIsUpdateOpen(true);
  };

  const handleUpdateSubmit = (data: UpdatePackage) => {
    if (!selectedPackage) return;
    const serviceIds = (data.service_ids ?? []).map(Number).filter(Boolean);
    if (!serviceIds.length) {
      toast.error("حداقل یک سرویس انتخاب کنید");
      return;
    }

    const toastId = toast.loading("در حال بروزرسانی...");
    const formData = new FormData();
    formData.append(
      "business_id",
      String(selectedPackage.business?.id || myBusinessId),
    );
    formData.append("name", data.name);
    formData.append("desc", data.desc);
    formData.append("total_price", data.total_price.replace(/,/g, ""));
    if (image) formData.append("image", image);
    serviceIds.forEach((id) => formData.append("service_ids", String(id)));

    updatePackageMutation.mutate(
      { id: selectedPackage.id, formData },
      {
        onSuccess: () => {
          toast.success("بروزرسانی شد", { id: toastId });
          queryClient.invalidateQueries({ queryKey: ["packages"] });
          updateReset();
          setImage(null);
          setPreview(null);
          setSelectedPackage(null);
          setIsUpdateOpen(false);
        },
        onError: (err) => {
          toast.error("خطا در بروزرسانی", { id: toastId });
          console.error(err as AxiosError);
        },
      },
    );
  };

  if (isPending) return <Loading />;
  if (isError) {
    console.error(error);
    toast.error("خطا در دریافت پکیج‌ها");
  }

  const addServiceIds = (addWatch("service_ids") as number[]) || [];
  const updateServiceIds = (updateWatch("service_ids") as number[]) || [];

  const ServicePicker = ({
    selected,
    onToggle,
  }: {
    selected: number[];
    onToggle: (id: number) => void;
  }) => (
    <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl border border-gray-200 p-3 dark:border-gray-600">
      {servicesData.length === 0 && (
        <p className="text-xs text-gray-400">سرویسی ثبت نشده است</p>
      )}
      {servicesData.map((s: any) => {
        const active = selected.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onToggle(s.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              active
                ? `${themeBgSolid[themeColor]} border-transparent text-white`
                : "border-gray-200 bg-white text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {s.name}
          </button>
        );
      })}
    </div>
  );

  const ImagePicker = () => (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 transition hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800">
      {preview ? (
        <img
          src={preview}
          alt=""
          className="h-32 w-full rounded-xl object-cover"
        />
      ) : (
        <>
          <IoCamera className={`text-3xl ${themeText[themeColor]}`} />
          <span className="text-xs text-gray-500">انتخاب تصویر پکیج</span>
        </>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
    </label>
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="پکیج‌ها" />
        <Dropdown
          isAddOpen={isAddOpen}
          setIsAddOpen={setIsAddOpen}
          isUpdateOpen={isUpdateOpen}
          setIsUpdateOpen={setIsUpdateOpen}
          isDeleteOpen={isDeleteOpen}
          setIsDeleteOpen={setIsDeleteOpen}
        />
      </div>

      {/* ADD */}
      <CustomModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          addReset();
          setImage(null);
          setPreview(null);
        }}
        title="افزودن پکیج"
      >
        <form
          onSubmit={addHandleSubmit(handleAddPackage)}
          className="flex flex-col gap-4"
        >
          <ImagePicker />
          <input
            type="text"
            className="primary-input"
            placeholder="نام پکیج"
            {...addRegister("name", { required: "نام الزامی است" })}
          />
          {addErrors.name && (
            <p className="text-sm text-red-500">{addErrors.name.message}</p>
          )}
          <textarea
            className="primary-input min-h-[5rem] h-auto"
            placeholder="توضیحات"
            {...addRegister("desc", { required: "توضیحات الزامی است" })}
          />
          <input
            type="text"
            className="primary-input"
            placeholder="قیمت کل (تومان)"
            {...addRegister("total_price", { required: "قیمت الزامی است" })}
          />
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              سرویس‌ها
            </p>
            <ServicePicker
              selected={addServiceIds}
              onToggle={(id) =>
                toggleServiceId(id, addServiceIds, (ids) =>
                  addSetValue("service_ids", ids, { shouldValidate: true }),
                )
              }
            />
          </div>
          <Button type="submit" disabled={addPackageMutation.isPending}>
            {addPackageMutation.isPending ? "در حال ثبت..." : "ثبت پکیج"}
          </Button>
        </form>
      </CustomModal>

      {/* UPDATE */}
      <CustomModal
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
          setSelectedPackage(null);
          setImage(null);
          setPreview(null);
        }}
        title="ویرایش پکیج"
      >
        <form
          onSubmit={updateHandleSubmit(handleUpdateSubmit)}
          className="flex flex-col gap-4"
        >
          <ImagePicker />
          <input
            type="text"
            className="primary-input"
            placeholder="نام پکیج"
            {...updateRegister("name", { required: true })}
          />
          <textarea
            className="primary-input min-h-[5rem] h-auto"
            placeholder="توضیحات"
            {...updateRegister("desc", { required: true })}
          />
          <input
            type="text"
            className="primary-input"
            placeholder="قیمت کل"
            {...updateRegister("total_price", { required: true })}
          />
          <ServicePicker
            selected={updateServiceIds}
            onToggle={(id) =>
              toggleServiceId(id, updateServiceIds, (ids) =>
                updateSetValue("service_ids", ids),
              )
            }
          />
          <Button type="submit">ذخیره تغییرات</Button>
        </form>
      </CustomModal>

      {/* DELETE LIST */}
      <CustomModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="حذف پکیج"
      >
        <div className="space-y-3">
          {packages.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800"
            >
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {p.name}
              </span>
              <button
                type="button"
                className="text-rose-500"
                onClick={() => handleRemovePackage(p.id)}
              >
                <FaRegTrashAlt />
              </button>
            </div>
          ))}
        </div>
      </CustomModal>

      {/* LIST — card UI */}
      {packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white py-16 dark:border-gray-600 dark:bg-gray-800">
          <LuPackage size={48} className="text-gray-300" />
          <p className="font-semibold text-gray-700 dark:text-gray-200">
            هنوز پکیجی ثبت نشده
          </p>
          <Button type="button" onClick={() => setIsAddOpen(true)}>
            افزودن پکیج
          </Button>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          variants={parentVariants}
          initial="hidden"
          animate="visible"
        >
          {packages.map((pkg) => (
            <motion.article
              key={pkg.id}
              variants={childrenVariants}
              className={`group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800 border-s-4 ${themeBorder[themeColor]}`}
            >
              <button
                type="button"
                className="block w-full text-right"
                onClick={() => navigate(`/packages/${pkg.id}`)}
              >
                <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={mediaUrl(pkg.image)}
                    alt={pkg.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {pkg.name}
                  </h3>
                  <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                    {pkg.desc}
                  </p>
                  <p
                    className={`text-sm font-semibold ${themeText[themeColor]}`}
                  >
                    {Number(pkg.total_price || 0).toLocaleString("fa-IR")} تومان
                  </p>
                  {pkg.services?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {pkg.services.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {s.name}
                        </span>
                      ))}
                      {pkg.services.length > 3 && (
                        <span className="text-[10px] text-gray-400">
                          +{pkg.services.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
              <div className="flex gap-2 border-t border-gray-100 px-4 py-3 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => openUpdate(pkg)}
                  className={`inline-flex flex-1 items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-white ${themeBgSolid[themeColor]}`}
                >
                  <FaPencil size={12} /> ویرایش
                </button>
                <button
                  type="button"
                  onClick={() => handleRemovePackage(pkg.id)}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 dark:bg-rose-950/40"
                >
                  <FaRegTrashAlt size={12} /> حذف
                </button>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Packages;
