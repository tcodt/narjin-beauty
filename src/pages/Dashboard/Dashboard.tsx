import React, { useMemo } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  LuNotebookText,
  LuUsers,
  LuCalendarDays,
  LuWallet,
} from "react-icons/lu";
import {
  MdOutlineBookmarkAdded,
  MdOutlineBookmarkRemove,
  MdOutlineEventAvailable,
  MdPeopleOutline,
  MdWarningAmber,
} from "react-icons/md";
import { GrLineChart } from "react-icons/gr";
import { HiArrowLeft } from "react-icons/hi";
import { GiSandsOfTime } from "react-icons/gi";

import { useGetDashboardToday } from "../../hooks/dashboard/useGetDashboardToday";
import { ThemeColorName, useThemeColor } from "../../context/ThemeColor";
import { useAcl } from "../../context/AclContext";
import {
  DashboardResponse,
  AdminDashboardResponse,
  UserDashboardResponse,
} from "../../types/dashboard";
import Dots from "../../components/Dots/Dots";
import { useGetEmployees } from "../../hooks/employees/useGetEmployees";
import {
  getEmployeeDisplayName,
  getEmployeePhone,
} from "../../types/employees";
import { useBusinessMe } from "../../hooks/business/useBusinessMe";
import {
  themeText,
  themeBgSoft,
  themeBgSolid,
  themeBarFill,
  themeBorder,
} from "../../utils/themeClasses";
import { SalonQrCard } from "../../components/SalonQrCard/SalonQrCard";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const isAdminDashboard = (
  data: DashboardResponse | undefined,
): data is AdminDashboardResponse => data?.type === "admin";

const isUserDashboard = (
  data: DashboardResponse | undefined,
): data is UserDashboardResponse => data?.type === "user";

const formatMoney = (value: number) => `${value.toLocaleString("fa-IR")} تومان`;

const statusMeta = (status: string) => {
  switch (status) {
    case "pending":
      return {
        text: "text-amber-600 dark:text-amber-400",
        chip: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      };
    case "confirmed":
    case "completed":
      return {
        text: "text-emerald-600 dark:text-emerald-400",
        chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      };
    case "cancelled":
    case "canceled":
      return {
        text: "text-rose-600 dark:text-rose-400",
        chip: "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
      };
    default:
      return {
        text: "text-gray-500",
        chip: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
      };
  }
};

/* -------------------------------------------------------------------------- */
/* UI pieces                                                                  */
/* -------------------------------------------------------------------------- */

const StatCard: React.FC<{
  label: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  hint?: string;
}> = ({ label, icon, className = "col-span-full", hint }) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
  >
    <div className="absolute left-3 top-3 opacity-40">{icon}</div>
    <div className="pr-1 text-base font-semibold text-gray-800 dark:text-gray-100">
      {label}
    </div>
    {hint && (
      <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
        {hint}
      </p>
    )}
  </div>
);

