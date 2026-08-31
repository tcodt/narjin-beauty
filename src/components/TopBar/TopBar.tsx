import React, { useMemo, useState } from "react";
import { IoNotificationsOutline, IoSettingsOutline } from "react-icons/io5";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import SidebarToggleButton from "../SidebarToggleButton/SidebarToggleButton";
import CustomModal from "../CustomModal/CustomModal";
import ColorPicker from "../ColorPicker/ColorPicker";
import { useThemeColor } from "../../context/ThemeColor";
import DarkModeToggle from "../DarkModeToggle/DarkModeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { logoMap } from "../../utils/logoMap";
import { useGetNotifications } from "../../hooks/notifications/useGetNotifications";
import { useUnreadCount } from "../../hooks/notifications/useUnreadCount";
import { useMarkNotificationRead } from "../../hooks/notifications/useMarkNotificationRead";
import { useMarkAllNotificationsRead } from "../../hooks/notifications/useMarkAllNotificationsRead";
import { useDeleteNotification } from "../../hooks/notifications/useDeleteNotification";
import { AppNotification } from "../../types/notifications";
import Dots from "../Dots/Dots";

function typeTone(type: string): "info" | "success" | "warning" | "danger" {
  if (type.includes("confirm") || type === "appointment_confirmed")
    return "success";
  if (
    type.includes("cancel") ||
    type.includes("expired") ||
    type.includes("trial")
  )
    return "danger";
  if (
    type.includes("new_appointment") ||
    type.includes("created") ||
    type.includes("reminder")
  )
    return "warning";
  return "info";
}

function formatRelative(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "همین الان";
    if (mins < 60) return `${mins} دقیقه پیش`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ساعت پیش`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} روز پیش`;
    return d.toLocaleDateString("fa-IR");
  } catch {
    return "";
  }
}

const TopBar: React.FC = () => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { themeColor } = useThemeColor();
  const logoSrc = logoMap[themeColor] || "/images/logo-main.jpg";
  const navigate = useNavigate();

  const { data: notifications = [], isLoading: notifsLoading } =
    useGetNotifications();
  const { data: unreadFromApi } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const removeNotif = useDeleteNotification();

  const unreadCount = useMemo(() => {
    if (typeof unreadFromApi === "number") return unreadFromApi;
    return notifications.filter((n) => !n.is_read).length;
  }, [unreadFromApi, notifications]);

  const sorted = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [notifications]);

  const handleOpenNotif = async (n: AppNotification) => {
    setExpandedId((prev) => (prev === n.id ? null : n.id));

    if (!n.is_read) {
      try {
        await markRead.mutateAsync(n.id);
      } catch {
        /* silent */
      }
    }

    if (n.appointment) {
      setIsNotifOpen(false);
      navigate(`/view-appointment/${n.appointment}`);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success("همه اعلان‌ها خوانده شد");
    } catch {
      toast.error("خواندن همه اعلان‌ها ناموفق بود");
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeNotif.mutateAsync(id);
      toast.success("اعلان حذف شد");
    } catch {
      toast.error("حذف اعلان ناموفق بود");
    }
  };

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
        title="اعلان‌ها"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            {unreadCount > 0
              ? `${unreadCount} خوانده‌نشده`
              : "همه خوانده شده‌اند"}
          </p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={markAllRead.isPending}
              className={`text-xs font-semibold text-${themeColor}-600 disabled:opacity-50`}
            >
              {markAllRead.isPending ? "…" : "خواندن همه"}
            </button>
          )}
        </div>

        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
          {notifsLoading && (
            <div className="py-8">
              <Dots />
            </div>
          )}

          {!notifsLoading && sorted.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              اعلانی وجود ندارد
            </p>
          )}

          {sorted.map((notif) => {
            const tone = typeTone(notif.notification_type);
            const expanded = expandedId === notif.id;
            return (
              <div
                key={notif.id}
                className={`rounded-2xl border border-transparent bg-gray-50 text-right transition dark:bg-gray-700/60 border-s-4 ${
                  tone === "success"
                    ? "border-s-emerald-500"
                    : tone === "warning"
                      ? "border-s-amber-500"
                      : tone === "danger"
                        ? "border-s-rose-500"
                        : `border-s-${themeColor}-500`
                } ${notif.is_read ? "opacity-70" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => handleOpenNotif(notif)}
                  className="w-full p-3 text-right"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!notif.is_read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                        )}
                        <h4 className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {notif.title}
                        </h4>
                      </div>
                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {formatRelative(notif.created_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="حذف اعلان"
                      onClick={(e) => handleDelete(notif.id, e)}
                      className="shrink-0 rounded-lg px-2 py-1 text-[10px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      حذف
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                          {notif.message}
                        </p>
                        {notif.appointment ? (
                          <span
                            className={`mt-2 block text-xs font-semibold text-${themeColor}-600`}
                          >
                            مشاهده نوبت #{notif.appointment}
                          </span>
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!expanded && notif.message ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                      {notif.message}
                    </p>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>
      </CustomModal>
    </motion.header>
  );
};

export default TopBar;
