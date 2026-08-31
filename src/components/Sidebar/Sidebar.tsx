import React, { useEffect } from "react";
import { FaUsers, FaWallet } from "react-icons/fa";
import { GiBeard } from "react-icons/gi";
import {
  MdHome,
  MdOutlineAccountCircle,
  MdPerson,
  // MdSettings,
  MdSpaceDashboard,
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

const parentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const childrenVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
  },
};

type NavItem = {
  icon: React.ReactNode;
  label: string;
  path: string;
  requiredPermission: string | null;
  /** Only customers */
  customerOnly?: boolean;
  /** Business owner / staff with ACL — not platform-wide */
  ownerOnly?: boolean;
  /** Only real platform superuser — NOT salon owner */
  platformOnly?: boolean;
};

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { themeColor } = useThemeColor();
  const { role, isBusinessOwner, hasPermission, isSuperuser } = useAcl();

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     const sidebar = document.getElementById("sidebar");
  //     if (sidebar && !sidebar.contains(event.target as Node) && isSidebarOpen) {
  //       setIsSidebarOpen(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, [isSidebarOpen, setIsSidebarOpen]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname, setIsSidebarOpen]);

  const logoSrc = logoMap[themeColor] || "/images/logo-main.jpg";

  const isOwner = isBusinessOwner || role === "admin";
  // Platform admin = superuser without being "just" a salon operator if you need both.
  // If your product uses is_superuser ONLY for owners, hide users for all owners:
  const canSeeUsers = isSuperuser && !isBusinessOwner;
  // If NO ONE who is a salon owner should see users:
  // const canSeeUsers = isSuperuser && user?.is_superuser && !isOwner;

  const navItems: NavItem[] = [
    {
      icon: <MdHome size={20} />,
      label: "صفحه اصلی",
      path: "/home",
      requiredPermission: null,
      customerOnly: true,
    },
    {
      icon: <MdSpaceDashboard size={20} />,
      label: "داشبورد",
      path: "/dashboard",
      requiredPermission: null,
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
      icon: <FaUsers size={20} />,
      label: "کاربران",
      path: "/users",
      requiredPermission: "user_list",
      platformOnly: true, // ← salon owners never see this
    },
    {
      icon: <HiClipboardList size={20} />,
      label: "لیست رزرو ها",
      path: "/appointments-list",
      requiredPermission: null,
      customerOnly: true,
    },
    {
      icon: <HiClipboardList size={20} />,
      label: "مدیریت نوبت‌ها",
      path: "/manage-appointments",
      requiredPermission: null,
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
      icon: <FaWallet size={20} />,
      label: "کیف پول",
      path: "/wallet",
      requiredPermission: null,
      customerOnly: true,
    },
    {
      icon: <TbCalendarTime size={20} />,
      label: "زمان های در دسترس",
      path: "/available-times",
      requiredPermission: "time_slot-list",
      ownerOnly: true,
    },
    {
      icon: <MdPerson size={20} />,
      label: "پروفایل",
      path: "/user-profile",
      requiredPermission: null,
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.customerOnly && isOwner) return false;
    if (item.ownerOnly && !isOwner) return false;
    if (item.platformOnly) {
      // Business owners must not see Users
      if (isOwner) return false;
      return canSeeUsers || hasPermission("user_list");
    }

    if (!item.requiredPermission) return true;
    if (isOwner) return true;
    return hasPermission(item.requiredPermission);
  });

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        id="sidebar-panel"
        className={`fixed top-0 right-0 z-[2000] flex h-full w-[min(18rem,85vw)] flex-col border-e border-gray-200/80 bg-white/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out dark:border-gray-700 dark:bg-gray-900/95 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center gap-3 bg-gradient-to-l from-${themeColor}-600 to-${themeColor}-500 px-4 py-5`}
        >
          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white/40">
            <img src={logoSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-base font-bold text-white">آرایشگاه من</p>
            <p className="text-xs text-white/75">
              {isOwner ? "پنل مدیریت" : "پنل مشتری"}
            </p>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <motion.ul
            className="space-y-1"
            variants={parentVariants}
            initial="hidden"
            animate={isSidebarOpen ? "visible" : "hidden"}
          >
            {filteredNavItems.map((item) => {
              const active =
                location.pathname === item.path ||
                (item.path !== "/home" &&
                  location.pathname.startsWith(item.path));
              return (
                <motion.li key={item.label} variants={childrenVariants}>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                      setIsSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? `bg-${themeColor}-50 text-${themeColor}-700 dark:bg-${themeColor}-900/30 dark:text-${themeColor}-300`
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span
                      className={
                        active ? `text-${themeColor}-600` : "text-gray-400"
                      }
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {active && (
                      <span
                        className={`mr-auto h-1.5 w-1.5 rounded-full bg-${themeColor}-500`}
                      />
                    )}
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
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
                {user?.first_name}
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
