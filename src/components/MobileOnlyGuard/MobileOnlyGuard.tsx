import React, { useEffect, useState } from "react";
import { HiDevicePhoneMobile } from "react-icons/hi2";

const BREAKPOINT = 768; // md

const MobileOnlyGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    const check = () => setIsLarge(window.innerWidth >= BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isLarge) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-primary-green-50 to-white px-6 text-center dark:from-gray-900 dark:to-gray-950">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-green-100 shadow-inner dark:bg-primary-green-900/40">
        <HiDevicePhoneMobile className="h-12 w-12 text-primary-green-600 dark:text-primary-green-300" />
      </div>
      <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
        فقط روی موبایل در دسترس است
      </h1>
      <p className="max-w-md text-sm leading-7 text-gray-600 dark:text-gray-300">
        اپلیکیشن نارژین برای تجربهٔ بهتر روی گوشی هوشمند طراحی شده است. لطفاً با
        موبایل وارد شوید یا عرض پنجره را کوچک‌تر کنید.
      </p>
      <p className="mt-6 text-xs text-gray-400">
        حداکثر عرض پشتیبانی‌شده: {BREAKPOINT - 1}px
      </p>
    </div>
  );
};

export default MobileOnlyGuard;