const SectionTitle: React.FC<{
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ children, action }) => (
  <div className="col-span-full mt-5 flex items-end justify-between gap-2">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
      {children}
    </h3>
    {action}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Admin (owner)                                                              */
/* -------------------------------------------------------------------------- */

const AdminDashboardView: React.FC<{
  data: AdminDashboardResponse;
  themeColor: ThemeColorName;
}> = ({ data, themeColor }) => {
  const { data: employees, isPending: employeesLoading } = useGetEmployees();
  const { data: business } = useBusinessMe();
  const employeeList = employees ?? [];
  const tc = themeColor;

  const incomeData = useMemo(() => {
    const { today = 0, week = 0, month = 0 } = data.income ?? {};
    const maxIncome = Math.max(today, week, month, 1);
    return [
      { label: "امروز", value: today, height: (today / maxIncome) * 100 },
      { label: "هفته", value: week, height: (week / maxIncome) * 100 },
      { label: "ماه", value: month, height: (month / maxIncome) * 100 },
    ];
  }, [data.income]);

  const pendingCount =
    data.appointments?.filter((a) => a.status === "pending").length ?? 0;

  return (
    <>
      <SalonQrCard
        code={business?.random_code}
        name={business?.name}
        themeColor={tc}
      />

      {/* Income chart */}
      {incomeData.length > 0 && (
        <div className="col-span-full">
          <div className="flex h-64 flex-col justify-end rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:h-72">
            <div className="mb-2 flex items-center gap-2">
              <GrLineChart className={themeText[tc]} size={18} />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                نمودار درآمد
              </span>
            </div>
            <div
              className={`flex h-full w-full flex-row items-end justify-evenly border-b-2 pb-3 ${themeBorder[tc]}`}
            >
              {incomeData.map((bar, i) => (
                <div
                  key={bar.label}
                  className="flex h-full w-1/5 flex-col items-center justify-end"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(bar.height, 2)}%` }}
                    transition={{ duration: 0.7, delay: i * 0.12 }}
                    className={`min-h-[4px] w-7 rounded-t-2xl ${themeBarFill[tc]}`}
                  />
                  <span className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-200">
                    {bar.label}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {formatMoney(bar.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <StatCard
        className="col-span-4 sm:col-span-3"
        icon={<LuNotebookText size={22} className={themeText[tc]} />}
        label={
          <>
            {data.total_appointments}{" "}
            <span className="text-sm font-normal text-gray-500">رزرو</span>
          </>
        }
      />
      <StatCard
        className="col-span-4 sm:col-span-5"
        icon={
          data.today_appointments > 0 ? (
            <MdOutlineBookmarkAdded size={22} className={themeText[tc]} />
          ) : (
            <MdOutlineBookmarkRemove size={22} className={themeText[tc]} />
          )
        }
        label={
          <>
            امروز{" "}
            <span className="text-sm font-normal text-gray-500">
              {data.today_appointments} رزرو
            </span>
          </>
        }
      />
      <StatCard
        className="col-span-4"
        icon={<MdPeopleOutline size={22} className={themeText[tc]} />}
        label={
          <>
            {employeeList.length}{" "}
            <span className="text-sm font-normal text-gray-500">آرایشگر</span>
          </>
        }
      />

      {pendingCount > 0 && (
        <Link
          to="/manage-appointments"
          className="col-span-full flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 transition hover:opacity-90 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
        >
          <span>{pendingCount} نوبت در انتظار تأیید شماست</span>
          <HiArrowLeft size={16} />
        </Link>
      )}

      {/* Income numbers */}
      <div className="relative col-span-full grid grid-cols-12 gap-2 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="absolute left-3 top-3 opacity-40">
          <LuWallet size={22} className={themeText[tc]} />
        </div>
        <span className="col-span-full text-base font-bold text-gray-800 dark:text-gray-100">
          درآمد
        </span>
        {(
          [
            ["ماه", data.income?.month],
            ["هفته", data.income?.week],
            ["امروز", data.income?.today],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="col-span-4">
            <p className="text-[11px] text-gray-400">{label}</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {formatMoney(value ?? 0)}
            </p>
          </div>
        ))}
      </div>

      {/* Recent appointments */}
      <SectionTitle
        action={
          <Link
            to="/manage-appointments"
            className={`text-sm font-semibold ${themeText[tc]} hover:opacity-70`}
          >
            همه رزروها
          </Link>
        }
      >
        رزروهای اخیر
      </SectionTitle>

      {(data.total_appointments ?? 0) < 1 && (
        <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white py-8 text-center dark:border-gray-600 dark:bg-gray-800">
          <p className="text-sm text-gray-500">هنوز رزروی ثبت نشده است.</p>
        </div>
      )}

      {data.appointments?.slice(0, 8).map((appointment) => {
        const meta = statusMeta(appointment.status);
        return (
          <Link
            key={appointment.id}
            to="/manage-appointments"
            className="col-span-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                {appointment.service?.name ?? "سرویس"}
              </h4>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${meta.chip}`}
              >
                {appointment.get_status || appointment.status}
              </span>
            </div>
            {appointment.employee_name && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {appointment.employee_name}
              </p>
            )}
          </Link>
        );
      })}

      {/* Employees */}
      <SectionTitle
        action={
          <Link
            to="/manage-employees"
            className={`inline-flex items-center gap-1 text-sm font-semibold ${themeText[tc]} hover:opacity-70`}
          >
            مدیریت
            <HiArrowLeft size={14} />
          </Link>
        }
      >
        آرایشگران سالن
      </SectionTitle>

      {employeesLoading && (
        <div className="col-span-full py-4 text-center text-sm text-gray-500">
          در حال بارگذاری...
        </div>
      )}

      {!employeesLoading && employeeList.length === 0 && (
        <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center dark:border-gray-600 dark:bg-gray-800">
          <LuUsers className="mx-auto text-gray-300" size={36} />
          <p className="mt-2 text-sm text-gray-500">هنوز آرایشگری اضافه نشده</p>
          <Link
            to="/manage-employees"
            className={`mt-3 inline-block text-sm font-semibold ${themeText[tc]}`}
          >
            افزودن آرایشگر
          </Link>
        </div>
      )}

      {employeeList.slice(0, 6).map((emp) => (
        <div
          key={emp.id}
          className="col-span-full flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:col-span-6"
        >
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
              {getEmployeeDisplayName(emp.user)}
            </h4>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {emp.skill?.trim() || "بدون مهارت"}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400" dir="ltr">
              {getEmployeePhone(emp.user)}
            </p>
          </div>
          <Link
            to="/manage-employees"
            className={`shrink-0 text-xs font-semibold ${themeText[tc]}`}
          >
            جزئیات
          </Link>
        </div>
      ))}

      {/* Quick actions */}
      <div className="col-span-full mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          {
            to: "/manage-services",
            label: "خدمات",
            icon: <LuNotebookText size={16} />,
          },
          {
            to: "/manage-employees",
            label: "آرایشگران",
            icon: <LuUsers size={16} />,
          },
          {
            to: "/available-times",
            label: "زمان‌ها",
            icon: <LuCalendarDays size={16} />,
          },
          {
            to: "/manage-appointments",
            label: "رزروها",
            icon: <MdOutlineEventAvailable size={16} />,
          },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-3 text-center text-sm font-semibold text-white transition hover:opacity-90 ${themeBgSolid[tc]}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Customer                                                                   */
