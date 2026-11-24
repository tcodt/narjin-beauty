import React, { useEffect, useMemo } from "react";
import {
  FaCrown,
  FaFileInvoiceDollar,
  FaQrcode,
  FaStore,
} from "react-icons/fa";
import { GiBeard } from "react-icons/gi";
import {
  MdHome,
  MdOutlineAccountCircle,
  MdPerson,
  MdSpaceDashboard,
  MdLockOutline,
} from "react-icons/md";
import { useLocation, useNavigate } from "react-router";
import { useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";
import { HiClipboardList } from "react-icons/hi";
import { IoLogOut } from "react-icons/io5";
import { FaSliders, FaUsersGear } from "react-icons/fa6";
import { useThemeColor } from "../../context/ThemeColor";
import { TbCalendarTime } from "react-icons/tb";
import { useAcl } from "../../context/AclContext";
import { logoMap } from "../../utils/logoMap";
import { motion } from "framer-motion";
import { themeText } from "../../utils/themeClasses";
import { FiCreditCard, FiFileText, FiUsers } from "react-icons/fi";
import {
  FEATURE_ROUTE_MAP,
  getFeatureKeyForPath,
} from "../../constants/featureRoutes";
import { useFeatures } from "../../hooks/subscription/useFeature";

const parentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const childrenVariants = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0 },
};

