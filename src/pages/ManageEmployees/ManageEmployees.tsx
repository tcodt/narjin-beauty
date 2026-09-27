import React, { useMemo, useState } from "react";
import Loading from "../../components/Loading/Loading";
import toast from "react-hot-toast";
import { FaRegTrashAlt, FaUser } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import CustomModal from "../../components/CustomModal/CustomModal";
import { useQueryClient } from "@tanstack/react-query";
import { useGetEmployees } from "../../hooks/employees/useGetEmployees";
import { useRemoveEmployee } from "../../hooks/employees/useRemoveEmployee";
import Button from "../../components/Button/Button";
import { useAddEmployee } from "../../hooks/employees/useAddEmployee";
import { useUpdateEmployee } from "../../hooks/employees/useUpdateEmployee";
import PageTitle from "../../components/PageTitle/PageTitle";
import { ThemeColorName, useThemeColor } from "../../context/ThemeColor";
import Dropdown from "../../components/Dropdown/Dropdown";
import { motion } from "framer-motion";
import { AxiosError } from "axios";
import {
  GetEmployeesItem,
  getEmployeeDisplayName,
  getEmployeeFirstName,
  getEmployeeLastName,
  getEmployeePhone,
  getEmployeeIsActive,
  getEmployeeIsOwner,
  getEmployeeIsStaff,
  getEmployeeUserId,
  getEmployeeImage,
} from "../../types/employees";
import { useAuth } from "../../context/AuthContext";
import { themeText } from "../../utils/themeClasses";
import EmptyState from "../../components/EmptyState/EmptyState";
import SearchBar from "../../components/SearchBar/SearchBar";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

type StatusFilter = "all" | "active" | "inactive";

const API_ORIGIN = "https://queuingprojectapi.pythonanywhere.com";

