// src/context/AclContext.tsx
import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { useGetProfile } from "../hooks/profile/useGetProfile";
import { useGetUserPermissionsById } from "../hooks/permissions/useGetUserPermissionsById";
import { useBusinessMe } from "../hooks/business/useBusinessMe";
import { useUserType } from "./UserTypeContext";
import { useFeatures } from "../hooks/subscription/useFeature";
import {
  PermissionsList,
  type UserPermissionResponse,
} from "../types/permissions";

interface AclContextType {
  userPermissions: string[];
  hasPermission: (permission: string | PermissionsList) => boolean;
  role: "admin" | "employee" | "normal-user";
  isOwner: boolean;
  isSuperuser: boolean;
  isLoading: boolean;
  isBusinessOwner: boolean;
}

export interface AclProviderProps {
  children: ReactNode;
  userId: number | null;
}

const AclContext = createContext<AclContextType | undefined>(undefined);

const extractPermissionCodes = (
  data: UserPermissionResponse | undefined,
): string[] => {
  if (!data) return [];

  if (
    Array.isArray(data.permissions_display) &&
    data.permissions_display.length > 0
  ) {
    return data.permissions_display
      .map((p) => p.code)
      .filter((code): code is string => Boolean(code));
  }

  return [];
};

export const AclProvider: React.FC<AclProviderProps> = ({
  children,
  userId,
}) => {
  const { data: userInfo, isLoading: profileLoading } = useGetProfile();
  const { userType } = useUserType();

  const isOwnerFlag = !!userInfo?.is_owner;
  const isSuperuser = !!userInfo?.is_superuser;

  const shouldCheckBusiness =
    isOwnerFlag || userType === "owner" || userType === null;

  const {
    data: businessMe,
    isLoading: businessLoading,
    isSuccess: hasBusiness,
  } = useBusinessMe();

  const isBusinessOwner =
    isOwnerFlag || (hasBusiness && businessMe?.is_active !== false);

  // ACL کلاسیک فقط برای کارمند (نه owner)
  const { data: userPermissionData, isLoading: permissionsLoading } =
    useGetUserPermissionsById(
      !isBusinessOwner && !isSuperuser && userId ? userId : 0,
    );

  // فیچر/پرمیشن اشتراک فقط برای صاحب سالن
  const {
    permissions: subscriptionPermissions,
    isLoading: featuresLoading,
    panelOk,
  } = useFeatures(isBusinessOwner && !isSuperuser);

  const userPermissions = useMemo<string[]>(() => {
    if (isSuperuser) return Object.values(PermissionsList);

    if (isBusinessOwner) {
      return subscriptionPermissions;
    }

    return extractPermissionCodes(userPermissionData);
  }, [
    isSuperuser,
    isBusinessOwner,
    subscriptionPermissions,
    userPermissionData,
  ]);

  const role = useMemo<"admin" | "employee" | "normal-user">(() => {
    if (isSuperuser || isBusinessOwner) return "admin";
    if (userPermissions.length > 0) return "employee";
    return "normal-user";
  }, [isSuperuser, isBusinessOwner, userPermissions.length]);

  const hasPermission = (permission: string | PermissionsList): boolean => {
    if (isSuperuser) return true;

    if (isBusinessOwner) {
      if (!panelOk) return false;
      return userPermissions.includes(permission);
    }

    return userPermissions.includes(permission);
  };

  const isLoading =
    profileLoading ||
    (shouldCheckBusiness && businessLoading) ||
    (isBusinessOwner && featuresLoading) ||
    (!isBusinessOwner && !!userId && permissionsLoading);

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

export const useAclOptional = () => useContext(AclContext);
