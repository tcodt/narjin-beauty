import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router";

import HomePage from "../pages/HomePage/HomePage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import PrivateRoutes from "./PrivateRoutes";
import Auth from "../pages/Auth/Auth";
import SplashScreen from "../components/SplashScreen/SplashScreen";
import UserProfile from "../pages/UserProfile/UserProfile";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ForgotPasswordCode from "../pages/ForgotPasswordCode/ForgotPasswordCode";
import ChangePassword from "../pages/ChangePassword/ChangePassword";
import Dashboard from "../pages/Dashboard/Dashboard";
import Reserve from "../pages/Reserve/Reserve";
import MainLayout from "../layout/MainLayout";
import AppointmentsList from "../pages/AppointmentsList/AppointmentsList";
import Settings from "../pages/Settings/Settings";
import ManageEmployees from "../pages/ManageEmployees/ManageEmployees";
import NotFound from "../../NotFound/NotFound";
import OfflinePage from "../pages/OfflinePage/OfflinePage";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import ViewAppointment from "../pages/ViewAppointment/ViewAppointment";
import ManageServices from "../pages/ManageServices/ManageServices";
import UpdateAppointment from "../pages/UpdateAppointment/UpdateAppointment";
import WorkingTime from "../pages/WorkingTime/WorkingTime";
import AddWorkingTime from "../pages/AddWorkingTime/AddWorkingTime";
import Sliders from "../pages/Sliders/Sliders";
import UpdateWorkingTime from "../pages/UpdateWorkingTime/UpdateWorkingTime";
import Packages from "../pages/Packages/Packages";
import PackagesInfo from "../pages/PackagesInfo/PackagesInfo";
import Logout from "../pages/Logout/Logout";
import AclManager from "../components/AclManager/AclManager";
import { useAuth } from "../context/AuthContext";
import Wallet from "../pages/Wallet/Wallet";
import AvailableTimes from "../pages/AvailableTimes/AvailableTimes";
import UserProfileDetail from "../pages/UserProfileDetail/UserProfileDetail";
import UpdateSlots from "../pages/UpdateSlots/UpdateSlots";
import Users from "../pages/Users/Users";
import { UserTypeProvider, useUserType } from "../context/UserTypeContext";
import RoleAuthentication from "../pages/RoleAuthentication/RoleAuthentication";
import CreateBusiness from "../pages/CreateBusiness/CreateBusiness";
import RandomCodeInput from "../pages/RandomCodeInput/RandomCodeInput";
import UserFlow from "../layout/UserFlow";
import WaitingRoom from "../pages/WaitingRoom/WaitingRoom";
import { BusinessStatusGuard } from "../components/BusinessStatusGuard/BusinessStatusGuard";
import { RoleRoute } from "./RoleRoute";
import JoinSalon from "../pages/JoinSalon/JoinSalon";
import Dots from "../components/Dots/Dots";
import ManageAppointments from "../pages/ManageAppointments/ManageAppointments";
import CustomersList from "../pages/CustomersList/CustomersList";
import BankCards from "../pages/BankCards/BankCards";
import ManualPayments from "../pages/ManualPayments/ManualPayments";
import SubmitManualPayment from "../pages/SubmitManualPayment/SubmitManualPayment";
import BookingQr from "../pages/BookingQr/BookingQr";
import BusinessLogo from "../pages/BusinessLogo/BusinessLogo";
import OwnerAppointment from "../pages/OwnerAppointment/OwnerAppointment";
import SubscriptionGuard from "../components/SubscriptionGuard/SubscriptionGuard";
import Plans from "../pages/Subscription/Plans";
import BuySubscription from "../pages/Subscription/BuySubscription";

/* -------------------------------------------------------------------------- */
/* Network wrapper                                                            */
/* -------------------------------------------------------------------------- */

const NetworkStatusWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useNetworkStatus();
  return <>{children}</>;
};

/* -------------------------------------------------------------------------- */
/* Post-auth redirect                                                         */
/* -------------------------------------------------------------------------- */

const PostAuthRedirect: React.FC = () => {
  const { userType, isReady, setUserType } = useUserType();
  const { user, isLoading: authLoading } = useAuth();

  const isOwner = !!user?.is_owner;

  useEffect(() => {
    if (authLoading || !isReady || !user) return;
    if (isOwner && userType !== "owner") {
      setUserType("owner");
    } else if (!isOwner && userType !== "customer" && userType !== "owner") {
      setUserType("customer");
    }
  }, [authLoading, isReady, user, isOwner, userType, setUserType]);

  if (authLoading || !isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Dots />
      </div>
    );
  }

  if (isOwner || userType === "owner") {
    return <Navigate to="/dashboard" replace />;
  }

  const joined = localStorage.getItem("joinedBusiness");
  return <Navigate to={joined ? "/home" : "/join-salon"} replace />;
};

