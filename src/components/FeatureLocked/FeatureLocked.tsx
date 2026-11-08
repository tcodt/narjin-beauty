import React from "react";
import { useNavigate } from "react-router";
import { LuLock } from "react-icons/lu";
import Button from "../Button/Button";
import { useThemeColor } from "../../context/ThemeColor";
import { themeBgSolid } from "../../utils/themeClasses";

interface Props {
  title?: string;
  description?: string;
}

const FeatureLocked: React.FC<Props> = ({
  title = "این قابلیت در پلن فعلی فعال نیست",
  description = "برای استفاده از این بخش، پلن مناسب را انتخاب و پس از تأیید پرداخت استفاده کنید.",
}) => {
  const navigate = useNavigate();
  const { themeColor } = useThemeColor();

  return (
    <section
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center dark:border-gray-600"
      role="status"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <LuLock size={24} />
      </div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
        {description}
      </p>
      <Button
        className={themeBgSolid[themeColor]}
        onClick={() => navigate("/plans")}
      >
        مشاهده پلن‌ها
      </Button>
    </section>
  );
};

export default FeatureLocked;
