import React, { useEffect, useMemo, useState } from "react";
import { MdAttachMoney, MdOutlineRoomService } from "react-icons/md";
import { PiTimerBold } from "react-icons/pi";
import Loading from "../../components/Loading/Loading";
import { FaPencil } from "react-icons/fa6";
import CustomModal from "../../components/CustomModal/CustomModal";
import { FaRegTrashAlt, FaUser } from "react-icons/fa";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useGetServices } from "../../hooks/services/useGetServices";
import { useRemoveService } from "../../hooks/services/useRemoveService";
import { useForm } from "react-hook-form";
import { GetServicesItem, PostServicesData } from "../../types/services";
import Button from "../../components/Button/Button";
import { useGetEmployees } from "../../hooks/employees/useGetEmployees";
import { useAddService } from "../../hooks/services/useAddService";
import TimeInput from "../../components/TimeInput/TimeInput";
import { useUpdateService } from "../../hooks/services/useUpdateService";
import PageTitle from "../../components/PageTitle/PageTitle";
import { useThemeColor } from "../../context/ThemeColor";
import Dropdown from "../../components/Dropdown/Dropdown";
import { motion } from "framer-motion";
import {
  getEmployeeLabel,
  getEmployeeDisplayName,
  getEmployeeImage,
} from "../../types/employees";
import { useBusinessMe } from "../../hooks/business/useBusinessMe";

type FormValues = {
  name: string;
  description: string;
  price: string;
  employee_id: number;
};

function extractEmployeeId(service: GetServicesItem): number | undefined {
  const emp = service.employee as unknown;
  if (!emp) return undefined;
  if (typeof emp === "number") return emp;
  if (typeof emp === "object" && emp !== null && "id" in emp) {
    const id = (emp as { id?: number }).id;
    return typeof id === "number" ? id : undefined;
  }
  return undefined;
}

function parseDuration(duration?: string) {
  if (!duration) return { hour: 0, minute: 0 };
  const [h, m] = duration.split(":").map((x) => Number(x) || 0);
  return { hour: h, minute: m };
}

