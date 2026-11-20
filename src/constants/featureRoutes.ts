/**
 * Mapping بین مسیرهای فرانت و key واقعی فیچر در پنل ادمین بک‌اند.
 * فقط همین فایل key دارد.
 *
 * null = محدود به فیچر خاص نیست (فقط can_use_panel کافی است)
 */
export const FEATURE_ROUTE_MAP: Record<string, string | null> = {
  // مدیریت نوبت‌ها
  "/manage-appointments": "appointment_management",
  "/available-times": "appointment_management",
  "/working-time": "appointment_management",
  "/owner-appointment": "appointment_management",
  "/update-appointment": "appointment_management",
  "/update-slots": "appointment_management",

  // پرسنل
  "/manage-employees": "staff_management",

  // خدمات
  "/manage-services": "service_management",

  // مشتریان
  "/customers-list": "customer_management",

  // پرداخت و درآمد
  "/manual-payments": "payment_management",
  "/bank-cards": "payment_management",
  "/submit-manual-payment": "payment_management",

  // پروفایل / برند سالن
  "/business-logo": "salon_profile",
  "/sliders": "salon_profile",
  "/packages": "salon_profile",

  // رزرو آنلاین
  "/reserve": "online_booking",
  "/booking-qr": "online_booking",

  // بدون محدودیت فیچر (فقط اشتراک فعال)
  "/dashboard": null,
  "/user-profile": null,
  "/settings": null,
  "/plans": null,
  "/subscription/buy": null,
  "/users": null,
};

export function getFeatureKeyForPath(pathname: string): string | null {
  if (Object.prototype.hasOwnProperty.call(FEATURE_ROUTE_MAP, pathname)) {
    return FEATURE_ROUTE_MAP[pathname];
  }

  const sortedRoutes = Object.keys(FEATURE_ROUTE_MAP).sort(
    (a, b) => b.length - a.length,
  );

  for (const route of sortedRoutes) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return FEATURE_ROUTE_MAP[route];
    }
  }

  return null;
}

export const BACKEND_FEATURE_KEYS = [
  "responsive_access",
  "online_booking",
  "salon_profile",
  "business_analytics",
  "staff_management",
  "service_management",
  "payment_management",
  "customer_management",
  "appointment_management",
] as const;

export type BackendFeatureKey = (typeof BACKEND_FEATURE_KEYS)[number];

/** برای استفاده داخل کامپوننت‌ها بدون string پراکنده */
export const FEATURE = {
  responsive: "responsive_access",
  onlineBooking: "online_booking",
  salonProfile: "salon_profile",
  analytics: "business_analytics",
  staff: "staff_management",
  services: "service_management",
  payments: "payment_management",
  customers: "customer_management",
  appointments: "appointment_management",
} as const satisfies Record<string, BackendFeatureKey>;
