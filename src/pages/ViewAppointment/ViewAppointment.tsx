import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Loading from "../../components/Loading/Loading";
import { LuAlarmClock, LuDownload, LuArrowRight } from "react-icons/lu";
import { FiUser } from "react-icons/fi";
import { MdAttachMoney } from "react-icons/md";
import { RiScissors2Line } from "react-icons/ri";
import { TbDeviceMobile } from "react-icons/tb";
import { BsTelephone } from "react-icons/bs";
import { useAppointmentById } from "../../hooks/appointments/useAppointmentById";
import { ThemeColorName, useThemeColor } from "../../context/ThemeColor";
import Button from "../../components/Button/Button";
import CustomModal from "../../components/CustomModal/CustomModal";
import { useWallet } from "../../context/WalletContext";
import {
  getEmployeeDisplayName,
  getEmployeePhone,
} from "../../types/employees";
import { themeGradientBar, themeText } from "../../utils/themeClasses";

const statusStyles = (status?: string) => {
  switch (status) {
    case "pending":
      return {
        dot: "bg-amber-500",
        text: "text-amber-600 dark:text-amber-400",
        chip: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      };
    case "canceled":
      return {
        dot: "bg-rose-500",
        text: "text-rose-600",
        chip: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
      };
    case "confirmed":
    case "completed":
      return {
        dot: "bg-emerald-500",
        text: "text-emerald-600",
        chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      };
    default:
      return {
        dot: "bg-gray-400",
        text: "text-gray-500",
        chip: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
      };
  }
};

const Row: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200">
      {icon}
      {label}
    </span>
    <span className="text-left text-gray-500 dark:text-gray-400">
      {value ?? "—"}
    </span>
  </div>
);

