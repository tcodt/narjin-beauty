import React from "react";
import { Outlet, useLocation } from "react-router";
import Navigation from "../components/Navigation/Navigation";
import TopBar from "../components/TopBar/TopBar";
import Sidebar from "../components/Sidebar/Sidebar";
import { useHomeTour } from "../hooks/drivers/useHomeTour";
import { SubscriptionStatusBanner } from "../components/SubscriptionStatusBanner/SubscriptionStatusBanner";
import { useSubscriptionStatus } from "../hooks/subscription/useSubscription";
import { useThemeColor } from "../context/ThemeColor";
import { useAuth } from "../context/AuthContext";
import { useUserType } from "../context/UserTypeContext";

/** روی این مسیرها بنر تکرار/مزاحم نشود */
const BANNER_HIDDEN_PATHS = ["/plans", "/subscription/buy", "/auth", "/login"];

const MainLayout: React.FC = () => {
  useHomeTour();

  const { pathname } = useLocation();
  const { themeColor } = useThemeColor();
  const { user } = useAuth();
  const { userType } = useUserType();

  const isOwner = userType === "owner" || !!user?.is_owner;
  const hideBanner =
    !isOwner || BANNER_HIDDEN_PATHS.some((p) => pathname.startsWith(p));

  const { data: subscription, isLoading: subLoading } = useSubscriptionStatus(
    isOwner && !hideBanner,
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <div
        id="mainPageForScroll"
        className="flex-1 overflow-y-auto p-4 -webkit-overflow-scrolling-touch
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-track]:bg-slate-300
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-slate-400"
      >
        <TopBar />

        {!hideBanner && (
          <div className="mb-4">
            <SubscriptionStatusBanner
              subscription={subscription ?? null}
              isLoading={subLoading}
              themeColor={themeColor}
            />
          </div>
        )}

        <main className="min-h-screen flex-1 pb-24">
          <Outlet />
        </main>
        <Navigation />
      </div>
      <Sidebar />
    </div>
  );
};

export default MainLayout;