const ManageEmployees: React.FC = () => {
  const { data: employees = [], isPending, isError, error } = useGetEmployees();

  const addEmployeeMutation = useAddEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const removeEmployeeMutation = useRemoveEmployee();
  const queryClient = useQueryClient();
  const { themeColor } = useThemeColor();
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const debouncedSearch = useDebouncedValue(searchQuery, 250);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Create — matches EmployeeCreate
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [skill, setSkill] = useState("");

  // Edit — matches EmployeeUpdate (first_name, last_name, skill only)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editSkill, setEditSkill] = useState("");

  const isSelf = (emp: GetEmployeesItem) => {
    const empUserId = getEmployeeUserId(emp.user);
    return (
      empUserId != null && currentUserId != null && empUserId === currentUserId
    );
  };

  const resetAddForm = () => {
    setFirstName("");
    setLastName("");
    setPhone("");
    setPassword("");
    setSkill("");
  };

  const openAdd = () => {
    resetAddForm();
    setIsAddOpen(true);
  };

  const openEdit = (emp: GetEmployeesItem) => {
    setEditingId(emp.id);

    let first = getEmployeeFirstName(emp.user);
    let last = getEmployeeLastName(emp.user);

    // اگر user رشته باشد یا last خالی بماند، از display name جدا کن
    if (!last || first === "بدون نام") {
      const full = getEmployeeDisplayName(emp.user).trim();
      if (full && full !== "بدون نام") {
        const parts = full.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
          first = parts[0];
          last = parts.slice(1).join(" ");
        } else if (parts.length === 1 && (!first || first === "بدون نام")) {
          first = parts[0];
          last = "";
        }
      }
    }

    // جلوگیری از پر شدن "بدون نام" داخل اینپوت
    if (first === "بدون نام") first = "";

    setEditFirstName(first);
    setEditLastName(last);
    setEditSkill(emp.skill || "");
    setIsUpdateOpen(true);
  };

  const parseApiError = (err: unknown, fallback: string) => {
    const ax = err as AxiosError<Record<string, unknown> | string[]>;
    const data = ax.response?.data;
    if (Array.isArray(data) && data[0]) return String(data[0]);
    if (data && typeof data === "object") {
      if (typeof (data as { detail?: string }).detail === "string") {
        return (data as { detail: string }).detail;
      }
      const first = Object.values(data).find(
        (v) => Array.isArray(v) && v[0],
      ) as string[] | undefined;
      if (first?.[0]) return String(first[0]);
      // field errors: { phone_number: ["..."] }
      const msg = Object.entries(data)
        .map(([k, v]) => {
          if (Array.isArray(v)) return `${k}: ${v.join(", ")}`;
          if (typeof v === "string") return `${k}: ${v}`;
          return null;
        })
        .filter(Boolean)
        .join(" — ");
      if (msg) return msg;
    }
    return fallback;
  };

  /** POST /business/employees/create/ */
  const handleAddEmployee = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("نام و نام خانوادگی الزامی است");
      return;
    }
    if (!/^09[0-9]{9}$/.test(phone.trim())) {
      toast.error("شماره موبایل معتبر وارد کنید (۱۱ رقم، با ۰۹)");
      return;
    }
    if (!skill.trim()) {
      toast.error("مهارت الزامی است");
      return;
    }

    const toastId = toast.loading("در حال افزودن آرایشگر...");

    addEmployeeMutation.mutate(
      {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phone.trim(),
        skill: skill.trim(),
        password: password.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("آرایشگر با موفقیت اضافه شد!", { id: toastId });
          setIsAddOpen(false);
          resetAddForm();
          queryClient.invalidateQueries({ queryKey: ["employees"] });
        },
        onError: (err) => {
          toast.error(parseApiError(err, "خطا در افزودن آرایشگر"), {
            id: toastId,
          });
          console.error(err);
        },
      },
    );
  };

  /** PUT /business/employees/update/{id}/ — only name + skill */
  const handleUpdateEmployee = () => {
    if (!editingId) return;
    if (!editFirstName.trim() || !editLastName.trim()) {
      toast.error("نام و نام خانوادگی الزامی است");
      return;
    }
    if (!editSkill.trim()) {
      toast.error("مهارت الزامی است");
      return;
    }

    const toastId = toast.loading("در حال بروزرسانی...");

    updateEmployeeMutation.mutate(
      {
        id: editingId,
        values: {
          first_name: editFirstName.trim(),
          last_name: editLastName.trim(),
          skill: editSkill.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("آرایشگر بروزرسانی شد", { id: toastId });
          setIsUpdateOpen(false);
          setEditingId(null);
          queryClient.invalidateQueries({ queryKey: ["employees"] });
        },
        onError: (err) => {
          toast.error(parseApiError(err, "خطا در بروزرسانی آرایشگر"), {
            id: toastId,
          });
          console.error(err);
        },
      },
    );
  };

  /** DELETE /business/employees/{id}/ */
  const handleRemoveEmployee = (emp: GetEmployeesItem) => {
    if (isSelf(emp)) {
      toast.error("نمی‌توانید خودتان را از لیست آرایشگران حذف کنید");
      return;
    }

    const toastId = toast.loading("در حال حذف...");
    removeEmployeeMutation.mutate(emp.id, {
      onSuccess: () => {
        toast.success("آرایشگر حذف شد", { id: toastId });
        setIsDeleteOpen(false);
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      },
      onError: (err) => {
        toast.error(parseApiError(err, "خطا در حذف آرایشگر"), { id: toastId });
        console.error(err);
      },
    });
  };

  const filteredEmployees = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return employees.filter((emp) => {
      // is_active فقط از user object (اگر string باشد helper → true)
      const active = getEmployeeIsActive(emp.user);
      if (statusFilter === "active" && !active) return false;
      if (statusFilter === "inactive" && active) return false;
      if (!q) return true;

      const name = getEmployeeDisplayName(emp.user).toLowerCase();
      const phoneVal = (getEmployeePhone(emp.user) || "").toLowerCase();
      const skillVal = (emp.skill || "").toLowerCase();

      return name.includes(q) || phoneVal.includes(q) || skillVal.includes(q);
    });
  }, [employees, debouncedSearch, statusFilter]);

  if (isPending) return <Loading />;

  if (isError) {
    console.error(error);
    return (
      <div className="rounded-2xl bg-rose-50 p-6 text-center text-rose-600 dark:bg-rose-900/20">
        خطا در بارگذاری آرایشگران
      </div>
    );
  }

  return (
    <section className="space-y-6 pb-10">
      {/* حذف */}
      <CustomModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="حذف آرایشگر"
      >
        <div className="flex flex-col gap-3">
          {employees.filter((e) => !isSelf(e)).length === 0 ? (
            <p className="text-sm text-gray-500">آرایشگری برای حذف نیست.</p>
          ) : (
            employees
              .filter((emp) => !isSelf(emp))
              .map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border-s-4 border-s-rose-500 bg-slate-100 p-3 dark:bg-gray-700"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-800 dark:text-white">
                      {getEmployeeDisplayName(emp.user)}
                    </p>
                    <p className="text-xs text-gray-500">{emp.skill || "—"}</p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-full p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    onClick={() => handleRemoveEmployee(emp)}
                    aria-label="حذف"
                    disabled={removeEmployeeMutation.isPending}
                  >
                    <FaRegTrashAlt />
                  </button>
                </div>
              ))
          )}
        </div>
      </CustomModal>

      {/* ویرایش — فقط first_name, last_name, skill */}
      <CustomModal
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
          setEditingId(null);
        }}
        title="ویرایش آرایشگر"
      >
        <div className="flex flex-col gap-3">
          <input
            className="primary-input"
            placeholder="نام *"
            value={editFirstName}
            onChange={(e) => setEditFirstName(e.target.value)}
            autoComplete="given-name"
          />

          <input
            className="primary-input"
            placeholder="نام خانوادگی *"
            value={editLastName}
            onChange={(e) => setEditLastName(e.target.value)}
            autoComplete="family-name"
          />

          <textarea
            className="primary-input min-h-[80px]"
            placeholder="مهارت‌ها *"
            value={editSkill}
            onChange={(e) => setEditSkill(e.target.value)}
          />

          <Button
            type="button"
            variant="primary"
            onClick={handleUpdateEmployee}
            disabled={updateEmployeeMutation.isPending}
          >
            {updateEmployeeMutation.isPending ? "در حال ذخیره..." : "بروزرسانی"}
          </Button>
        </div>
      </CustomModal>

      {/* افزودن — EmployeeCreate */}
      <CustomModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          resetAddForm();
        }}
        title="افزودن آرایشگر جدید"
      >
        <div className="flex flex-col gap-3">
          <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
            حساب کاربری جدید برای آرایشگر ساخته می‌شود. نیازی به انتخاب از لیست
            کاربران نیست.
          </p>
          <input
            className="primary-input"
            placeholder="نام *"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
          <input
            className="primary-input"
            placeholder="نام خانوادگی *"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
          <input
            className="primary-input"
            placeholder="موبایل * (09xxxxxxxxx)"
            inputMode="numeric"
            maxLength={11}
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
            }
            autoComplete="tel"
            dir="ltr"
          />
          <input
            className="primary-input"
            type="password"
            placeholder="رمز عبور (اختیاری)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <textarea
            className="primary-input min-h-[80px]"
            placeholder="مهارت‌ها *"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleAddEmployee}
            disabled={addEmployeeMutation.isPending}
          >
            {addEmployeeMutation.isPending ? "در حال ثبت..." : "ثبت آرایشگر"}
          </Button>
        </div>
      </CustomModal>

      {/* Header */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="آرایشگران" />
        <Dropdown
          isAddOpen={isAddOpen}
          setIsAddOpen={(open) => {
            if (open) openAdd();
            else setIsAddOpen(false);
          }}
          isUpdateOpen={isUpdateOpen}
          setIsUpdateOpen={setIsUpdateOpen}
          isDeleteOpen={isDeleteOpen}
          setIsDeleteOpen={setIsDeleteOpen}
        />
      </div>

      {/* Search + status filter */}
      <div className="space-y-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="جستجو نام، موبایل یا مهارت..."
          resultCount={filteredEmployees.length}
          totalCount={employees.length}
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(
            [
              { key: "all", label: "همه" },
              { key: "active", label: "فعال" },
              { key: "inactive", label: "غیرفعال" },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                statusFilter === f.key
                  ? `bg-${themeColor}-500 text-white shadow`
                  : "border border-gray-200 bg-white text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!employees.length ? (
        <EmptyState
          icon={<FaUser />}
          title="آرایشگری ثبت نشده"
          description="اعضای تیم خود را اضافه کنید تا بتوانید سرویس و نوبت‌ها را مدیریت کنید."
          action={{
            label: "افزودن آرایشگر",
            onClick: openAdd,
          }}
        />
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          icon={<FaUser />}
          title="نتیجه‌ای پیدا نشد"
          description="عبارت جستجو یا فیلتر وضعیت را تغییر دهید."
          secondaryAction={{
            label: "پاک کردن فیلترها",
            onClick: () => {
              setSearchQuery("");
              setStatusFilter("all");
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredEmployees.map((employee) => {
            const name = getEmployeeDisplayName(employee.user);
            const phoneLabel = getEmployeePhone(employee.user);
            const active = getEmployeeIsActive(employee.user);
            const owner = getEmployeeIsOwner(employee.user);
            const staff = getEmployeeIsStaff(employee.user);
            const self = isSelf(employee);
            const skillLabel = employee.skill?.trim() || "بدون مهارت ثبت‌شده";
            const image = getEmployeeImage(employee.user);
            const roleLabel = owner ? "مالک" : staff ? "آرایشگر" : "کاربر";
            const imageSrc = image
              ? image.startsWith("http")
                ? image
                : `${API_ORIGIN}${image}`
              : null;

            return (
              <motion.article
                key={employee.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-${themeColor}-400 to-${themeColor}-600`}
                />

                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-${themeColor}-50 ${themeText[themeColor as ThemeColorName]}`}
                  >
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FaUser size={22} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                          {name}
                          {self && (
                            <span className="mr-1 text-xs font-medium text-gray-400">
                              (شما)
                            </span>
                          )}
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">
                          {skillLabel}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          active
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300"
                        }`}
                      >
                        {active ? "فعال" : "غیرفعال"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full bg-${themeColor}-50 px-2.5 py-0.5 text-[11px] font-semibold text-${themeColor}-700`}
                      >
                        {roleLabel}
                      </span>
                      <span
                        className="rounded-full bg-gray-50 px-2.5 py-0.5 text-[11px] text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        dir="ltr"
                      >
                        {phoneLabel}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-gray-50 pt-3 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => openEdit(employee)}
                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-${themeColor}-50 py-2 text-xs font-semibold text-${themeColor}-700`}
                      >
                        <FaPencil size={12} />
                        ویرایش
                      </button>
                      {!self && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEmployee(employee)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-50 py-2 text-xs font-semibold text-rose-600 dark:bg-rose-900/30"
                          disabled={removeEmployeeMutation.isPending}
                        >
                          <FaRegTrashAlt size={12} />
                          حذف
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ManageEmployees;