type NavItem = {
  icon: React.ReactNode;
  label: string;
  path: string;
  /** پرمیشن ACL کارمند (برای owner معمولاً لازم نیست) */
  requiredPermission?: string | null;
  customerOnly?: boolean;
  ownerOnly?: boolean;
  platformOnly?: boolean;
};

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { themeColor } = useThemeColor();
  const { role, isBusinessOwner, hasPermission, isSuperuser } = useAcl();
  const {
    hasFeature,
    isLocked,
    panelOk,
    isLoading: featuresLoading,
  } = useFeatures();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname, setIsSidebarOpen]);

  const logoSrc = logoMap[themeColor] || "/images/logo-main.jpg";
  const isOwner = isBusinessOwner || role === "admin";

  /** تعریف منوها — کلید فیچر از FEATURE_ROUTE_MAP خوانده می‌شود */
  const navItems: NavItem[] = useMemo(
    () => [
      {
        icon: <MdHome size={20} />,
        label: "صفحه اصلی",
        path: "/home",
        customerOnly: true,
      },
      {
        icon: <MdSpaceDashboard size={20} />,
        label: "داشبورد",
        path: "/dashboard",
      },
      {
        icon: <FaUsersGear size={20} />,
        label: "مدیریت آرایشگران",
        path: "/manage-employees",
        requiredPermission: "employee_list",
        ownerOnly: true,
      },
      {
        icon: <MdSpaceDashboard size={20} />,
        label: "خدمات آرایشگاه",
        path: "/manage-services",
        requiredPermission: "service_list",
        ownerOnly: true,
      },
      {
        icon: <HiClipboardList size={20} />,
        label: "لیست رزرو ها",
        path: "/appointments-list",
        customerOnly: true,
      },
      {
        icon: <HiClipboardList size={20} />,
        label: "مدیریت نوبت‌ها",
        path: "/manage-appointments",
        ownerOnly: true,
      },
      {
        icon: <FaSliders size={20} />,
        label: "بنر ها",
        path: "/sliders",
        requiredPermission: "slider_list",
        ownerOnly: true,
      },
      {
        icon: <GiBeard size={20} />,
        label: "پکیج ها",
        path: "/packages",
        requiredPermission: "packages_list",
        ownerOnly: true,
      },
      {
        icon: <TbCalendarTime size={20} />,
        label: "ساعات کاری و تعطیلات",
        path: "/working-time",
        ownerOnly: true,
      },
      {
        icon: <TbCalendarTime size={20} />,
        label: "زمان‌های در دسترس",
        path: "/available-times",
        requiredPermission: "time_slot-list",
        ownerOnly: true,
      },
      {
        icon: <FaFileInvoiceDollar size={20} />,
        label: "پرداخت کارت‌به‌کارت",
        path: "/submit-manual-payment",
        customerOnly: true,
      },
      {
        icon: <FiUsers className="h-5 w-5" />,
        label: "مشتریان",
        path: "/customers-list",
        requiredPermission: "customers-list",
        ownerOnly: true,
      },
      {
        icon: <FiCreditCard className="h-5 w-5" />,
        label: "کارت‌های بانکی",
        path: "/bank-cards",
        requiredPermission: "bank_cards",
        ownerOnly: true,
      },
      {
        icon: <FiFileText className="h-5 w-5" />,
        label: "فیش‌های پرداخت",
        path: "/manual-payments",
        requiredPermission: "payments_record",
        ownerOnly: true,
      },
      {
        icon: <FaQrcode size={20} />,
        label: "کد QR رزرو",
        path: "/booking-qr",
        ownerOnly: true,
      },
      {
        icon: <FaCrown size={20} />,
        label: "پلن‌ها و اشتراک",
        path: "/plans",
        ownerOnly: true,
      },
      {
        icon: <FaStore size={20} />,
        label: "لوگوی سالن",
        path: "/business-logo",
        ownerOnly: true,
      },
      {
        icon: <MdPerson size={20} />,
        label: "پروفایل",
        path: "/user-profile",
      },
    ],
    [],
  );

  /**
   * فیلتر نهایی منو:
   * 1. نقش (owner / customer)
   * 2. ACL کارمند
   * 3. فیچر از backend (hasFeature / isLocked)
   *
   * آیتم‌های قفل‌شده را هم نشان می‌دهیم (با آیکون قفل) تا کاربر ارتقا بدهد.
   */
  const visibleNavItems = useMemo(() => {
    return navItems
      .filter((item) => {
        if (item.customerOnly && isOwner) return false;
        if (item.ownerOnly && !isOwner) return false;
        if (item.platformOnly) return isSuperuser;

        // ACL برای کارمند
        if (item.requiredPermission && !isOwner) {
          if (!hasPermission(item.requiredPermission)) return false;
        }

        return true;
      })
      .map((item) => {
        const featureKey =
          FEATURE_ROUTE_MAP[item.path] ?? getFeatureKeyForPath(item.path);

        // مسیر بدون فیچر
        if (!featureKey) {
          return { ...item, locked: false, featureKey: null as string | null };
        }

        // Owner: بررسی فیچر از access
        if (isOwner) {
          const locked = isLocked(featureKey) || !hasFeature(featureKey);
          // اگر پنل کلاً بسته است، همهٔ فیچرها را قفل نشان بده (به‌جز plans)
          if (!panelOk && item.path !== "/plans") {
            return { ...item, locked: true, featureKey };
          }
          return { ...item, locked, featureKey };
        }

        return { ...item, locked: false, featureKey };
      });
  }, [
    navItems,
    isOwner,
    isSuperuser,
    hasPermission,
    panelOk,
    hasFeature,
    isLocked,
  ]);

  const handleNavigate = (path: string, locked: boolean) => {
    if (locked) {
      navigate("/plans", {
        state: { from: path, reason: "feature_locked" },
      });
      setIsSidebarOpen(false);
      return;
    }
    navigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <style>{`
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s ease;
        }
        .sidebar-scroll:hover {
          scrollbar-color: rgba(156, 163, 175, 0.4) transparent;
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 9999px;
        }
        .sidebar-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
        }
      `}</style>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        id="sidebar"
        className={`fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col border-l border-gray-100 bg-white shadow-xl transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 p-4 dark:border-gray-800">
          <img
            src={logoSrc}
            alt="نارژین"
            className="h-10 w-10 rounded-xl object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
              نارژین
            </p>
            <p className="truncate text-xs text-gray-500">پنل مدیریت</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto p-3">
          {featuresLoading && isOwner ? (
            <div className="flex justify-center py-8 text-sm text-gray-400">
              در حال بارگذاری منو...
            </div>
          ) : (
            <motion.ul
              variants={parentVariants}
              initial="hidden"
              animate="visible"
              className="space-y-1"
            >
              {visibleNavItems.map((item) => {
                const active =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + "/");
                const locked = item.locked;

                return (
                  <motion.li key={item.path} variants={childrenVariants}>
                    <button
                      type="button"
                      onClick={() => handleNavigate(item.path, locked)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        active && !locked
                          ? `bg-${themeColor}-50 text-${themeColor}-700 dark:bg-${themeColor}-900/30 dark:text-${themeColor}-300`
                          : locked
                            ? "text-gray-400 opacity-70 hover:bg-gray-50 dark:text-gray-500 dark:hover:bg-gray-800"
                            : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span
                        className={
                          active && !locked
                            ? themeText[themeColor]
                            : locked
                              ? "text-gray-400"
                              : "text-gray-400"
                        }
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>

                      {locked && (
                        <MdLockOutline
                          size={16}
                          className="mr-auto shrink-0 text-amber-500"
                          title="نیاز به ارتقای پلن"
                        />
                      )}

                      {active && !locked && (
                        <span
                          className={`mr-auto h-1.5 w-1.5 shrink-0 rounded-full bg-${themeColor}-500`}
                        />
                      )}
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </nav>

        {/* Footer */}
        <div className="space-y-2 border-t border-gray-100 p-3 dark:border-gray-800">
          <button
            type="button"
            onClick={() => navigate("/logout")}
            className="flex w-full items-center gap-3 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400"
          >
            <IoLogOut size={18} />
            خروج از حساب
          </button>

          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <MdOutlineAccountCircle className="text-gray-500" size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800 dark:text-white">
                {user?.first_name || "کاربر"}
              </p>
              <p
                className="truncate text-xs text-gray-500 dark:text-gray-400"
                dir="ltr"
              >
                {user?.phone_number}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
