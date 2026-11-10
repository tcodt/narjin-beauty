/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useGetPackageById } from "../../hooks/packages/useGetPackageById";
import Loading from "../../components/Loading/Loading";
import {
  HiMiniDevicePhoneMobile,
  HiOutlineBuildingOffice,
} from "react-icons/hi2";
import { GiCoffeeCup, GiRotaryPhone } from "react-icons/gi";
import { LuCircleParking } from "react-icons/lu";
import { FaInstagram } from "react-icons/fa";
import Button from "../../components/Button/Button";
import { ThemeColorName, useThemeColor } from "../../context/ThemeColor";
import CustomModal from "../../components/CustomModal/CustomModal";
import { themeText } from "../../utils/themeClasses";

const PackagesInfo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAlldesc, setShowAllDesc] = useState(false);
  const { id } = useParams<{ id: string }>();
  const packageId = Number(id);
  const { data: packageData, isPending } = useGetPackageById(packageId);
  const { themeColor } = useThemeColor();
  const navigate = useNavigate();

  if (isPending) return <Loading />;

  const formatPrice = (price: any) => {
    if (!price) return "۰";
    return new Intl.NumberFormat("fa-IR").format(Number(price));
  };

  /** کیف پول حذف شده — پرداخت فقط کارت‌به‌کارت */
  const handleGoToManualPayment = () => {
    setIsModalOpen(false);
    navigate("/submit-manual-payment");
  };

  return (
    <section>
      <div className="space-y-4">
        <div className="space-y-4 p-4">
          <div className="rounded-xl bg-white shadow-md dark:bg-gray-700">
            <img
              src={
                packageData?.image
                  ? `https://queuingprojectapi.pythonanywhere.com${packageData.image}`
                  : "/images/no-image.jpg"
              }
              alt={packageData?.name ?? "پکیج"}
              className="h-48 w-full rounded-xl object-cover"
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {packageData?.name}
          </h3>

          <p
            className={`text-sm font-medium text-gray-600 dark:text-gray-300 ${
              showAlldesc ? "line-clamp-none" : "line-clamp-3"
            }`}
            onClick={() => setShowAllDesc(!showAlldesc)}
          >
            {packageData?.desc}
          </p>

          <div className="flex items-center justify-between">
            <span
              className={`text-base font-bold ${themeText[themeColor as ThemeColorName]}`}
            >
              {formatPrice(packageData?.total_price)} تومان
            </span>
          </div>

          {/* امکانات — اگر در دیتای پکیج هست نگه دار؛ در غیر این صورت این بلوک را حذف کن */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span className="inline-flex items-center gap-2">
              <HiOutlineBuildingOffice /> سالن
            </span>
            <span className="inline-flex items-center gap-2">
              <HiMiniDevicePhoneMobile /> پشتیبانی
            </span>
            <span className="inline-flex items-center gap-2">
              <GiCoffeeCup /> پذیرایی
            </span>
            <span className="inline-flex items-center gap-2">
              <LuCircleParking /> پارکینگ
            </span>
            <span className="inline-flex items-center gap-2">
              <GiRotaryPhone /> رزرو تلفنی
            </span>
            <span className="inline-flex items-center gap-2">
              <FaInstagram /> اینستاگرام
            </span>
          </div>

          <CustomModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="خرید پکیج"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                پرداخت آنلاین و کیف پول حذف شده است. برای خرید پکیج، مبلغ را
                کارت‌به‌کارت واریز و فیش را ثبت کنید.
              </p>
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  مبلغ:{" "}
                  <span className="font-bold">
                    {formatPrice(packageData?.total_price)} تومان
                  </span>
                </p>
              </div>
              <Button type="button" onClick={handleGoToManualPayment}>
                ثبت فیش کارت‌به‌کارت
              </Button>
              <Link
                to="/home"
                className={`block text-center text-sm font-semibold underline ${themeText[themeColor as ThemeColorName]}`}
              >
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </CustomModal>

          <Button type="button" onClick={() => setIsModalOpen(true)}>
            خرید پکیج
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PackagesInfo;
