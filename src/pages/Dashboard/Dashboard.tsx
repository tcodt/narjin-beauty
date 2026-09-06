import React, { useMemo } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { LuNotebookText } from "react-icons/lu";
import {
  MdOutlineBookmarkAdded,
  MdOutlineBookmarkRemove,
  MdOutlineEventAvailable,
  MdPeopleOutline,
  MdWarningAmber,
} from "react-icons/md";
import { GrLineChart } from "react-icons/gr";
import { HiArrowLeft } from "react-icons/hi";

import { useGetDashboardToday } from "../../hooks/dashboard/useGetDashboardToday";
import { ThemeColorName, useThemeColor } from "../../context/ThemeColor";
import { useAcl } from "../../context/AclContext";
import {
  DashboardResponse,
  AdminDashboardResponse,
  UserDashboardResponse,
} from "../../types/dashboard";
import Dots from "../../components/Dots/Dots";
import { GiSandsOfTime } from "react-icons/gi";
import { useGetEmployees } from "../../hooks/employees/useGetEmployees";
import {
  getEmployeeDisplayName,
  getEmployeePhone,
} from "../../types/employees";
import { themeText } from "../../utils/themeClasses";

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

const statusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "text-yellow-500";
    case "confirmed":
      return "text-green-500";
    case "cancelled":
    case "canceled":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

/* -------------------------------------------------------------------------- */
/* Small UI pieces                                                            */
/* -------------------------------------------------------------------------- */

const StatCard: React.FC<{
  label: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
}> = ({ label, icon, className = "col-span-full" }) => (
  <div
    className={`p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm relative overflow-hidden ${className}`}
  >
    <div className="absolute top-2 left-2 opacity-50">{icon}</div>
    <div className="text-base font-medium text-gray-700 dark:text-gray-200">
      {label}
    </div>
  </div>
);

