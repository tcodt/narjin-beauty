import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { LuCalendarClock, LuStore } from "react-icons/lu";

import Button from "../../components/Button/Button";
import PageTitle from "../../components/PageTitle/PageTitle";
import Dots from "../../components/Dots/Dots";
import PersianDayPicker from "../../components/PersianDayPicker/PersianDayPicker";
import { ThemeColorName, useThemeColor } from "../../context/ThemeColor";
import { useJoinedBusiness } from "../../context/JoinedBusinessContext";
import { useUserType } from "../../context/UserTypeContext";
import { useGetServices } from "../../hooks/services/useGetServices";
import { useGetAvailableTimes } from "../../hooks/slots/useGetAvailableTimes";
import { useAddAppointment } from "../../hooks/appointments/useAddAppointment";
import { getEmployeeLabel, GetEmployeesItem } from "../../types/employees";
import { formatTime, toPersianLabel } from "../../utils/date";
import { isoToJalali, todayIso, toPersianDigits } from "../../utils/jalali";
import { themeText } from "../../utils/themeClasses";
import { parseApiError } from "../../utils/parseApiError";

function toPositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return Math.trunc(n);
  }
  return null;
}

/** YYYY-MM-DD only — what the API expects */
function isIsoDate(value: string | null | undefined): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function employeesFromService(
  service: { employee?: unknown } | null,
): GetEmployeesItem[] {
  if (!service?.employee) return [];
  const raw = service.employee;
  const list = Array.isArray(raw) ? raw : [raw];

  return list
    .map((emp) => {
      if (!emp || typeof emp !== "object") return null;
      const e = emp as Record<string, unknown>;
      const id =
        toPositiveInt(e.id) ??
        toPositiveInt(e.employee_id) ??
        (e.user && typeof e.user === "object"
          ? toPositiveInt((e.user as Record<string, unknown>).id)
          : null);
      if (id == null) return null;
      return {
        id,
        skill: typeof e.skill === "string" ? e.skill : "",
        user: (e.user as GetEmployeesItem["user"]) ?? "آرایشگر",
      } satisfies GetEmployeesItem;
    })
    .filter(Boolean) as GetEmployeesItem[];
}

const formatJalali = (iso: string) => {
  const j = isoToJalali(iso);
  if (!j) return iso;
  return `${toPersianDigits(j.jy)}/${toPersianDigits(
    String(j.jm).padStart(2, "0"),
  )}/${toPersianDigits(String(j.jd).padStart(2, "0"))}`;
};

