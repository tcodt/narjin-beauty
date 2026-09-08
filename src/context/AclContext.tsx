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
  /** True when this account runs a business panel */
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

  // Owner if flag OR they actually have a business OR chose owner flow
  const isBusinessOwner =
    isSuperuser || // فقط ادمین پلتفرم اگر لازم است
    (hasBusiness && businessMe?.is_active !== false);

  const isAdmin = isBusinessOwner;

  const userPermissions = useMemo<string[]>(() => {
    if (isAdmin) return ADMIN_PERMISSIONS;

    if (userPermissionData?.permissions_display?.length) {
      return userPermissionData.permissions_display.map((p) => p.code);
    }

    if (Array.isArray((userPermissionData as any)?.permissions)) {
      return (userPermissionData as any).permissions
        .map((p: any) => (typeof p === "string" ? p : p?.code))
        .filter(Boolean);
    }

    return [];
  }, [isAdmin, userPermissionData]);

  const role = useMemo<"admin" | "employee" | "normal-user">(() => {
    if (isAdmin) return "admin";
    if (userPermissions.length > 0) return "employee";
    return "normal-user";
  }, [isAdmin, userPermissions.length]);

  const hasPermission = (permission: string | PermissionsList) => {
    if (isAdmin) return true;
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
