import React, { useMemo } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  LuNotebookText,
  LuUsers,
  LuCalendarDays,
  LuWallet,
  LuCircleAlert,
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
import { SubscriptionStatusBanner } from "../../components/SubscriptionStatusBanner/SubscriptionStatusBanner";
import { useSubscriptionStatus } from "../../hooks/subscription/useSubscription";

/* -------------------------------------------------------------------------- */
/* Shared design tokens                                                       */
/* -------------------------------------------------------------------------- */

const cardBase =
  "rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800";

const interactive =
  "transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const isAdminDashboard = (
  d: DashboardResponse | undefined,
): d is AdminDashboardResponse => d?.type === "admin";

const isUserDashboard = (
  d: DashboardResponse | undefined,
): d is UserDashboardResponse => d?.type === "user";

const formatMoney = (v: number) => `${v.toLocaleString("fa-IR")} تومان`;

const statusMeta = (status: string) => {
  switch (status) {
    case "pending":
      return {
        chip: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      };
    case "confirmed":
    case "completed":
      return {
        chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      };
    case "cancelled":
    case "canceled":
      return {
        chip: "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
      };
    default:
      return {
        chip: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
      };
  }
};

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

const Card: React.FC<{
  className?: string;
  as?: "div" | "span";
  children: React.ReactNode;
}> = ({ className = "", as: Tag = "div", children }) => (
  <Tag className={`${cardBase} ${className}`}>{children}</Tag>
);

const SectionTitle: React.FC<{
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ children, action }) => (
  <div className="col-span-full mt-5 flex items-end justify-between gap-2">
    <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white">
      {children}
    </h3>
    {action}
  </div>
);

const StatCard: React.FC<{
  label: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
}> = ({ label, icon, className = "col-span-full" }) => (
  <Card className={`relative overflow-hidden p-4 ${className}`}>
    <div className="absolute left-3 top-3 opacity-40">{icon}</div>
    <div className="truncate pr-1 text-base font-semibold text-gray-800 dark:text-gray-100">
      {label}
    </div>
  </Card>
);

