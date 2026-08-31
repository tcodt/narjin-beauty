import React, { useEffect, useMemo, useState } from "react";
import { FaRegUser } from "react-icons/fa";
import { GrHomeRounded } from "react-icons/gr";
import { LuNotebookText } from "react-icons/lu";
import { MdOutlineDesignServices, MdPeopleOutline } from "react-icons/md";
import { useLocation, useNavigate } from "react-router";
import { useThemeColor } from "../../context/ThemeColor";
import { useAcl } from "../../context/AclContext";
import { useUserType } from "../../context/UserTypeContext";
import { useAuth } from "../../context/AuthContext";

type Tab = {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  match: (path: string) => boolean;
  customerOnly?: boolean;
  ownerOnly?: boolean;
};

const Navigation: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { themeColor } = useThemeColor();
  const { role, isBusinessOwner } = useAcl();
  const { userType } = useUserType();
  const { user } = useAuth();

  const profileOwner = !!(user as { is_owner?: boolean } | null)?.is_owner;

  const isOwner =
    userType === "owner" || profileOwner || isBusinessOwner || role === "admin";

  const tabs: Tab[] = useMemo(
    () => [
      {
        id: "dashboard",
        label: "داشبورد",
        path: "/dashboard",
        icon: <FaRegUser size={20} />,
        match: (p) => p.startsWith("/dashboard"),
      },
      {
        id: "home",
        label: "خانه",
        path: "/home",
        icon: <GrHomeRounded size={20} />,
        match: (p) => p === "/home" || p === "/",
        customerOnly: true,
      },
      {
        id: "reserve",
        label: "رزرو",
        path: "/reserve",
        icon: <LuNotebookText size={20} />,
        match: (p) => p.startsWith("/reserve"),
        customerOnly: true,
      },
      {
        id: "my-appointments",
        label: "نوبت‌ها",
        path: "/appointments-list",
        icon: <LuNotebookText size={20} />,
        match: (p) => p.startsWith("/appointments"),
        customerOnly: true, // only customers
      },
      {
        id: "services",
        label: "خدمات",
        path: "/manage-services",
        icon: <MdOutlineDesignServices size={22} />,
        match: (p) => p.startsWith("/manage-services"),
        ownerOnly: true,
      },
      {
        id: "employees",
        label: "آرایشگران",
        path: "/manage-employees",
        icon: <MdPeopleOutline size={22} />,
        match: (p) => p.startsWith("/manage-employees"),
        ownerOnly: true,
      },
    ],
    [],
  );

  const visibleTabs = tabs.filter((t) => {
    if (t.customerOnly && isOwner) return false;
    if (t.ownerOnly && !isOwner) return false;
    return true;
  });

  useEffect(() => {
    const el = document.getElementById("mainPageForScroll");
    if (!el) return;
    const onScroll = () => {
      const y = el.scrollTop;
      setIsVisible(y < lastScrollY || y < 24);
      setLastScrollY(y);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  return (
    <nav
      id="mobile-nav"
      className={`fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-[120%]"
      }`}
    >
      <div className="mx-auto flex max-w-lg justify-around gap-1 rounded-2xl border border-white/20 bg-white/90 px-1 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-gray-600/50 dark:bg-gray-900/90">
        {visibleTabs.map((tab) => {
          const active = tab.match(location.pathname);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition-all ${
                active
                  ? `text-${themeColor}-600 dark:text-${themeColor}-400`
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {active && (
                <span
                  className={`absolute inset-x-2 top-0 h-0.5 rounded-full bg-${themeColor}-500`}
                />
              )}
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  active
                    ? `bg-${themeColor}-50 dark:bg-${themeColor}-900/40`
                    : ""
                }`}
              >
                {tab.icon}
              </span>
              <span className="truncate text-[10px] font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