const Reserve: React.FC = () => {
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [dateValue, setDateValue] = useState<string>(todayIso());
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { themeColor } = useThemeColor();
  const { joinedBusiness, hasJoinedBusiness, isReady } = useJoinedBusiness();
  const { userType } = useUserType();
  const isCustomer = userType !== "owner";
  const randomCode = (joinedBusiness?.random_code ?? "").trim();

  const selectedDate = isIsoDate(dateValue) ? dateValue : null;
  const selectedDatePersian = selectedDate ? formatJalali(selectedDate) : "—";

  const {
    data: services = [],
    isLoading: servicesLoading,
    isError: servicesError,
  } = useGetServices();

  // Only fetch when both date + service are valid — no extra client filters
  const {
    data: availableSlots = [],
    isLoading: slotsLoading,
    isError: slotsError,
    error: slotsErrorObj,
  } = useGetAvailableTimes(selectedDate, serviceId);

  const addAppointmentMutation = useAddAppointment();

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId],
  );

  const employees = useMemo(() => {
    const fromService = employeesFromService(selectedService);
    if (fromService.length) return fromService;

    const map = new Map<number, GetEmployeesItem>();
    availableSlots.forEach((slot) => {
      const empId = toPositiveInt(slot.employee_id);
      if (empId != null) {
        map.set(empId, {
          id: empId,
          skill: "",
          user: slot.employee_name || `کارمند ${empId}`,
        });
      }
    });
    return Array.from(map.values());
  }, [selectedService, availableSlots]);

  useEffect(() => {
    if (employees.length === 1) {
      setEmployeeId(employees[0].id);
    } else if (
      employeeId &&
      employees.length &&
      !employees.some((e) => e.id === employeeId)
    ) {
      setEmployeeId(null);
    }
  }, [employees, employeeId]);

  useEffect(() => {
    setSelectedSlotId(null);
  }, [serviceId, selectedDate]);

  /**
   * Backend GET /business/available-times/?date=&service_id= owns availability.
   * Only drop rows without a real primary key. Sort by start_time for UX.
   */
  const freeSlots = useMemo(() => {
    return availableSlots
      .filter((s) => toPositiveInt(s.id) != null)
      .slice()
      .sort((a, b) =>
        String(a.start_time ?? "").localeCompare(String(b.start_time ?? "")),
      );
  }, [availableSlots]);

  const selectedSlot = useMemo(
    () => freeSlots.find((s) => s.id === selectedSlotId) ?? null,
    [freeSlots, selectedSlotId],
  );

  useEffect(() => {
    const empId = toPositiveInt(selectedSlot?.employee_id);
    if (empId != null) setEmployeeId(empId);
  }, [selectedSlot]);

  if (!isReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Dots />
      </div>
    );
  }

  if (isCustomer && !hasJoinedBusiness) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-12 text-center">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-${themeColor}-50 ${themeText[themeColor as ThemeColorName]}`}
        >
          <LuStore size={28} />
        </div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          ابتدا به یک سالن متصل شوید
        </h2>
        <Button type="button" onClick={() => navigate("/join-salon")}>
          ورود کد کسب‌وکار
        </Button>
      </div>
    );
  }

  const handleBooking = () => {
    if (!serviceId) {
      toast.error("لطفاً سرویس را انتخاب کنید");
      return;
    }

    if (!selectedDate) {
      toast.error("تاریخ معتبر انتخاب نشده است");
      return;
    }

    const slotPk = toPositiveInt(selectedSlotId);
    if (slotPk == null) {
      toast.error("زمان معتبر انتخاب نشده است");
      return;
    }

    if (!selectedSlot || selectedSlot.id !== slotPk) {
      toast.error("اسلات انتخاب‌شده معتبر نیست؛ دوباره زمان را انتخاب کنید");
      setSelectedSlotId(null);
      return;
    }

    const finalEmployeeId =
      toPositiveInt(employeeId) ?? toPositiveInt(selectedSlot.employee_id);

    if (finalEmployeeId == null) {
      toast.error(
        "آرایشگر مشخص نیست. سرویس باید به آرایشگر وصل باشد یا اسلات employee_id داشته باشد.",
      );
      return;
    }

    if (!randomCode) {
      toast.error("کد سالن یافت نشد");
      navigate("/join-salon");
      return;
    }

    addAppointmentMutation.mutate(
      {
        service_id: serviceId,
        employee_id: finalEmployeeId,
        time_slot_id: slotPk,
        random_code: randomCode,
      },
      {
        onSuccess: () => {
          toast.success("رزرو با موفقیت ثبت شد");
          queryClient.invalidateQueries({ queryKey: ["appointments"] });
          queryClient.invalidateQueries({ queryKey: ["available-times"] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          navigate("/appointments-list");
        },
        onError: (error: unknown) => {
          toast.error(parseApiError(error));
        },
      },
    );
  };

  const canSubmit =
    !!serviceId &&
    !!selectedDate &&
    toPositiveInt(selectedSlotId) != null &&
    !!selectedSlot &&
    (toPositiveInt(employeeId) != null ||
      toPositiveInt(selectedSlot.employee_id) != null) &&
    !!randomCode &&
    !addAppointmentMutation.isPending;

  const dateHelper = !serviceId
    ? "ابتدا سرویس را انتخاب کنید."
    : "تاریخ را انتخاب کنید؛ زمان‌های آزاد همان روز از سرور بارگذاری می‌شود.";

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      <PageTitle title="رزرو نوبت" />

      {joinedBusiness && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl bg-${themeColor}-50 px-4 py-3 dark:bg-gray-800`}
        >
          <div className="min-w-0">
            <p className="text-xs text-gray-500">سالن انتخاب‌شده</p>
            <p className="truncate font-semibold text-gray-800 dark:text-white">
              {joinedBusiness.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/join-salon")}
            className={`text-xs font-semibold ${themeText[themeColor as ThemeColorName]}`}
          >
            تغییر سالن
          </button>
        </div>
      )}

      <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            سرویس
          </label>
          <select
            className="primary-input"
            value={serviceId ?? ""}
            disabled={servicesLoading}
            onChange={(e) => {
              const v = Number(e.target.value);
              setServiceId(Number.isFinite(v) && v > 0 ? v : null);
              setEmployeeId(null);
              setSelectedSlotId(null);
            }}
          >
            <option value="">انتخاب سرویس</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.price
                  ? ` — ${Number(s.price).toLocaleString("fa-IR")} تومان`
                  : ""}
              </option>
            ))}
          </select>
          {servicesLoading && (
            <div className="mt-2">
              <Dots />
            </div>
          )}
          {servicesError && (
            <p className="mt-1 text-xs text-red-500">خطا در دریافت خدمات</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            آرایشگر
          </label>
          <select
            className="primary-input"
            value={employeeId ?? ""}
            disabled={!serviceId}
            onChange={(e) => {
              const v = Number(e.target.value);
              setEmployeeId(Number.isFinite(v) && v > 0 ? v : null);
            }}
          >
            <option value="">
              {!serviceId
                ? "ابتدا سرویس را انتخاب کنید"
                : employees.length
                  ? "انتخاب آرایشگر"
                  : "آرایشگر به این سرویس وصل نیست"}
            </option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {getEmployeeLabel(emp)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <PersianDayPicker
            variant="inline"
            label="تاریخ نوبت"
            value={dateValue}
            onChange={(iso) => {
              if (isIsoDate(iso)) {
                setDateValue(iso);
              }
              setSelectedSlotId(null);
            }}
            min={todayIso()}
            helperText={dateHelper}
          />
          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
            شمسی:{" "}
            <b className="text-gray-700 dark:text-gray-200">
              {selectedDatePersian}
            </b>
            {" · "}
            API:{" "}
            <span className="font-mono" dir="ltr">
              {selectedDate || "—"}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base font-semibold text-gray-700 dark:text-gray-200">
            <LuCalendarClock size={22} className="text-emerald-500" />
            زمان‌های آزاد
          </span>
          {selectedDate && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {selectedDatePersian}
            </span>
          )}
        </div>

        {!serviceId && (
          <p className="rounded-xl bg-gray-50 py-6 text-center text-sm text-gray-500 dark:bg-gray-800/60">
            ابتدا یک سرویس انتخاب کنید
          </p>
        )}
        {serviceId && slotsLoading && (
          <div className="py-6">
            <Dots />
          </div>
        )}
        {serviceId && slotsError && (
          <div className="rounded-xl bg-rose-50 py-4 text-center text-sm text-rose-600 dark:bg-rose-950/40">
            <p>خطا در دریافت زمان‌های آزاد</p>
            <p className="mt-1 text-xs opacity-80">
              {parseApiError(slotsErrorObj)}
            </p>
          </div>
        )}
        {serviceId &&
          !slotsLoading &&
          !slotsError &&
          freeSlots.length === 0 && (
            <div className="rounded-xl bg-gray-50 py-6 text-center text-sm text-gray-500 dark:bg-gray-800/60">
              <p>برای «{selectedDatePersian}» زمان آزادی یافت نشد.</p>
              <p className="mt-2 text-xs text-gray-400">
                تاریخ دیگری را امتحان کنید یا بعداً دوباره بررسی کنید.
              </p>
            </div>
          )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {freeSlots.map((slot) => {
            const selected = selectedSlotId === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelectedSlotId(slot.id)}
                className={`rounded-2xl border-2 p-3 text-center transition ${
                  selected
                    ? "border-emerald-600 bg-emerald-200 ring-2 ring-emerald-400 dark:bg-emerald-800/50"
                    : "border-emerald-300 bg-emerald-50 hover:border-emerald-500 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/25"
                }`}
              >
                <span className="mb-1 inline-block rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {selected ? "انتخاب‌شده" : "آزاد"}
                </span>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {formatTime(slot.start_time)}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {toPersianLabel(slot.date ?? selectedDate ?? "")}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={handleBooking}
        disabled={!canSubmit}
      >
        {addAppointmentMutation.isPending ? "در حال ثبت..." : "ثبت رزرو"}
      </Button>
    </div>
  );
};

export default Reserve;
