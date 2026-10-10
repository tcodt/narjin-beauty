import React, { useRef, useState } from "react";
import { FaCamera, FaStore } from "react-icons/fa";
import toast from "react-hot-toast";

import PageTitle from "../../components/PageTitle/PageTitle";
import Button from "../../components/Button/Button";
import Dots from "../../components/Dots/Dots";
import {
  useBusinessMe,
  useUpdateBusinessLogo,
} from "../../hooks/business/useBusinessMe";
import { mediaUrl, themeBgSoft, themeText } from "../../utils/themeClasses";
import { useThemeColor } from "../../context/ThemeColor";

const BusinessLogo: React.FC = () => {
  const { data: business, isLoading } = useBusinessMe();
  const updateMut = useUpdateBusinessLogo();
  const { themeColor } = useThemeColor();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("فقط تصویر مجاز است");
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      toast.error("حداکثر حجم ۳ مگابایت");
      return;
    }
    if (!business?.id) {
      toast.error("شناسه سالن یافت نشد");
      return;
    }
    setPreview(URL.createObjectURL(f));
    updateMut.mutate(f, {
      onSettled: () => {
        if (fileRef.current) fileRef.current.value = "";
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Dots />
      </div>
    );
  }

  const currentLogo = preview || mediaUrl(business?.logo);

  return (
    <div className="mx-auto max-w-md space-y-5 p-4 pb-24">
      <div>
        <PageTitle title="لوگوی سالن" />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          این لوگو در مرکز کد QR رزرو نمایش داده می‌شود
        </p>
      </div>

      <div className="flex flex-col items-center gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="relative">
          <div
            className={`flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-md ${themeBgSoft[themeColor]}`}
          >
            {business?.logo || preview ? (
              <img
                src={currentLogo}
                alt="لوگو"
                className="h-full w-full object-cover"
              />
            ) : (
              <FaStore size={36} className={themeText[themeColor]} />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={updateMut.isPending || !business?.id}
            className={`absolute bottom-0 left-0 flex h-9 w-9 items-center justify-center rounded-full bg-${themeColor}-500 text-white shadow-md disabled:opacity-50`}
            aria-label="تغییر لوگو"
          >
            <FaCamera size={14} />
          </button>
        </div>

        <div className="text-center">
          <p className="font-semibold text-gray-900 dark:text-white">
            {business?.name ?? "سالن شما"}
          </p>
          <p className="text-xs text-gray-500" dir="ltr">
            id: {business?.id} · code: {business?.random_code}
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />

        <Button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={updateMut.isPending || !business?.id}
        >
          {updateMut.isPending ? "در حال آپلود..." : "انتخاب / تغییر لوگو"}
        </Button>
      </div>
    </div>
  );
};

export default BusinessLogo;
