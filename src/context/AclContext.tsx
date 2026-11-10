/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { useGetProfile } from "../hooks/profile/useGetProfile";
import { useGetUserPermissionsById } from "../hooks/permissions/useGetUserPermissionsById";
import { useBusinessMe } from "../hooks/business/useBusinessMe";
import { useUserType } from "./UserTypeContext";
import { PermissionsList } from "../types/permissions";

interface AclContextType {
  userPermissions: string[];
  hasPermission: (permission: string | PermissionsList) => boolean;
  role: "admin" | "employee" | "normal-user";
  isOwner: boolean;
  isSuperuser: boolean;
  isLoading: boolean;
  /** True when this account runs a business panel (salon owner) */
  isBusinessOwner: boolean;
}

export interface AclProviderProps {
  children: ReactNode;
  userId: number | null;
}

const AclContext = createContext<AclContextType | undefined>(undefined);

const ADMIN_PERMISSIONS: string[] = Object.values(PermissionsList);

export const AclProvider: React.FC<AclProviderProps> = ({
  children,
  userId,
}) => {
  const { data: userInfo, isLoading: profileLoading } = useGetProfile();
  const { userType } = useUserType();

  // Only fetch business-me when user might be an owner
  const shouldCheckBusiness =
    !!userInfo?.is_owner || userType === "owner" || userType === null;

  const {
    data: businessMe,
    isLoading: businessLoading,
    isSuccess: hasBusiness,
  } = useBusinessMe();

  const { data: userPermissionData, isLoading: permissionsLoading } =
    useGetUserPermissionsById(userId ?? 0);

  const isOwnerFlag = !!userInfo?.is_owner;
  const isSuperuser = !!userInfo?.is_superuser;

  /**
   * صاحب سالن واقعی.
   * مهم: isSuperuser را اینجا قاطی نکن.
   * قبلاً isSuperuser هم isBusinessOwner می‌شد → Users از سایدبار حذف می‌شد.
   */
  const isBusinessOwner =
    isOwnerFlag || (hasBusiness && businessMe?.is_active !== false);

  /**
   * دسترسی کامل پنل سالن (صاحب کسب‌وکار).
   * سوپریوزر پلتفرم جدا است و از isSuperuser کنترل می‌شود.
   */
  const isSalonAdmin = isBusinessOwner;

  const userPermissions = useMemo<string[]>(() => {
    // سوپریوزر پلتفرم → همه پرمیشن‌ها
    if (isSuperuser) return ADMIN_PERMISSIONS;

    // صاحب سالن → همه پرمیشن‌های پنل سالن
    if (isSalonAdmin) return ADMIN_PERMISSIONS;

    if (userPermissionData?.permissions_display?.length) {
      return userPermissionData.permissions_display.map((p) => p.code);
    }

    if (Array.isArray((userPermissionData as any)?.permissions)) {
      return (userPermissionData as any).permissions
        .map((p: any) => (typeof p === "string" ? p : p?.code))
        .filter(Boolean);
    }

    return [];
  }, [isSuperuser, isSalonAdmin, userPermissionData]);

  const role = useMemo<"admin" | "employee" | "normal-user">(() => {
    if (isSuperuser || isSalonAdmin) return "admin";
    if (userPermissions.length > 0) return "employee";
    return "normal-user";
  }, [isSuperuser, isSalonAdmin, userPermissions.length]);

  const hasPermission = (permission: string | PermissionsList) => {
    if (isSuperuser || isSalonAdmin) return true;
    return userPermissions.includes(permission);
  };

  const isLoading =
    profileLoading ||
    (shouldCheckBusiness && businessLoading) ||
    (!!userId && permissionsLoading);

  const value: AclContextType = {
    userPermissions,
    hasPermission,
    role,
    isOwner: isOwnerFlag || hasBusiness,
    isSuperuser,
    isLoading,
    isBusinessOwner,
  };

  return <AclContext.Provider value={value}>{children}</AclContext.Provider>;
};

export const useAcl = () => {
  const context = useContext(AclContext);
  if (!context) {
    throw new Error("useAcl must be used within AclProvider");
  }
  return context;
};

/** Safe outside PrivateRoutes (onboarding / UserFlow) */
export const useAclOptional = () => useContext(AclContext);
