export interface PermissionsResponse {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface PermissionsRequest {
  name: string;
  code: string;
  description: string;
}

interface PermissionOptions {
  id: number;
  name: string;
  code: string;
}

export interface UsersPermissionResponse {
  id: number;
  phone_number: string;
  first_name: string;
  last_name: string;
  permissions: PermissionOptions[];
}

// export interface SingleUserPermissionsResponse {
//   id: number;
//   user: number;
//   permissions: number[];
//   permissions_display: string[];
// }

export interface UserPermissionRequest {
  user: number;
  permissions: number[];
}

export interface UserPermissionResponse {
  id: number;
  user: number;
  permissions: number[];
  permissions_display: { name: string; code: string }[];
}

export enum PermissionsList {
  USER_LIST = "user_list",
  USER_CREATE = "user_create",
  USER_EDIT = "user_edit",
  USER_DELETE = "user_delete",
  USER_CHANGE_PASSWORD = "user_change_password",
  ROLE_LIST = "role_list",
  ROLE_CREATE = "role_create",
  ROLE_EDIT = "role_edit",
  ROLE_DELETE = "role_delete",
  RESERVATIONS_LIST = "reservations_list",
  RESERVATIONS_CREATE = "reservations_create",
  RESERVATIONS_EDIT = "reservations_edit",
  RESERVATIONS_DELETE = "reservations_delete",
  REPORT_LIST = "report_list",
  REPORT_CREATE = "report_create",
  REPORT_EDIT = "report_edit",
  REPORT_DELETE = "report_delete",
  TRANSACTION_REPORT_LIST = "transaction_report_list",
  WITHDRAWAL_REPORT_LIST = "withdrawal_report_list",
  EMPLOYEE_LIST = "employee_list",
  EMPLOYEE_CREATE = "employee_create",
  EMPLOYEE_EDIT = "employee_edit",
  EMPLOYEE_DELETE = "employee_delete",
  SERVICE_LIST = "service_list",
  SERVICE_CREATE = "service_create",
  SERVICE_EDIT = "service_edit",
  SERVICE_DELETE = "service_delete",
  BUSINESS_LIST = "business_list",
  BUSINESS_CREATE = "business_create",
  BUSINESS_EDIT = "business_edit",
  BUSINESS_DELETE = "business_delete",
  WORKING_HOURS_LIST = "working_hours_list",
  WORKING_HOURS_CREATE = "working_hours_create",
  WORKING_HOURS_EDIT = "working_hours_edit",
  WORKING_HOURS_DELETE = "working_hours_delete",
  PACKAGES_LIST = "packages_list",
  PACKAGES_CREATE = "packages_create",
  PACKAGES_EDIT = "packages_edit",
  PACKAGES_DELETE = "packages_delete",
  USER_PERMISSIONS_LIST = "user_permissions_list",
  USER_PERMISSIONS_CREATE = "user_permissions_create",
  USER_PERMISSIONS_EDIT = "user_permissions_edit",
  USER_PERMISSIONS_DELETE = "user_permissions_delete",
}