/* -------------------------------------------------------------------------- */
/* Onboarding-only guard                                                      */
/* -------------------------------------------------------------------------- */

const OnboardingOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { userType, isReady, setUserType } = useUserType();
  const location = useLocation();

  const profileOwner = !!user?.is_owner;
  const hasJoinedSalon = !!localStorage.getItem("joinedBusiness");

  useEffect(() => {
    if (authLoading || !isReady || !user) return;
    if (profileOwner && userType !== "owner") {
      setUserType("owner");
    }
  }, [authLoading, isReady, user, profileOwner, userType, setUserType]);

  if (authLoading || !isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Dots />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (profileOwner) {
    return <Navigate to="/dashboard" replace />;
  }

  if (location.pathname === "/role-authentication") {
    if (userType === "customer" && hasJoinedSalon) {
      return <Navigate to="/home" replace />;
    }
    if (userType === "owner") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (location.pathname === "/create-business") {
    if (!userType) {
      return <Navigate to="/role-authentication" replace />;
    }
    if (userType === "customer") {
      return <Navigate to="/join-salon" replace />;
    }
  }

  if (location.pathname === "/random-code-input") {
    if (!userType) {
      return <Navigate to="/role-authentication" replace />;
    }
    if (userType === "owner") {
      return <Navigate to="/create-business" replace />;
    }
  }

  return <>{children}</>;
};

/* -------------------------------------------------------------------------- */
/* Layout shells                                                              */
/* -------------------------------------------------------------------------- */

/** مشتری + صفحات مشترک — بدون محدودیت اشتراک */
const AppShell: React.FC = () => (
  <PrivateRoutes>
    <BusinessStatusGuard>
      <NetworkStatusWrapper>
        <MainLayout />
      </NetworkStatusWrapper>
    </BusinessStatusGuard>
  </PrivateRoutes>
);

/**
 * مالک — مدیریت سالن
 * SubscriptionGuard فقط برای owner اعمال می‌شود (داخل خود گارد)
 */
const OwnerShell: React.FC = () => (
  <PrivateRoutes>
    <BusinessStatusGuard>
      <SubscriptionGuard>
        <NetworkStatusWrapper>
          <MainLayout />
        </NetworkStatusWrapper>
      </SubscriptionGuard>
    </BusinessStatusGuard>
  </PrivateRoutes>
);

/** پلن و خرید — همیشه برای مالک در دسترس (بدون قفل اشتراک) */
const SubscriptionShell: React.FC = () => (
  <PrivateRoutes>
    <BusinessStatusGuard>
      <NetworkStatusWrapper>
        <MainLayout />
      </NetworkStatusWrapper>
    </BusinessStatusGuard>
  </PrivateRoutes>
);

/* -------------------------------------------------------------------------- */
/* Routes                                                                     */
/* -------------------------------------------------------------------------- */

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <UserTypeProvider>
        <Routes>
          {/* ===================== PUBLIC ===================== */}
          <Route path="/" element={<SplashScreen />} />
          <Route
            path="/auth"
            element={isAuthenticated ? <PostAuthRedirect /> : <Auth />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/receive-code" element={<ForgotPasswordCode />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/acl" element={<AclManager />} />
          <Route path="/offline" element={<OfflinePage />} />

          {/* ===================== ONBOARDING ===================== */}
          <Route
            element={
              <OnboardingOnly>
                <UserFlow />
              </OnboardingOnly>
            }
          >
            <Route
              path="/role-authentication"
              element={<RoleAuthentication />}
            />
            <Route path="/create-business" element={<CreateBusiness />} />
            <Route path="/random-code-input" element={<RandomCodeInput />} />
          </Route>

          {/* ===================== WAITING ROOM ===================== */}
          <Route
            path="/waiting-room"
            element={
              <PrivateRoutes>
                <NetworkStatusWrapper>
                  <BusinessStatusGuard>
                    <WaitingRoom />
                  </BusinessStatusGuard>
                </NetworkStatusWrapper>
              </PrivateRoutes>
            }
          />

          {/* ===================== SUBSCRIPTION (owner, always open) ===================== */}
          <Route element={<SubscriptionShell />}>
            <Route
              path="/plans"
              element={
                <RoleRoute allow="owner">
                  <Plans />
                </RoleRoute>
              }
            />
            <Route
              path="/subscription/buy"
              element={
                <RoleRoute allow="owner">
                  <BuySubscription />
                </RoleRoute>
              }
            />
          </Route>

          {/* ===================== SHARED + CUSTOMER ===================== */}
          <Route element={<AppShell />}>
            <Route
              path="/home"
              element={
                <RoleRoute allow="customer">
                  <HomePage />
                </RoleRoute>
              }
            />

            <Route
              path="/join-salon"
              element={
                <RoleRoute allow="customer">
                  <JoinSalon />
                </RoleRoute>
              }
            />

            {/* داشبورد برای هر دو نقش — بنر اشتراک فقط داخل صفحه برای owner */}
            <Route path="/dashboard" element={<Dashboard />} />

            <Route
              path="/reserve"
              element={
                <RoleRoute allow="customer">
                  <Reserve />
                </RoleRoute>
              }
            />

            <Route path="/user-profile" element={<UserProfile />} />
            <Route
              path="/user-profile-detail/:id"
              element={<UserProfileDetail />}
            />

            <Route
              path="/appointments-list"
              element={
                <RoleRoute allow="customer">
                  <AppointmentsList />
                </RoleRoute>
              }
            />

            <Route path="/settings" element={<Settings />} />

            <Route
              path="/view-appointment/:id"
              element={
                <RoleRoute allow="customer">
                  <ViewAppointment />
                </RoleRoute>
              }
            />

            <Route path="/wallet" element={<Wallet />} />

            <Route
              path="/submit-manual-payment"
              element={
                <RoleRoute allow="customer">
                  <SubmitManualPayment />
                </RoleRoute>
              }
            />

            <Route path="/logout" element={<Logout />} />
          </Route>

          {/* ===================== OWNER (subscription-gated) ===================== */}
          <Route element={<OwnerShell />}>
            <Route
              path="/manage-appointments"
              element={
                <RoleRoute allow="owner">
                  <ManageAppointments />
                </RoleRoute>
              }
            />

            <Route
              path="/manage-employees"
              element={
                <RoleRoute allow="owner">
                  <ManageEmployees />
                </RoleRoute>
              }
            />

            <Route
              path="/manage-services"
              element={
                <RoleRoute allow="owner">
                  <ManageServices />
                </RoleRoute>
              }
            />

            <Route
              path="/available-times"
              element={
                <RoleRoute allow="owner">
                  <AvailableTimes />
                </RoleRoute>
              }
            />

            <Route
              path="/update-appointment/:id"
              element={
                <RoleRoute allow="owner">
                  <UpdateAppointment />
                </RoleRoute>
              }
            />

            <Route
              path="/update-slots/:id"
              element={
                <RoleRoute allow="owner">
                  <UpdateSlots />
                </RoleRoute>
              }
            />

            <Route
              path="/working-time"
              element={
                <RoleRoute allow="owner">
                  <WorkingTime />
                </RoleRoute>
              }
            />

            <Route
              path="/add-working-time"
              element={
                <RoleRoute allow="owner">
                  <AddWorkingTime />
                </RoleRoute>
              }
            />

            <Route
              path="/update-working-time/:id"
              element={
                <RoleRoute allow="owner">
                  <UpdateWorkingTime />
                </RoleRoute>
              }
            />

            <Route
              path="/customers-list"
              element={
                <RoleRoute allow="owner">
                  <CustomersList />
                </RoleRoute>
              }
            />

            <Route
              path="/bank-cards"
              element={
                <RoleRoute allow="owner">
                  <BankCards />
                </RoleRoute>
              }
            />

            <Route
              path="/manual-payments"
              element={
                <RoleRoute allow="owner">
                  <ManualPayments />
                </RoleRoute>
              }
            />

            <Route
              path="/booking-qr"
              element={
                <RoleRoute allow="owner">
                  <BookingQr />
                </RoleRoute>
              }
            />

            <Route
              path="/business-logo"
              element={
                <RoleRoute allow="owner">
                  <BusinessLogo />
                </RoleRoute>
              }
            />

            <Route
              path="/owner-appointment/:id"
              element={
                <RoleRoute allow="owner">
                  <OwnerAppointment />
                </RoleRoute>
              }
            />

            <Route
              path="/sliders"
              element={
                <RoleRoute allow="owner">
                  <Sliders />
                </RoleRoute>
              }
            />

            <Route
              path="/packages"
              element={
                <RoleRoute allow="owner">
                  <Packages />
                </RoleRoute>
              }
            />

            <Route
              path="/packages/:id"
              element={
                <RoleRoute allow="owner">
                  <PackagesInfo />
                </RoleRoute>
              }
            />

            {/* فقط superuser پلتفرم — RoleRoute/ACL داخل Users */}
            <Route path="/users" element={<Users />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </UserTypeProvider>
    </Router>
  );
};

export default AppRoutes;
