import React, { useMemo, useState } from "react";
import { IoNotificationsOutline, IoSettingsOutline } from "react-icons/io5";
import { useNavigate } from "react-router";
import SidebarToggleButton from "../SidebarToggleButton/SidebarToggleButton";
import CustomModal from "../CustomModal/CustomModal";
import ColorPicker from "../ColorPicker/ColorPicker";
import { useThemeColor } from "../../context/ThemeColor";
import DarkModeToggle from "../DarkModeToggle/DarkModeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { logoMap } from "../../utils/logoMap";
import { useAuth } from "../../context/AuthContext";
import { useUserType } from "../../context/UserTypeContext";
import { useAcl } from "../../context/AclContext";
import { useGetAppointments } from "../../hooks/appointments/useGetAppointments";
import { useGetBusinessAppointments } from "../../hooks/appointments/useGetBusinessAppointments";

type NotifItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
  tone?: "info" | "success" | "warning";
};

const TopBar: React.FC = () => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [expandedNotif, setExpandedNotif] = useState<string | null>(null);
  const { themeColor } = useThemeColor();
  const logoSrc = logoMap[themeColor] || "/images/logo-main.jpg";
  const navigate = useNavigate();

  const { user } = useAuth();
  const { userType } = useUserType();
  const { isBusinessOwner, role } = useAcl();

  const isOwner =
    userType === "owner" ||
    !!(user as { is_owner?: boolean })?.is_owner ||
    isBusinessOwner ||
    role === "admin";

  const { data: myAppointments = [] } = useGetAppointments();
  const { data: businessAppointments = [] } = useGetBusinessAppointments();

  const notifications = useMemo<NotifItem[]>(() => {
    if (isOwner) {
      return businessAppointments
        .filter((a) => a.status === "pending")
        .slice(0, 20)
        .map((a) => ({
          id: `biz-${a.id}`,
          title: "درخواست رزرو جدید",
          description: `${a.customer_name || "مشتری"} — ${a.service_name || "سرویس"} در ${a.date || "—"} ساعت ${a.start_time || "—"}`,
          href: `/view-appointment/${a.id}`,
          tone: "warning" as const,
        }));
    }

    return myAppointments
      .filter((a) => a.status === "confirmed")
      .slice(0, 20)
      .map((a) => ({
        id: `my-${a.id}`,
        title: "رزرو شما تأیید شد",
        description: `${a.service?.name || a.employee_name || "نوبت"} — وضعیت: ${a.get_status || "تأیید شده"}`,
        href: `/view-appointment/${a.id}`,
        tone: "success" as const,
      }));
  }, [isOwner, businessAppointments, myAppointments]);

  const unreadCount = notifications.length;

  return (
    <motion.header
      className={`topbar-motion-fix sticky top-0 z-30 mb-4 flex items-center justify-between rounded-2xl bg-gradient-to-l from-${themeColor}-600 to-${themeColor}-500 px-3 py-2.5 shadow-lg shadow-${themeColor}-500/20 dark:from-${themeColor}-800 dark:to-${themeColor}-700`}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center gap-1">
        <SidebarToggleButton />

        <button
          type="button"
          id="theme-toggle"
          onClick={() => setIsSettingOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white/95 transition hover:bg-white/15 active:scale-95"
          aria-label="تنظیمات"
        >
          <IoSettingsOutline size={22} />
        </button>

        <button
          type="button"
          id="notif"
          onClick={() => setIsNotifOpen(true)}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white/95 transition hover:bg-white/15 active:scale-95"
          aria-label="اعلان‌ها"
        >
          <IoNotificationsOutline size={22} />
          {unreadCount > 0 && (
            <span className="absolute left-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white/30">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden text-left sm:block">
          <p
            className="text-2xl font-bold leading-none text-white"
            style={{ fontFamily: "IranNastaliq, mainFont, sans-serif" }}
          >
            نارژین
          </p>
          <p className="mt-0.5 text-[10px] text-white/70">سالن زیبایی</p>
        </div>
        <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-white/40 bg-white/20 shadow-inner">
          <img
            src={logoSrc}
            alt="نارژین"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <CustomModal
        isOpen={isSettingOpen}
        onClose={() => setIsSettingOpen(false)}
        title="تنظیمات ظاهر"
      >
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              حالت نمایش
            </p>
            <DarkModeToggle />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              رنگ تم
            </p>
            <ColorPicker />
          </div>
        </div>
      </CustomModal>

      <CustomModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        title={isOwner ? "درخواست‌های رزرو" : "اعلان‌های نوبت"}
      >
        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              {isOwner
                ? "درخواست رزرو جدیدی نیست"
                : "اعلانی برای نوبت‌های تأییدشده نیست"}
            </p>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif.id}
                type="button"
                onClick={() => {
                  if (notif.href) {
                    setIsNotifOpen(false);
                    navigate(notif.href);
                  } else {
                    setExpandedNotif(
                      expandedNotif === notif.id ? null : notif.id,
                    );
                  }
                }}
                className={`rounded-2xl border border-transparent bg-gray-50 p-3 text-right transition hover:border-gray-200 dark:bg-gray-700/60 dark:hover:border-gray-600 border-s-4 ${
                  notif.tone === "success"
                    ? "border-s-emerald-500"
                    : notif.tone === "warning"
                      ? "border-s-amber-500"
                      : `border-s-${themeColor}-500`
                }`}
              >
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {notif.title}
                </h4>
                <AnimatePresence initial={false}>
                  {expandedNotif === notif.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                        {notif.description}
                      </p>
                      {notif.href && (
                        <span
                          className={`mt-2 block text-xs font-semibold text-${themeColor}-600`}
                        >
                          مشاهده جزئیات
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ))
          )}
        </div>
      </CustomModal>
    </motion.header>
  );
};

export default TopBar;