const SectionTitle: React.FC<{
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ children, action }) => (
  <div className="col-span-full mt-4 flex items-end justify-between">
    <h3 className="primary-title dark:text-white">{children}</h3>
    {action}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Admin (business owner) view                                                */
/* -------------------------------------------------------------------------- */

const AdminDashboardView: React.FC<{
  data: AdminDashboardResponse;
  themeColor: string;
}> = ({ data, themeColor }) => {
  const { data: employees, isPending: employeesLoading } = useGetEmployees();

  const incomeData = useMemo(() => {
    const { today = 0, week = 0, month = 0 } = data.income ?? {};
    const maxIncome = Math.max(today, week, month, 1);
    return [
      { label: "امروز", value: today, height: (today / maxIncome) * 100 },
      { label: "هفته", value: week, height: (week / maxIncome) * 100 },
      { label: "ماه", value: month, height: (month / maxIncome) * 100 },
    ];
  }, [data.income]);

  const employeeList = employees ?? [];

  return (
    <>
      {/* Income chart — same as before */}
      {incomeData.length > 0 && (
        <div className="col-span-full">
          <div className="flex h-72 flex-col justify-end rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-700">
            <div
              className={`flex h-full w-full flex-row items-end justify-evenly border-b-2 border-${themeColor}-500 pb-4`}
            >
              {incomeData.map((bar, i) => (
                <div
                  key={bar.label}
                  className="flex h-full w-1/6 flex-col items-center justify-end"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${bar.height}%` }}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                    className={`min-h-[4px] w-6 rounded-t-2xl bg-${themeColor}-500`}
                  />
                  <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {bar.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatMoney(bar.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <StatCard
        className="col-span-3"
        icon={<LuNotebookText size={25} className={`text-${themeColor}-500`} />}
        label={
          <>
            {data.total_appointments}{" "}
            <span className="text-gray-500 dark:text-gray-300">رزرو</span>
          </>
        }
      />

      <StatCard
        className="col-span-5"
        icon={
          data.today_appointments > 0 ? (
            <MdOutlineBookmarkAdded
              size={25}
              className={`text-${themeColor}-500`}
            />
          ) : (
            <MdOutlineBookmarkRemove
              size={25}
              className={`text-${themeColor}-500`}
            />
          )
        }
        label={
          <>
            امروز{" "}
            <span className="text-gray-500 dark:text-gray-300">
              {data.today_appointments}
            </span>{" "}
            رزرو
          </>
        }
      />

      <StatCard
        className="col-span-4"
        icon={
          <MdPeopleOutline size={25} className={`text-${themeColor}-500`} />
        }
        label={
          <>
            {employeeList.length}{" "}
            <span className="text-gray-500 dark:text-gray-300">آرایشگر</span>
          </>
        }
      />

      {/* Income numbers */}
      <div className="relative col-span-full grid grid-cols-12 gap-2 overflow-hidden rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-700">
        <div className="absolute left-0 top-2 opacity-50">
          <GrLineChart size={25} className={`text-${themeColor}-500`} />
        </div>
        <span className="col-span-full text-lg font-semibold text-gray-800 dark:text-gray-100">
          درآمد
        </span>
        {(
          [
            ["ماه", data.income?.month],
            ["هفته", data.income?.week],
            ["امروز", data.income?.today],
          ] as const
        ).map(([label, value]) => (
          <span
            key={label}
            className="col-span-4 text-base font-medium text-gray-700 dark:text-gray-300"
          >
            {label}:{" "}
            <span className="text-gray-500 dark:text-gray-200">
              {formatMoney(value ?? 0)}
            </span>
          </span>
        ))}
      </div>

      {/* Recent appointments */}
      <SectionTitle
        action={
          <Link
            to="/manage-appointments"
            className={`text-sm font-medium text-${themeColor}-500 hover:opacity-70`}
          >
            همه رزروها
          </Link>
        }
      >
        رزروهای اخیر
      </SectionTitle>

      {(data.total_appointments ?? 0) < 1 && (
        <div className="col-span-full py-6 text-center">
          <p className="text-base font-medium text-gray-500 dark:text-gray-400">
            هنوز رزروی برای سالن شما ثبت نشده است.
          </p>
        </div>
      )}

      {data.appointments?.map((appointment) => (
        <Link
          key={appointment.id}
          // to={`/view-appointment/${appointment.id}`}
          to="/manage-appointments"
          className="col-span-full rounded-2xl bg-white p-4 shadow-sm transition hover:opacity-80 dark:bg-gray-700"
        >
          <h4 className="flex items-center justify-between gap-2 text-base font-semibold text-gray-700 dark:text-gray-300">
            <span>{appointment.service?.name ?? "سرویس"}</span>
            <span
              className={`${statusColor(appointment.status)} shrink-0 text-sm font-medium`}
            >
              {appointment.get_status}
            </span>
          </h4>
          {appointment.employee_name && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {appointment.employee_name}
            </p>
          )}
        </Link>
      ))}

      {/* Employees — NOT all platform users */}
      <SectionTitle
        action={
          <Link
            to="/manage-employees"
            className={`inline-flex items-center gap-1 text-sm font-medium text-${themeColor}-500 hover:opacity-70`}
          >
            مدیریت آرایشگران
            <HiArrowLeft size={14} />
          </Link>
        }
      >
        آرایشگران سالن
      </SectionTitle>

      {employeesLoading && (
        <div className="col-span-full py-4 text-center text-sm text-gray-500">
          در حال بارگذاری آرایشگران...
        </div>
      )}

      {!employeesLoading && employeeList.length === 0 && (
        <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center dark:border-gray-600 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            هنوز آرایشگری اضافه نکرده‌اید.
          </p>
          <Link
            to="/manage-employees"
            className={`mt-3 inline-block text-sm font-semibold ${themeText[themeColor as ThemeColorName]}`}
          >
            افزودن آرایشگر
          </Link>
        </div>
      )}

      {employeeList.slice(0, 6).map((emp) => (
        <div
          key={emp.id}
          className="col-span-full flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-700 sm:col-span-6"
        >
          <div className="min-w-0">
            <h4 className="truncate text-base font-semibold text-gray-800 dark:text-gray-100">
              {getEmployeeDisplayName(emp.user)}
            </h4>
            <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
              {emp.skill?.trim() || "بدون مهارت ثبت‌شده"}
            </p>
            <p className="mt-0.5 text-xs text-gray-400" dir="ltr">
              {getEmployeePhone(emp.user)}
            </p>
          </div>
          <Link
            to="/manage-employees"
            className={`shrink-0 text-xs font-medium ${themeText[themeColor as ThemeColorName]}`}
          >
            جزئیات
          </Link>
        </div>
      ))}

      {/* Quick actions */}
      <div className="col-span-full mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { to: "/manage-services", label: "خدمات" },
          { to: "/manage-employees", label: "آرایشگران" },
          { to: "/available-times", label: "زمان‌ها" },
          { to: "/manage-appointments", label: "رزروها" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`rounded-xl bg-${themeColor}-50 py-3 text-center text-sm font-medium text-${themeColor}-700 transition hover:opacity-80 dark:bg-gray-800 dark:text-${themeColor}-300`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* User (customer) view                                                       */
/* -------------------------------------------------------------------------- */

const UserDashboardView: React.FC<{
  data: UserDashboardResponse;
  themeColor: string;
}> = ({ data, themeColor }) => {
  const next = data.next_appointment;

  return (
    <>
      {/* Unpaid reminder */}
      {data.unpaid_reminder && (
        <div className="col-span-full flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
          <MdWarningAmber
            size={24}
            className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
          />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              پرداخت ناقص
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              یک یا چند رزرو شما هنوز پرداخت نشده است. از بخش کیف پول یا جزئیات
              رزرو اقدام کنید.
            </p>
            <Link
              to="/wallet"
              className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-800 dark:text-amber-200 hover:underline"
            >
              رفتن به کیف پول
              <HiArrowLeft size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Next appointment highlight */}
      {next ? (
        <Link
          to={`/view-appointment/${next.id}`}
          className={`col-span-full block p-5 rounded-2xl bg-gradient-to-br from-${themeColor}-500 to-${themeColor}-600 text-white shadow-lg hover:opacity-95 transition`}
        >
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <MdOutlineEventAvailable size={22} />
            <span className="text-sm font-medium">نوبت بعدی شما</span>
          </div>
          <h4 className="text-xl font-bold">{next.service?.name ?? "سرویس"}</h4>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/90">
            {next.employee_name && <span>{next.employee_name}</span>}
            <span
              className={`px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium`}
            >
              {next.get_status}
            </span>
          </div>
        </Link>
      ) : (
        <div className="col-span-full p-6 rounded-2xl bg-white dark:bg-gray-700 shadow-sm text-center">
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            نوبت فعالی ندارید
          </p>
          <Link
            to="/reserve"
            className={`inline-block mt-3 px-5 py-2.5 rounded-full bg-${themeColor}-500 text-white text-sm font-medium hover:opacity-90 transition`}
          >
            رزرو نوبت جدید
          </Link>
        </div>
      )}

      {/* Total bookings */}
      <StatCard
        className="col-span-full"
        icon={<LuNotebookText size={25} className={`text-${themeColor}-500`} />}
        label={
          <>
            مجموع رزروها:{" "}
            <span className="text-gray-500 dark:text-gray-300">
              {data.total_appointments}
            </span>
          </>
        }
      />

      {/* Last appointments */}
      <SectionTitle
        action={
          <Link
            to="/appointments-list"
            className={`text-sm font-medium text-${themeColor}-500 hover:opacity-70 transition-opacity`}
          >
            همه رزروها
          </Link>
        }
      >
        آخرین رزروها
      </SectionTitle>

      {!data.last_appointments?.length && (
        <div className="col-span-full py-6 text-center">
          <p className="text-base font-medium text-gray-500 dark:text-gray-400">
            هنوز رزروی ثبت نکرده‌اید.
          </p>
        </div>
      )}

      {data.last_appointments?.map((appointment) => (
        <Link
          key={appointment.id}
          to={`/view-appointment/${appointment.id}`}
          className="hover:opacity-70 transition-opacity p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm col-span-full"
        >
          <h4 className="text-base text-gray-700 dark:text-gray-300 font-semibold flex items-center justify-between gap-2">
            <span>{appointment.service?.name ?? "سرویس"}</span>
            <span
              className={`${statusColor(appointment.status)} text-sm font-medium shrink-0`}
            >
              {appointment.get_status}
            </span>
          </h4>
          {appointment.employee_name && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {appointment.employee_name}
            </p>
          )}
        </Link>
      ))}
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Owner fallback when API still returns type: "user"                          */
/* -------------------------------------------------------------------------- */

const OwnerLimitedDashboard: React.FC<{ themeColor: string }> = ({
  themeColor,
}) => (
  <div className="col-span-full space-y-4">
    <div
      className={`rounded-2xl border border-${themeColor}-100 bg-gradient-to-l from-${themeColor}-50 to-white p-5 shadow-sm dark:border-gray-600 dark:from-gray-800 dark:to-gray-700`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-${themeColor}-100 ${themeText[themeColor as ThemeColorName]} dark:bg-${themeColor}-900/40`}
        >
          <span className="text-lg animate-spin duration-1000 delay-1000">
            <GiSandsOfTime />
          </span>
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-white">
            گزارش‌های کامل در حال آماده‌سازی است
          </p>
          <p className="mt-1.5 text-sm leading-6 text-gray-600 dark:text-gray-300">
            پنل مدیریت سالن شما فعال است. آمار درآمد و خلاصه رزروها به‌زودی در
            همین صفحه نمایش داده می‌شود. فعلاً از میانبرهای زیر کسب‌وکارتان را
            مدیریت کنید.
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { to: "/manage-employees", label: "آرایشگران" },
        { to: "/manage-services", label: "خدمات" },
        { to: "/available-times", label: "زمان‌ها" },
        { to: "/appointments-list", label: "رزروها" },
      ].map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`rounded-xl bg-white p-4 text-center text-sm font-medium text-gray-700 shadow-sm transition hover:shadow-md dark:bg-gray-800 dark:text-gray-200 hover:${themeText[themeColor as ThemeColorName]}`}
        >
          {item.label}
        </Link>
      ))}
      <Link
        to="/user-profile"
        className={`col-span-2 rounded-xl border border-dashed border-${themeColor}-200 bg-white p-4 text-center text-sm font-medium ${themeText[themeColor as ThemeColorName]} shadow-sm dark:border-gray-600 dark:bg-gray-800 sm:col-span-4`}
      >
        پروفایل و کد آرایشگاه
      </Link>
    </div>
  </div>
);

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

  // Optional extra signals if ACL not fully updated yet:
  // import { useUserType } from "../../context/UserTypeContext";
  // import { useBusinessMe } from "../../hooks/business/useBusinessMe";
  // const { userType } = useUserType();
  // const { isSuccess: hasBusiness } = useBusinessMe();

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
        <p className="font-medium text-red-500">خطا در دریافت داشبورد</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {(error as Error)?.message ?? "لطفاً دوباره تلاش کنید."}
        </p>
      </div>
    );
  }

  /**
   * Client-side owner detection.
   * Do NOT rely only on dashboardData.type — backend often returns "user"
   * while the account already has a business / owner flow.
   */
  const isOwnerClient =
    isBusinessOwner || isOwner || isSuperuser || role === "admin";
  // || userType === "owner"
  // || hasBusiness

  const apiIsAdmin = isAdminDashboard(dashboardData);
  const apiIsUser = isUserDashboard(dashboardData);

  // Owner never sees customer dashboard
  const showAdminFull = isOwnerClient && apiIsAdmin;
  const showAdminLimited = isOwnerClient && !apiIsAdmin;
  const showUser = !isOwnerClient && apiIsUser;

  return (
    <div className="relative">
      {isFetching && !isPending && (
        <div className="absolute left-0 right-0 top-0 h-0.5 animate-pulse bg-gradient-to-l from-transparent via-current to-transparent opacity-40" />
      )}

      <motion.div
        className="grid grid-cols-12 gap-2"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="primary-title col-span-full mt-4 dark:text-white">
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
