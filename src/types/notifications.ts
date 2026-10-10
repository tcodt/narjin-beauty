export type NotificationType =
  | "appointment_created"
  | "appointment_confirmed"
  | "appointment_canceled"
  | "appointment_reminder"
  | "new_appointment"
  | "appointment_canceled_by_customer"
  | "new_package_review"
  | "subscription_trial_ending"
  | "subscription_expired"
  | "general"
  | string;

export interface AppNotification {
  id: number;
  notification_type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  appointment: number | null;
}

export type AppNotifications = AppNotification[];

export type BroadcastTarget =
  | "all_users"
  | "all_owners"
  | "all_customers"
  | "business_customers"
  | "single_user"
  | string;

export interface BroadcastNotificationPayload {
  title: string;
  message: string;
  target: BroadcastTarget;
  business_id?: number | null;
  user_id?: number | null;
}

/** برای مسیریابی از روی نوع نوتیف */
export function isOwnerFacingNotification(type: string): boolean {
  return (
    type === "new_appointment" ||
    type === "appointment_canceled_by_customer" ||
    type === "new_package_review" ||
    type === "subscription_trial_ending" ||
    type === "subscription_expired"
  );
}

export function notificationTone(
  type: string,
): "info" | "success" | "warning" | "danger" {
  if (type.includes("confirm") || type === "appointment_confirmed")
    return "success";
  if (
    type.includes("cancel") ||
    type.includes("expired") ||
    type.includes("trial")
  )
    return "danger";
  if (
    type === "new_appointment" ||
    type.includes("created") ||
    type.includes("reminder")
  )
    return "warning";
  return "info";
}
