import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";

export const useHomeTour = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasSeenTour = localStorage.getItem("home-tour-seen");
    if (hasSeenTour) return;

    const timeout = setTimeout(() => {
      const requiredSelectors = ["#sidebar-toggle", "#theme-toggle", "#notif"];
      const allExist = requiredSelectors.every((sel) =>
        document.querySelector(sel),
      );
      if (!allExist) return;

      document.body.classList.add("driver-active");

      const driverObj = driver({
        animate: true,
        showProgress: true,
        allowClose: true,
        overlayOpacity: 0.55,
        stagePadding: 8,
        stageRadius: 16,
        popoverClass: "salon-driver-theme",
        progressText: "{{current}} / {{total}}",
        doneBtnText: "شروع کنید",
        prevBtnText: "قبلی",
        nextBtnText: "بعدی",
        onDestroyed: () => {
          document.body.classList.remove("driver-active");
          localStorage.setItem("home-tour-seen", "true");
        },
      });

      driverObj.setSteps([
        {
          element: "#sidebar-toggle",
          popover: {
            title: "منوی اصلی",
            description:
              "از اینجا به بخش‌های مختلف مثل خدمات، آرایشگران و تنظیمات دسترسی دارید.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#theme-toggle",
          popover: {
            title: "ظاهر برنامه",
            description:
              "حالت تاریک/روشن و رنگ تم را مطابق سلیقه خود تنظیم کنید.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#notif",
          popover: {
            title: "اعلان‌ها",
            description:
              "رزروها و پیام‌های مهم اینجا به شما اطلاع داده می‌شود.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#mobile-nav",
          popover: {
            title: "ناوبری سریع",
            description:
              "با نوار پایین صفحه، سریع بین خانه، داشبورد و بخش‌های پرکاربرد جابه‌جا شوید.",
            side: "top",
            align: "center",
          },
        },
      ]);

      driverObj.drive();
    }, 700);

    return () => {
      clearTimeout(timeout);
      document.body.classList.remove("driver-active");
      try {
        driver()?.destroy();
      } catch {
        /* ignore */
      }
    };
  }, []);
};
