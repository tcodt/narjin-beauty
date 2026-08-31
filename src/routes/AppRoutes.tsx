import React from "react";
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
import NotFound from "../pages/NotFound/NotFound";
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

/* -------------------------------------------------------------------------- */
/* Network wrapper                                                            */
/* -------------------------------------------------------------------------- */

const NetworkStatusWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useNetworkStatus();
  return <>{children}</>;
};

const PostAuthRedirect: React.FC = () => {
  const { userType, isReady } = useUserType();
  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Dots />
      </div>
    );
  }
  if (!userType) return <Navigate to="/role-authentication" replace />;
  if (userType === "owner") return <Navigate to="/dashboard" replace />;
  return <Navigate to="/home" replace />;
};

/* -------------------------------------------------------------------------- */
/* Onboarding-only guard (UserFlow)                                           */
/* -------------------------------------------------------------------------- */

/**
 * UserFlow is ONLY for first-time registration after auth.
 * Returning users who already have userType / joinedBusiness
 * cannot open role-auth / create-business / random-code-input.
 */
const OnboardingOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { userType, isReady } = useUserType();
  const location = useLocation();

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

  const hasJoinedSalon = !!localStorage.getItem("joinedBusiness");
  const profileOwner = !!(user as { is_owner?: boolean } | null)?.is_owner;

  // Always allow role selection when role is missing
  if (location.pathname === "/role-authentication") {
    // Only skip if they already finished a full path
    if (userType === "customer" && hasJoinedSalon) {
      return <Navigate to="/home" replace />;
    }
    if (userType === "owner" && profileOwner) {
      return <Navigate to="/dashboard" replace />;
    }
    // New users (or role not chosen) stay here
    return <>{children}</>;
  }

  // create-business only after choosing owner
  if (location.pathname === "/create-business") {
    if (!userType) {
      return <Navigate to="/role-authentication" replace />;
    }
    if (userType === "customer") {
      return <Navigate to="/random-code-input" replace />;
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

          {/* ===================== ONBOARDING (new users only) ===================== */}
          {/*
            UserFlow shell + OnboardingOnly:
            - /role-authentication
            - /create-business
            - /random-code-input  ← registration code ONLY
            Registered customers must use /join-salon instead.
          */}
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

          {/* ===================== WAITING ROOM (owner pending) ===================== */}
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

          {/* ===================== AUTHENTICATED APP ===================== */}
          <Route
            element={
              <PrivateRoutes>
                <BusinessStatusGuard>
                  <NetworkStatusWrapper>
                    <MainLayout />
                  </NetworkStatusWrapper>
                </BusinessStatusGuard>
              </PrivateRoutes>
            }
          >
            {/* Customer home */}
            <Route
              path="/home"
              element={
                <RoleRoute allow="customer">
                  <HomePage />
                </RoleRoute>
              }
            />

            {/*
              Registered users: enter / change salon code here.
              NOT the registration random-code-input page.
            */}
            <Route
              path="/join-salon"
              element={
                <RoleRoute allow="customer">
                  <JoinSalon />
                </RoleRoute>
              }
            />

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

            <Route path="/view-appointment/:id" element={<ViewAppointment />} />
            <Route path="/wallet" element={<Wallet />} />

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
              element={<UpdateAppointment />}
            />
            <Route path="/update-slots/:id" element={<UpdateSlots />} />
            <Route path="/working-time" element={<WorkingTime />} />
            <Route path="/add-working-time" element={<AddWorkingTime />} />

            <Route
              path="/sliders"
              element={
                <RoleRoute allow="owner">
                  <Sliders />
                </RoleRoute>
              }
            />

            <Route path="/users" element={<Users />} />
            <Route
              path="/update-working-time/:id"
              element={<UpdateWorkingTime />}
            />

            <Route
              path="/packages"
              element={
                <RoleRoute allow="owner">
                  <Packages />
                </RoleRoute>
              }
            />
            <Route path="/packages/:id" element={<PackagesInfo />} />
            <Route path="/logout" element={<Logout />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </UserTypeProvider>
    </Router>
  );
};

export default AppRoutes;