const ViewAppointment: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const { id } = useParams<{ id: string }>();
  const appointmentId = Number(id);
  const {
    data: appointmentData,
    isPending,
    isError,
  } = useAppointmentById(appointmentId);
  const { themeColor } = useThemeColor();
  const { spend, balance } = useWallet();
  const navigate = useNavigate();

  if (isPending) return <Loading />;

  if (isError || !appointmentData) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <p className="text-gray-600 dark:text-gray-300">نوبت یافت نشد.</p>
        <Button type="button" onClick={() => navigate(-1)}>
          بازگشت
        </Button>
      </div>
    );
  }

  const styles = statusStyles(appointmentData.status);
  const employeeUser = appointmentData.employee?.user;
  const employeeName = getEmployeeDisplayName(employeeUser as never);
  const employeePhone = getEmployeePhone(employeeUser as never);
  const skill = appointmentData.employee?.skill || "—";
  const business = appointmentData.service?.business;
  const price = Number(appointmentData.service?.price ?? 0);

  const downloadReceipt = () => {
    const lines = [
      "رسید نوبت",
      "-----------------------------",
      `سرویس: ${appointmentData.service?.name ?? ""}`,
      `توضیحات: ${appointmentData.service?.description ?? ""}`,
      `مدت زمان: ${appointmentData.service?.duration ?? ""}`,
      `قیمت: ${appointmentData.service?.price ?? ""} تومان`,
      "",
      `آرایشگر: ${employeeName}`,
      `مهارت: ${skill}`,
      `موبایل آرایشگر: ${employeePhone}`,
      "",
      `سالن: ${business?.name ?? ""}`,
      `آدرس: ${business?.address ?? ""}`,
      `موبایل سالن: ${business?.phone_number ?? ""}`,
      `تلفن سالن: ${business?.telephone_number ?? ""}`,
      "",
      `وضعیت: ${appointmentData.get_status ?? appointmentData.status}`,
      "-----------------------------",
      "با تشکر از انتخاب شما",
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointment-${appointmentData.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400"
      >
        <LuArrowRight size={16} />
        بازگشت
      </button>

      {/* Hero card */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div
          className={`bg-gradient-to-l ${themeGradientBar[themeColor]} to-${themeColor}-500 px-5 py-5 text-white`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-white/80">جزئیات نوبت</p>
              <h1 className="mt-1 text-xl font-bold">
                {appointmentData.service?.name || "سرویس"}
              </h1>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${styles.chip}`}
            >
              {appointmentData.get_status || appointmentData.status}
            </span>
          </div>
          {appointmentData.service?.description && (
            <p className="mt-2 text-sm leading-6 text-white/90">
              {appointmentData.service.description}
            </p>
          )}
        </div>

        <div className="space-y-4 p-5">
          <Row
            icon={<LuAlarmClock className={`text-lg text-${themeColor}-500`} />}
            label="مدت زمان"
            value={appointmentData.service?.duration}
          />
          <Row
            icon={
              <MdAttachMoney className={`text-lg text-${themeColor}-500`} />
            }
            label="قیمت"
            value={
              price
                ? `${price.toLocaleString("fa-IR")} تومان`
                : appointmentData.service?.price
            }
          />
        </div>
      </div>

      {/* Employee */}
      <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-sm font-bold text-gray-800 dark:text-white">
          آرایشگر
        </h2>
        <Row
          icon={<FiUser className={`text-lg text-${themeColor}-500`} />}
          label="نام"
          value={employeeName}
        />
        <Row
          icon={
            <RiScissors2Line className={`text-lg text-${themeColor}-500`} />
          }
          label="مهارت"
          value={skill}
        />
        <Row
          icon={<TbDeviceMobile className={`text-lg text-${themeColor}-500`} />}
          label="موبایل"
          value={<span dir="ltr">{employeePhone}</span>}
        />
      </div>

      {/* Business */}
      <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-sm font-bold text-gray-800 dark:text-white">
          {business?.name || "سالن"}
        </h2>
        {business?.address && (
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            {business.address}
          </p>
        )}
        <Row
          icon={<TbDeviceMobile className={`text-lg text-${themeColor}-500`} />}
          label="موبایل"
          value={<span dir="ltr">{business?.phone_number || "—"}</span>}
        />
        <Row
          icon={<BsTelephone className={`text-lg text-${themeColor}-500`} />}
          label="تلفن"
          value={<span dir="ltr">{business?.telephone_number || "—"}</span>}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={appointmentData.status === "canceled"}
        >
          تکمیل پرداخت
        </Button>
        <button
          type="button"
          onClick={downloadReceipt}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
        >
          <LuDownload size={18} />
          دانلود رسید
        </button>
      </div>

      <CustomModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsDone(false);
        }}
        title="تکمیل پرداخت"
      >
        <div className="space-y-6">
          {isDone ? (
            <div className="text-center">
              <img
                src="/images/tick-payment.png"
                alt=""
                className="mx-auto h-48 w-48 object-contain"
              />
              <p className="mt-2 font-semibold text-gray-800 dark:text-white">
                پرداخت با موفقیت انجام شد
              </p>
              <Link
                to="/appointments-list"
                className={`mt-3 inline-block text-sm font-semibold ${themeText[themeColor as ThemeColorName]} underline`}
              >
                لیست نوبت‌ها
              </Link>
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  موجودی کیف پول:{" "}
                  <span
                    className={
                      price > balance
                        ? "font-bold text-rose-500"
                        : "font-bold text-emerald-600"
                    }
                  >
                    {balance.toLocaleString("fa-IR")} تومان
                  </span>
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  مبلغ نوبت:{" "}
                  <span className="font-bold">
                    {price.toLocaleString("fa-IR")} تومان
                  </span>
                </p>
              </div>
              <Button
                type="button"
                disabled={price > balance}
                onClick={() => {
                  spend(price);
                  setIsDone(true);
                }}
              >
                اتمام پرداخت
              </Button>
              {price > balance && (
                <Button type="button" onClick={() => navigate("/wallet")}>
                  شارژ کیف پول
                </Button>
              )}
            </>
          )}
        </div>
      </CustomModal>
    </div>
  );
};

export default ViewAppointment;
