/**
 * Mapping مسیر فرانت → کلید فیچر بک‌اند
 * کلیدها باید دقیقاً با key برگشتی از /access/ یکی باشند.
 */
export const FEATURE_ROUTE_MAP: Record<string, string | null> = {
  // مدیریت نوبت‌ها
  "/manage-appointments": "appointments", // یا appointment_management — با بک‌اند چک کنید
  "/available-times": "appointments",
  "/working-time": "appointments",
  "/owner-appointment": "appointments",
  "/update-appointment": "appointments",
  "/update-slots": "appointments",

  // پرسنل
  "/manage-employees": "employees",

  // خدمات
  "/manage-services": "services",

  // مشتریان
  "/customers-list": "customers",

  // پرداخت
  "/manual-payments": "payments",
  "/bank-cards": "payments",
  "/submit-manual-payment": "payments",

  // پروفایل سالن
  "/business-logo": "salon_profile",
  "/sliders": "salon_profile",
  "/packages": "packages",

  // رزرو آنلاین
  "/reserve": "online_booking",
  "/booking-qr": "online_booking",

  // بدون محدودیت فیچر
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

/** برای استفاده در کامپوننت‌ها — فقط کلیدهایی که بک‌اند واقعاً برمی‌گرداند */
export const FEATURE = {
  employees: "employees",
  packages: "packages",
  services: "services",
  customers: "customers",
  appointments: "appointments",
  payments: "payments",
  salonProfile: "salon_profile",
  onlineBooking: "online_booking",
} as const;