/* -------------------------------------------------------------------------- */

const UserDashboardView: React.FC<{
  data: UserDashboardResponse;
  themeColor: ThemeColorName;
}> = ({ data, themeColor }) => {
  const next = data.next_appointment;
  const tc = themeColor;

  return (
    <>
      {data.unpaid_reminder && (
        <div className="col-span-full flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/30">
          <MdWarningAmber
            size={22}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              پرداخت ناقص
            </p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              یک یا چند رزرو هنوز پرداخت نشده است.
            </p>
            <Link
              to="/wallet"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-800 underline dark:text-amber-200"
            >
              کیف پول <HiArrowLeft size={14} />
            </Link>
          </div>
        </div>
      )}

      {next ? (
        <Link
          to={`/view-appointment/${next.id}`}
          className={`col-span-full block rounded-2xl p-5 text-white shadow-lg transition hover:opacity-95 ${themeBgSolid[tc]}`}
        >
          <div className="mb-2 flex items-center gap-2 text-white/90">
            <MdOutlineEventAvailable size={20} />
            <span className="text-sm font-medium">نوبت بعدی</span>
          </div>
          <h4 className="text-xl font-bold">{next.service?.name ?? "سرویس"}</h4>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/90">
            {next.employee_name && <span>{next.employee_name}</span>}
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
              {next.get_status || next.status}
            </span>
          </div>
          {next.status === "pending" && (
            <p className="mt-2 text-xs text-white/80">
              در انتظار تأیید سالن — بعد از تأیید، وضعیت به «تأیید شده» تغییر
              می‌کند.
            </p>
          )}
        </Link>
      ) : (
        <div className="col-span-full rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="font-medium text-gray-600 dark:text-gray-300">
            نوبت فعالی ندارید
          </p>
          <Link
            to="/reserve"
            className={`mt-3 inline-block rounded-full px-5 py-2.5 text-sm font-semibold text-white ${themeBgSolid[tc]}`}
          >
            رزرو نوبت جدید
          </Link>
        </div>
      )}

      <StatCard
        className="col-span-full"
        icon={<LuNotebookText size={22} className={themeText[tc]} />}
        label={
          <>
            مجموع رزروها:{" "}
            <span className="text-gray-500">{data.total_appointments}</span>
          </>
        }
      />

      <SectionTitle
        action={
          <Link
            to="/appointments-list"
            className={`text-sm font-semibold ${themeText[tc]} hover:opacity-70`}
          >
            همه رزروها
          </Link>
        }
      >
        آخرین رزروها
      </SectionTitle>

      {!data.last_appointments?.length && (
        <div className="col-span-full py-6 text-center text-sm text-gray-500">
          هنوز رزروی ثبت نکرده‌اید.
        </div>
      )}

      {data.last_appointments?.map((appointment) => {
        const meta = statusMeta(appointment.status);
        return (
          <Link
            key={appointment.id}
            to={`/view-appointment/${appointment.id}`}
            className="col-span-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                {appointment.service?.name ?? "سرویس"}
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${meta.chip}`}
              >
                {appointment.get_status || appointment.status}
              </span>
            </div>
            {appointment.employee_name && (
              <p className="mt-1 text-xs text-gray-500">
                {appointment.employee_name}
              </p>
            )}
          </Link>
        );
      })}
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Owner fallback                                                             */
/* -------------------------------------------------------------------------- */

const OwnerLimitedDashboard: React.FC<{ themeColor: ThemeColorName }> = ({
  themeColor,
}) => {
  const { data: business } = useBusinessMe();
  const tc = themeColor;

  return (
    <div className="col-span-full space-y-4">
      <SalonQrCard
        code={business?.random_code}
        name={business?.name}
        themeColor={tc}
      />

      <div
        className={`rounded-2xl border border-gray-100 p-5 shadow-sm dark:border-gray-700 ${themeBgSoft[tc]}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${themeBgSoft[tc]} ${themeText[tc]}`}
          >
            <span className="animate-spin text-lg">
              <GiSandsOfTime />
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-white">
              گزارش‌های کامل در حال آماده‌سازی است
            </p>
            <p className="mt-1.5 text-sm leading-6 text-gray-600 dark:text-gray-300">
              پنل مدیریت فعال است. فعلاً از میانبرهای زیر سالن را مدیریت کنید.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { to: "/manage-employees", label: "آرایشگران" },
          { to: "/manage-services", label: "خدمات" },
          { to: "/available-times", label: "زمان‌ها" },
          { to: "/manage-appointments", label: "رزروها" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="rounded-xl border border-gray-100 bg-white p-4 text-center text-sm font-medium text-gray-700 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const Dashboard: React.FC = () => {
  const {
    data: dashboardData,
    error,
    isError,
    isPending,
    isFetching,
  } = useGetDashboardToday();
  const { themeColor } = useThemeColor();
  const {
    role,
    isLoading: aclLoading,
    isBusinessOwner,
    isOwner,
    isSuperuser,
  } = useAcl();

  if (isPending || aclLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Dots />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="font-medium text-rose-500">خطا در دریافت داشبورد</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {(error as Error)?.message ?? "لطفاً دوباره تلاش کنید."}
        </p>
      </div>
    );
  }

  const isOwnerClient =
    isBusinessOwner || isOwner || isSuperuser || role === "admin";

  const apiIsAdmin = isAdminDashboard(dashboardData);
  const apiIsUser = isUserDashboard(dashboardData);

  const showAdminFull = isOwnerClient && apiIsAdmin;
  const showAdminLimited = isOwnerClient && !apiIsAdmin;
  const showUser = !isOwnerClient && apiIsUser;

  return (
    <div className="relative pb-8">
      {isFetching && !isPending && (
        <div
          className={`absolute left-0 right-0 top-0 h-0.5 animate-pulse opacity-50 ${themeBarFill[themeColor]}`}
        />
      )}

      <motion.div
        className="grid grid-cols-12 gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h3 className="col-span-full mt-2 text-xl font-bold text-gray-900 dark:text-white">
          {isOwnerClient ? "گزارشات کسب‌وکار" : "داشبورد من"}
        </h3>

        {showAdminFull && (
          <AdminDashboardView
            data={dashboardData as AdminDashboardResponse}
            themeColor={themeColor}
          />
        )}

        {showAdminLimited && <OwnerLimitedDashboard themeColor={themeColor} />}

        {showUser && (
          <UserDashboardView
            data={dashboardData as UserDashboardResponse}
            themeColor={themeColor}
          />
        )}

        {!showAdminFull && !showAdminLimited && !showUser && (
          <div className="col-span-full py-10 text-center text-gray-500">
            داده‌ای برای نمایش وجود ندارد.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
