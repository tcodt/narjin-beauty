import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { LuCalendarClock, LuStore, LuCalendarDays } from "react-icons/lu";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import Button from "../../components/Button/Button";
import PageTitle from "../../components/PageTitle/PageTitle";
import Dots from "../../components/Dots/Dots";
import PersianDayPicker from "../../components/PersianDayPicker/PersianDayPicker";
import { useThemeColor } from "../../context/ThemeColor";
import { useJoinedBusiness } from "../../context/JoinedBusinessContext";
import { useUserType } from "../../context/UserTypeContext";
import { useGetServices } from "../../hooks/services/useGetServices";
import { useGetAvailableTimes } from "../../hooks/slots/useGetAvailableTimes";
import { useAddAppointment } from "../../hooks/appointments/useAddAppointment";
import { getEmployeeLabel, GetEmployeesItem } from "../../types/employees";
import {
  formatTime,
  toGregorianISO,
  toPersianLabel,
  todayPersian,
} from "../../utils/date";

function employeesFromService(
  service: { employee?: unknown } | null,
): GetEmployeesItem[] {
  if (!service?.employee) return [];
  const raw = service.employee;
  const list = Array.isArray(raw) ? raw : [raw];

  return list
    .map((emp, index) => {
      if (!emp || typeof emp !== "object") return null;
      const e = emp as Record<string, unknown>;
      const id =
        typeof e.id === "number"
          ? e.id
          : typeof e.employee_id === "number"
            ? e.employee_id
            : index + 1;
      return {
        id,
        skill: typeof e.skill === "string" ? e.skill : "",
        user: (e.user as GetEmployeesItem["user"]) ?? "آرایشگر",
      } satisfies GetEmployeesItem;
    })
    .filter(Boolean) as GetEmployeesItem[];
}

const Reserve: React.FC = () => {
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [dateValue, setDateValue] = useState<DateObject | null>(todayPersian());
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { themeColor } = useThemeColor();
  const { joinedBusiness, hasJoinedBusiness, isReady } = useJoinedBusiness();
  const { userType } = useUserType();
  const isCustomer = userType !== "owner";
  const randomCode = (joinedBusiness?.random_code ?? "").trim();

  // API = Gregorian | UI = Persian
  const selectedDate = toGregorianISO(dateValue);
  const selectedDatePersian = dateValue ? dateValue.format("YYYY/MM/DD") : "—";

  const {
    data: services = [],
    isLoading: servicesLoading,
    isError: servicesError,
  } = useGetServices();

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
      if (typeof slot.employee_id === "number") {
        map.set(slot.employee_id, {
          id: slot.employee_id,
          skill: "",
          user: slot.employee_name || `کارمند ${slot.employee_id}`,
        });
      }
    });
    return Array.from(map.values());
  }, [selectedService, availableSlots]);

  useEffect(() => {
    if (employees.length === 1) setEmployeeId(employees[0].id);
    else if (
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

  const freeSlots = useMemo(
    () => availableSlots.filter((s) => s.is_available !== false),
    [availableSlots],
  );

  const selectedSlot = useMemo(
    () => freeSlots.find((s) => s.id === selectedSlotId) ?? null,
    [freeSlots, selectedSlotId],
  );

  useEffect(() => {
    if (
      selectedSlot &&
      typeof selectedSlot.employee_id === "number" &&
      selectedSlot.employee_id > 0
    ) {
      setEmployeeId(selectedSlot.employee_id);
    }
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
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-${themeColor}-50 text-${themeColor}-600`}
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
    if (!serviceId || !selectedSlotId) {
      toast.error("لطفاً سرویس و زمان را انتخاب کنید");
      return;
    }
    const finalEmployeeId =
      employeeId ??
      (typeof selectedSlot?.employee_id === "number"
        ? selectedSlot.employee_id
        : null);
    if (!finalEmployeeId) {
      toast.error("آرایشگر مشخص نیست");
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
        time_slot_id: selectedSlotId,
        random_code: randomCode,
      },
      {
        onSuccess: () => {
          toast.success("رزرو با موفقیت ثبت شد");
          queryClient.invalidateQueries({ queryKey: ["appointments"] });
          queryClient.invalidateQueries({ queryKey: ["available-times"] });
          navigate("/appointments-list");
        },
        onError: (error: unknown) => {
          const ax = error as AxiosError<Record<string, unknown>>;
          const data = ax.response?.data;
          let message = "ثبت رزرو ناموفق بود";
          if (data && typeof data === "object") {
            if (typeof data.detail === "string") message = data.detail;
            else {
              const first = Object.values(data).find(
                (v) => Array.isArray(v) && v[0],
              ) as string[] | undefined;
              if (first?.[0]) message = String(first[0]);
            }
          }
          toast.error(message);
        },
      },
    );
  };

  const canSubmit =
    !!serviceId &&
    !!selectedSlotId &&
    !!(
      employeeId ||
      (selectedSlot && typeof selectedSlot.employee_id === "number")
    ) &&
    !!randomCode &&
    !addAppointmentMutation.isPending;

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
            className={`text-xs font-semibold text-${themeColor}-600`}
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
                  : "بعد از انتخاب زمان مشخص می‌شود"}
            </option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {getEmployeeLabel(emp)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            تاریخ نوبت (شمسی)
          </label>
          <PersianDayPicker
            value={dateValue}
            onChange={(val) => {
              setDateValue(val);
              setSelectedSlotId(null);
            }}
            buttonLabel={
              dateValue ? `تاریخ: ${selectedDatePersian}` : "انتخاب تاریخ شمسی"
            }
            buttonIcon={
              <LuCalendarDays size={18} className="text-emerald-600" />
            }
            bgColor="bg-white dark:bg-gray-700"
            textColor="gray-700"
            selectedRed={false}
            minDate={new DateObject({ calendar: persian, locale: persian_fa })}
          />
          <p className="mt-1.5 text-[11px] text-gray-400">
            شمسی: <b>{selectedDatePersian}</b>
            {" · "}
            API:{" "}
            <span className="font-mono" dir="ltr">
              {selectedDate}
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
          {dateValue && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              {selectedDatePersian}
            </span>
          )}
        </div>

        {!serviceId && (
          <p className="rounded-xl bg-gray-50 py-6 text-center text-sm text-gray-500">
            ابتدا یک سرویس انتخاب کنید
          </p>
        )}
        {serviceId && slotsLoading && (
          <div className="py-6">
            <Dots />
          </div>
        )}
        {serviceId && slotsError && (
          <div className="rounded-xl bg-rose-50 py-4 text-center text-sm text-rose-600">
            <p>خطا در دریافت زمان‌های آزاد</p>
            <p className="mt-1 text-xs opacity-80">
              {(slotsErrorObj as Error)?.message || "خطای سرور"}
            </p>
          </div>
        )}
        {serviceId &&
          !slotsLoading &&
          !slotsError &&
          freeSlots.length === 0 && (
            <p className="rounded-xl bg-gray-50 py-6 text-center text-sm text-gray-500">
              برای «{selectedDatePersian}» زمان آزادی ثبت نشده است.
              <br />
              <span className="text-xs text-gray-400">
                سرویس و تاریخ را با زمان ثبت‌شده توسط سالن یکسان کنید.
              </span>
            </p>
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
                <p className="text-lg font-bold text-emerald-700">
                  {formatTime(slot.start_time)}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  {toPersianLabel(slot.date ?? selectedDate)}
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
