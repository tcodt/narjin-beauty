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