const StatusChip: React.FC<{ status: string; label?: string }> = ({
  status,
  label,
}) => (
  <span
    aria-label={`وضعیت: ${label ?? status}`}
    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusMeta(status).chip}`}
  >
    {label ?? status}
  </span>
);

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}> = ({ icon, title, action }) => (
  <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white py-8 text-center dark:border-gray-600 dark:bg-gray-800">
    {icon}
    <p className="mt-2 text-sm text-gray-500">{title}</p>
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

  const incomeBars = useMemo(() => {
    const { today = 0, week = 0, month = 0 } = data.income ?? {};
    const max = Math.max(today, week, month, 1);
    return [
      { label: "امروز", value: today, height: (today / max) * 100 },
      { label: "هفته", value: week, height: (week / max) * 100 },
      { label: "ماه", value: month, height: (month / max) * 100 },
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

      <div className="col-span-full">
        <Card className="flex h-64 flex-col justify-end p-4 sm:h-72">
          <div className="mb-2 flex items-center gap-2">
            <GrLineChart className={themeText[tc]} size={18} />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              نمودار درآمد
            </span>
          </div>
          <div
            className={`flex h-full w-full flex-row items-end justify-evenly border-b-2 pb-3 ${themeBorder[tc]}`}
          >
            {incomeBars.map((bar, i) => (
              <div
                key={bar.label}
                className="flex h-full w-1/5 flex-col items-center justify-end"
                aria-label={`${bar.label}: ${formatMoney(bar.value)}`}
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(bar.height, 2)}%` }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.12,
                    ease: "easeOut",
                  }}
                  className={`min-h-1 w-7 rounded-t-2xl ${themeBarFill[tc]}`}
                />
                <span className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-200">
                  {bar.label}
                </span>
                <span className="truncate text-[10px] tabular-nums text-gray-400">
                  {formatMoney(bar.value)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

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
          className={`col-span-full flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 hover:opacity-95 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200 ${interactive} ${focusRing}`}
        >
          <span className="truncate">
            {pendingCount} نوبت در انتظار تأیید شماست
          </span>
          <HiArrowLeft size={16} className="shrink-0" />
        </Link>
      )}

      <Card className="relative col-span-full grid grid-cols-12 gap-2 overflow-hidden p-4">
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
          <div key={label} className="col-span-4 min-w-0">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="truncate text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-200">
              {formatMoney(value ?? 0)}
            </p>
          </div>
        ))}
      </Card>

      <SectionTitle
        action={
          <Link
            to="/manage-appointments"
            className={`shrink-0 text-sm font-semibold hover:opacity-70 ${themeText[tc]} ${focusRing}`}
          >
            همه رزروها
          </Link>
        }
      >
        رزروهای اخیر
      </SectionTitle>

      {!data.total_appointments && (
        <EmptyState title="هنوز رزروی ثبت نشده است." />
      )}

      {data.appointments?.slice(0, 8).map((a) => (
        <Link
          key={a.id}
          to="/manage-appointments"
          className={`col-span-full p-4 ${cardBase} ${interactive} ${focusRing}`}
        >
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
              {a.service?.name ?? "سرویس"}
            </h4>
            <StatusChip status={a.status} label={a.get_status || a.status} />
          </div>
          {a.employee_name && (
            <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
              {a.employee_name}
            </p>
          )}
        </Link>
      ))}

      <SectionTitle
        action={
          <Link
            to="/manage-employees"
            className={`inline-flex shrink-0 items-center gap-1 text-sm font-semibold hover:opacity-70 ${themeText[tc]} ${focusRing}`}
          >
            مدیریت <HiArrowLeft size={14} />
          </Link>
        }
      >
        آرایشگران سالن
      </SectionTitle>

      {employeesLoading && (
        <div className="col-span-full space-y-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`animate-pulse p-4 sm:col-span-6 ${cardBase}`}
              aria-busy="true"
            >
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-2 h-3 w-24 rounded bg-gray-100 dark:bg-gray-700/60" />
            </div>
          ))}
        </div>
      )}

      {!employeesLoading && employeeList.length === 0 && (
        <EmptyState
          icon={<LuUsers className="mx-auto text-gray-300" size={36} />}
          title="هنوز آرایشگری اضافه نشده"
          action={
            <Link
              to="/manage-employees"
              className={`mt-3 inline-block text-sm font-semibold hover:opacity-70 ${themeText[tc]} ${focusRing}`}
            >
              افزودن آرایشگر
            </Link>
          }
        />
      )}

      {employeeList.slice(0, 6).map((emp) => (
        <div
          key={emp.id}
          className={`col-span-full flex items-center justify-between gap-3 p-4 sm:col-span-6 ${cardBase}`}
        >
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
              {getEmployeeDisplayName(emp.user)}
            </h4>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {emp.skill?.trim() || "بدون مهارت"}
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-400" dir="ltr">
              {getEmployeePhone(emp.user)}
            </p>
          </div>
          <Link
            to="/manage-employees"
            className={`shrink-0 text-xs font-semibold hover:opacity-70 ${themeText[tc]} ${focusRing}`}
          >
            جزئیات
          </Link>
        </div>
      ))}

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
            className={`flex items-center justify-center gap-1.5 rounded-xl py-3 text-center text-sm font-semibold text-white hover:opacity-90 ${themeBgSolid[tc]} ${interactive} ${focusRing}`}
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
          <div className="min-w-0">
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              پرداخت ناقص
            </p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              یک یا چند رزرو هنوز پرداخت نشده است.
            </p>
            <Link
              to="/wallet"
              className={`mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-800 underline hover:opacity-80 dark:text-amber-200 ${focusRing}`}
            >
              کیف پول <HiArrowLeft size={14} />
            </Link>
          </div>
        </div>
      )}

      {next ? (
        <Link
          to={`/view-appointment/${next.id}`}
          className={`col-span-full block rounded-2xl p-5 text-white shadow-lg hover:shadow-xl ${themeBgSolid[tc]} ${interactive} ${focusRing}`}
        >
          <div className="mb-2 flex items-center gap-2 text-white/90">
            <MdOutlineEventAvailable size={20} />
            <span className="text-sm font-medium">نوبت بعدی</span>
          </div>
          <h4 className="truncate text-xl font-bold">
            {next.service?.name ?? "سرویس"}
          </h4>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/90">
            {next.employee_name && (
              <span className="truncate">{next.employee_name}</span>
            )}
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
        <Card className="col-span-full p-6 text-center">
          <p className="font-medium text-gray-600 dark:text-gray-300">
            نوبت فعالی ندارید
          </p>
          <Link
            to="/reserve"
            className={`mt-3 inline-block rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 ${themeBgSolid[tc]} ${interactive} ${focusRing}`}
          >
            رزرو نوبت جدید
          </Link>
        </Card>
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
            className={`shrink-0 text-sm font-semibold hover:opacity-70 ${themeText[tc]} ${focusRing}`}
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

      {data.last_appointments?.map((a) => (
        <Link
          key={a.id}
          to={`/view-appointment/${a.id}`}
          className={`col-span-full p-4 ${cardBase} ${interactive} ${focusRing}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
              {a.service?.name ?? "سرویس"}
            </span>
            <StatusChip status={a.status} label={a.get_status || a.status} />
          </div>
          {a.employee_name && (
            <p className="mt-1 truncate text-xs text-gray-500">
              {a.employee_name}
            </p>
          )}
        </Link>
      ))}
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
            <LuCircleAlert size={20} />
          </div>
          <div className="min-w-0">
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
            className={`rounded-xl p-4 text-center text-sm font-medium text-gray-700 dark:text-gray-200 ${cardBase} ${interactive} ${focusRing}`}
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

  // اول نقش را مشخص کن، بعد subscription را فقط برای مالک بگیر
  const isOwnerClient =
    isBusinessOwner || isOwner || isSuperuser || role === "admin";

  const { data: subscription, isPending: subscriptionLoading } =
    useSubscriptionStatus(isOwnerClient);

  if (isPending || aclLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Dots />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center"
      >
        <p className="font-medium text-rose-500">خطا در دریافت داشبورد</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {(error as Error)?.message ?? "لطفاً دوباره تلاش کنید."}
        </p>
      </div>
    );
  }

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
          aria-hidden="true"
        />
      )}

      <motion.div
        className="grid grid-cols-12 gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h3 className="col-span-full mt-2 truncate text-xl font-bold text-gray-900 dark:text-white">
          {isOwnerClient ? "گزارشات کسب‌وکار" : "داشبورد من"}
        </h3>

        {isOwnerClient && (
          <SubscriptionStatusBanner
            subscription={subscription ?? null}
            isLoading={subscriptionLoading}
            themeColor={themeColor}
          />
        )}

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