const ManageServices: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      employee_id: undefined as unknown as number,
    },
  });

  const {
    data: services = [],
    isError,
    isPending,
    error,
    isFetching,
  } = useGetServices();

  const { data: employees = [], isPending: employeesLoading } =
    useGetEmployees();

  const { data: businessMe, isPending: businessLoading } = useBusinessMe();

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [serviceIdToEdit, setServiceIdToEdit] = useState<number | null>(null);
  const [time, setTime] = useState({ hour: 0, minute: 30 });

  const queryClient = useQueryClient();
  const removeServiceMutation = useRemoveService();
  const addServiceMutation = useAddService();
  const updateServiceMutation = useUpdateService();
  const { themeColor } = useThemeColor();

  const myBusinessId = businessMe?.id;

  // Owner list: trust API scoping. Only soft-filter when business id is clearly present & different.
  const ownerServices = useMemo(() => {
    if (!services.length) return [];
    if (!myBusinessId) return services;

    const filtered = services.filter((s) => {
      const b = s.business as unknown;
      if (b == null) return true;
      if (typeof b === "number") return b === myBusinessId;
      if (typeof b === "object" && b !== null && "id" in b) {
        return (b as { id: number }).id === myBusinessId;
      }
      return true;
    });

    // If filter wiped everything but API returned items, keep API list
    return filtered.length ? filtered : services;
  }, [services, myBusinessId]);

  useEffect(() => {
    if (isError) {
      console.error(error);
    }
  }, [isError, error]);

  const openAddModal = () => {
    setServiceIdToEdit(null);
    setTime({ hour: 0, minute: 30 });
    reset({
      name: "",
      description: "",
      price: "",
      employee_id: undefined as unknown as number,
    });
    setIsAddOpen(true);
  };

  const openEditFromService = (service: GetServicesItem) => {
    const empId = extractEmployeeId(service);
    const dur = parseDuration(service.duration);

    setServiceIdToEdit(service.id);
    setTime(dur);
    reset({
      name: service.name ?? "",
      description: service.description ?? "",
      price: String(service.price ?? ""),
      employee_id: empId as number,
    });
    if (empId) setValue("employee_id", empId);
    setIsUpdateOpen(false);
    setIsAddOpen(true);
  };

  const closeFormModal = () => {
    setIsAddOpen(false);
    setServiceIdToEdit(null);
    setTime({ hour: 0, minute: 30 });
    reset({
      name: "",
      description: "",
      price: "",
      employee_id: undefined as unknown as number,
    });
  };

  const onSubmit = (data: FormValues) => {
    if (!myBusinessId) {
      toast.error("کسب‌وکار شما یافت نشد. ابتدا کسب‌وکار را تکمیل کنید.");
      return;
    }

    if (!data.employee_id || Number.isNaN(Number(data.employee_id))) {
      toast.error("انتخاب آرایشگر الزامی است");
      return;
    }

    const duration = `${String(time.hour).padStart(2, "0")}:${String(
      time.minute,
    ).padStart(2, "0")}:00`;

    const values: PostServicesData = {
      name: data.name,
      description: data.description ?? "",
      price: String(data.price),
      duration,
      business_id: myBusinessId, // always THIS owner's business
      employee_id: Number(data.employee_id),
    };

    const toastId = toast.loading(
      serviceIdToEdit ? "در حال بروزرسانی سرویس..." : "در حال افزودن سرویس...",
    );

    const onDone = () => {
      toast.success(
        serviceIdToEdit
          ? "سرویس با موفقیت بروزرسانی شد!"
          : "سرویس با موفقیت افزوده شد!",
        { id: toastId },
      );
      closeFormModal();
      queryClient.invalidateQueries({ queryKey: ["services"] });
    };

    const onFail = (err: unknown) => {
      const ax = err as AxiosError<Record<string, unknown> | string[]>;
      const body = ax.response?.data;
      let message = serviceIdToEdit
        ? "خطا در بروزرسانی سرویس"
        : "خطا در افزودن سرویس";

      if (Array.isArray(body) && body[0]) message = String(body[0]);
      else if (body && typeof body === "object") {
        if (typeof (body as { detail?: string }).detail === "string") {
          message = (body as { detail: string }).detail;
        } else {
          const first = Object.values(body).find(
            (v) => Array.isArray(v) && v[0],
          ) as string[] | undefined;
          if (first?.[0]) message = String(first[0]);
        }
      }

      toast.error(message, { id: toastId });
      console.error(ax.response?.status, body);
    };

    if (serviceIdToEdit) {
      updateServiceMutation.mutate(
        { id: serviceIdToEdit, values },
        { onSuccess: onDone, onError: onFail },
      );
      return;
    }

    addServiceMutation.mutate(values, {
      onSuccess: onDone,
      onError: onFail,
    });
  };

  const handleRemoveService = (id: number) => {
    const toastId = toast.loading("درحال حذف سرویس...");
    removeServiceMutation.mutate(id, {
      onSuccess: () => {
        toast.success("سرویس مورد نظر با موفقیت حذف شد", { id: toastId });
        queryClient.invalidateQueries({ queryKey: ["services"] });
      },
      onError: (err) => {
        toast.error("خطا در حذف سرویس!", { id: toastId });
        console.error(err);
      },
    });
  };

  if (isPending || businessLoading) return <Loading />;

  if (isError) {
    return (
      <div className="rounded-2xl bg-rose-50 p-6 text-center text-rose-600 dark:bg-rose-900/20">
        خطا در بارگذاری خدمات
      </div>
    );
  }

  if (!myBusinessId) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-8 text-center text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        کسب‌وکار شما هنوز ثبت یا فعال نشده است.
      </div>
    );
  }

  const isSaving =
    addServiceMutation.isPending || updateServiceMutation.isPending;

  return (
    <div className="space-y-6 pb-10">
      {/* Delete modal */}
      <CustomModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="حذف سرویس"
      >
        <div className="flex flex-col gap-3">
          {!ownerServices.length ? (
            <p className="text-sm text-gray-500">سرویسی برای حذف نیست.</p>
          ) : (
            ownerServices.map((ser) => (
              <div
                key={ser.id}
                className="relative flex items-center gap-3 rounded-2xl border-s-4 border-s-rose-500 bg-slate-100 p-3 dark:bg-gray-700"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <FaUser size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-800 dark:text-white">
                    {ser.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {getEmployeeDisplayName(ser.employee?.user)}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full p-2 text-rose-500 hover:bg-rose-50"
                  onClick={() => handleRemoveService(ser.id)}
                  aria-label="حذف"
                >
                  <FaRegTrashAlt />
                </button>
              </div>
            ))
          )}
        </div>
      </CustomModal>

      {/* Pick service to edit */}
      <CustomModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        title="انتخاب سرویس برای ویرایش"
      >
        <div className="flex flex-col gap-3">
          {!ownerServices.length ? (
            <p className="text-sm text-gray-500">سرویسی برای ویرایش نیست.</p>
          ) : (
            ownerServices.map((ser) => (
              <button
                key={ser.id}
                type="button"
                onClick={() => openEditFromService(ser)}
                className={`relative flex items-center gap-3 rounded-2xl border-s-4 border-s-${themeColor}-500 bg-slate-100 p-3 text-right dark:bg-gray-700`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <FaPencil className={`text-${themeColor}-500`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-800 dark:text-white">
                    {ser.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {getEmployeeDisplayName(ser.employee?.user)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </CustomModal>

      {/* Add / Edit form — NO other salons */}
      <CustomModal
        isOpen={isAddOpen}
        onClose={closeFormModal}
        title={serviceIdToEdit ? "ویرایش سرویس" : "افزودن سرویس جدید"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-gray-700/50 dark:text-gray-300">
            سالن:{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {businessMe?.name}
            </span>
          </div>

          <div>
            <input
              type="text"
              placeholder="نام سرویس"
              className="primary-input"
              {...register("name", { required: "نام سرویس الزامی است" })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <input
            type="text"
            placeholder="توضیحات"
            className="primary-input"
            {...register("description")}
          />

          <TimeInput
            hour={time.hour}
            minute={time.minute}
            onChange={(h, m) => setTime({ hour: h, minute: m })}
          />

          <div>
            <input
              type="number"
              placeholder="قیمت (تومان)"
              className="primary-input appearance-none"
              {...register("price", {
                required: "قیمت الزامی است",
                validate: (v) => !isNaN(Number(v)) || "قیمت باید عدد باشد",
              })}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">
                {errors.price.message}
              </p>
            )}
          </div>

          <div>
            <select
              className="primary-input"
              disabled={employeesLoading}
              {...register("employee_id", {
                required: "آرایشگر الزامی است",
                valueAsNumber: true,
              })}
            >
              <option value="">انتخاب آرایشگر</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {getEmployeeLabel(emp)}
                </option>
              ))}
            </select>
            {errors.employee_id && (
              <p className="mt-1 text-sm text-red-500">
                {errors.employee_id.message}
              </p>
            )}
            {!employeesLoading && !employees.length && (
              <p className="mt-1 text-xs text-amber-600">
                ابتدا از بخش آرایشگران، کارمند اضافه کنید.
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving
              ? "در حال ذخیره..."
              : serviceIdToEdit
                ? "بروزرسانی سرویس"
                : "ثبت سرویس"}
          </Button>
        </form>
      </CustomModal>

      {/* Header */}
      <div className="mt-8 flex flex-row items-center justify-between">
        <PageTitle title="خدمات" />
        <div className="flex flex-row flex-wrap items-center gap-2">
          <Dropdown
            isAddOpen={isAddOpen}
            setIsAddOpen={(open) => {
              if (open) openAddModal();
              else setIsAddOpen(false);
            }}
            isUpdateOpen={isUpdateOpen}
            setIsUpdateOpen={setIsUpdateOpen}
            isDeleteOpen={isDeleteOpen}
            setIsDeleteOpen={setIsDeleteOpen}
          />
        </div>
      </div>

      {isFetching && !isPending && (
        <p className="text-xs text-gray-400">در حال همگام‌سازی...</p>
      )}

      {/* Single list — no duplicate maps */}
      {!ownerServices.length ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-14 text-center dark:border-gray-600 dark:bg-gray-800">
          <p className="font-semibold text-gray-800 dark:text-white">
            هیچ سرویسی وجود ندارد
          </p>
          <p className="mt-1 text-sm text-gray-500">
            اولین سرویس سالن خود را اضافه کنید.
          </p>
          <Button type="button" className="mt-4" onClick={openAddModal}>
            افزودن سرویس
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ownerServices.map((service) => {
            const img = getEmployeeImage(service.employee?.user);
            return (
              <motion.article
                key={service.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className={`mb-3 rounded-xl border-s-4 border-${themeColor}-500 bg-${themeColor}-50 px-3 py-2 dark:bg-${themeColor}-900`}
                >
                  <h3
                    className={`text-lg font-bold text-${themeColor}-800 dark:text-${themeColor}-200`}
                  >
                    {service.name}
                  </h3>
                </div>

                <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  {img ? (
                    <img
                      src={
                        img.startsWith("http")
                          ? img
                          : `https://queuingprojectapi.pythonanywhere.com${img}`
                      }
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-gray-400" />
                  )}
                  <span>
                    آرایشگر: {getEmployeeDisplayName(service.employee?.user)}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <MdOutlineRoomService
                      size={20}
                      className={`text-${themeColor}-500`}
                    />
                    <span className="line-clamp-2">
                      {service.description || "بدون توضیحات"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <PiTimerBold
                      size={20}
                      className={`text-${themeColor}-500`}
                    />
                    <span>{service.duration || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <MdAttachMoney
                      size={20}
                      className={`text-${themeColor}-500`}
                    />
                    <span>
                      {Number(service.price || 0).toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => openEditFromService(service)}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-xl bg-${themeColor}-50 py-2 text-xs font-semibold text-${themeColor}-700 dark:bg-${themeColor}-900`}
                  >
                    <FaPencil size={12} />
                    ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(service.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-rose-50 py-2 text-xs font-semibold text-rose-600 dark:bg-rose-900/30"
                  >
                    <FaRegTrashAlt size={12} />
                    حذف
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageServices;
