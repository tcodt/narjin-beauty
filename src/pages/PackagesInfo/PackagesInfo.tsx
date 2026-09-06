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
import { useWallet } from "../../context/WalletContext";
import { themeText } from "../../utils/themeClasses";

const PackagesInfo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [showAlldesc, setShowAllDesc] = useState<boolean>(false);
  const { id } = useParams<{ id: string }>();
  const packageId = Number(id);
  const { data: packageData, isPending } = useGetPackageById(packageId);
  const { themeColor } = useThemeColor();
  const { balance, spend } = useWallet();
  const navigate = useNavigate();

  if (isPending) return <Loading />;

  // Function to format price to Persian format
  const formatPrice = (price: any) => {
    if (!price) return "۰";
    return new Intl.NumberFormat("fa-IR").format(Number(price));
  };

  const handleRedirectToWallet = () => {
    navigate("/wallet");
  };

  return (
    <section>
      <div className="space-y-4">
        <div className="p-4 space-y-4">
          <div className="bg-white dark:bg-gray-700 rounded-xl shdaow-md">
            <img
              src={
                packageData?.image
                  ? `https://queuingprojectapi.pythonanywhere.com${packageData.image}`
                  : "/images/no-image.jpg"
              }
              alt="Packge Image"
              className="rounded-xl h-48 w-full object-cover"
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
          <ul className={`list-disc marker:text-${themeColor}-500 ms-4`}>
            {packageData?.services.map((service) => (
              <li
                key={service.id}
                className="text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                {service.name}
              </li>
            ))}
          </ul>
        </div>
        <hr className="dark:opacity-5" />
        <div className="p-4 space-y-4">
          <div className="space-y-4">
            <p className="text-base font-medium text-gray-800 flex items-center gap-2 dark:text-white">
              <HiOutlineBuildingOffice
                className={`text-2xl text-${themeColor}-500`}
              />{" "}
              {packageData?.business.name}
            </p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              <span className="text-gray-800 dark:text-gray-300">آدرس:</span>{" "}
              {packageData?.business.address}
            </p>
          </div>
          <div className="flex flex-row items-center gap-4 flex-wrap">
            {packageData?.business?.is_coffee_shop && (
              <div className="flex items-center gap-2">
                <GiCoffeeCup className={`text-2xl text-${themeColor}-500`} />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  کافی شاپ
                </p>
              </div>
            )}
            {packageData?.business?.is_parking && (
              <div className="flex items-center gap-2">
                <LuCircleParking
                  className={`text-2xl text-${themeColor}-500`}
                />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  پارکینگ
                </p>
              </div>
            )}
            <a
              href={packageData?.business?.instagram_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <FaInstagram className={`text-2xl text-${themeColor}-500`} />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                اینستاگرام
              </p>
            </a>
            <a
              href={`tel:${packageData?.business.phone_number}`}
              className="flex items-center gap-2"
            >
              <HiMiniDevicePhoneMobile
                className={`text-2xl text-${themeColor}-500`}
              />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                تماس: {packageData?.business.phone_number}
              </p>
            </a>
            <a
              href={`tel:${packageData?.business.telephone_number}`}
              className="flex items-center gap-2"
            >
              <GiRotaryPhone className={`text-2xl text-${themeColor}-500`} />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                تلفن: {packageData?.business.telephone_number}
              </p>
            </a>
          </div>
        </div>
        <hr className="dark:opacity-5" />
        <div className="flex flex-row items-center justify-between">
          <span className={`text-base font-medium text-${themeColor}-500`}>
            {formatPrice(packageData?.total_price)} تومان
          </span>

          <CustomModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setIsDone(false);
            }}
            title="تکمیل پرداخت"
          >
            <div className="space-y-6">
              {isDone ? (
                <img
                  src="/images/tick-payment.png"
                  alt="Tick Payment"
                  className="h-[250px] w-[250px] object-contain mx-auto"
                />
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <span
                      className={`bg-${themeColor}-100 ${themeText[themeColor as ThemeColorName]} rounded-full p-3 mr-3`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M17 9V7a5 5 0 00-10 0v2" />
                        <rect width="20" height="13" x="2" y="9" rx="2" />
                        <path d="M16 13a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </span>
                    <div
                      className={`${
                        Number(packageData?.total_price ?? 0) > balance
                          ? "text-red-500"
                          : "text-green-500"
                      } font-bold text-base`}
                    >
                      <span className="text-gray-800 dark:text-gray-200">
                        موجودی :{" "}
                      </span>
                      {balance.toLocaleString()} تومان
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-700 dark:text-gray-300 text-base font-medium">
                      قیمت:{" "}
                      <span className="text-gray-500 dark:text-gray-400">
                        {formatPrice(packageData?.total_price)}
                      </span>{" "}
                      تومان
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {!isDone ? (
                  <Button
                    onClick={() => {
                      setIsDone(true);
                      spend(Number(packageData?.total_price));
                    }}
                    disabled={Number(packageData?.total_price ?? 0) > balance}
                  >
                    اتمام پرداخت
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-base font-semibold text-gray-700 block mb-4 dark:text-white">
                      پرداخت با موفقیت انجام شد!
                    </p>
                    <Link
                      to="/home"
                      className={`text-${themeColor}-500 text-base font-semibold underline`}
                    >
                      صفحه اصلی
                    </Link>
                  </div>
                )}

                {Number(packageData?.total_price ?? 0) > balance && !isDone && (
                  <Button onClick={handleRedirectToWallet}>شارژ کیف پول</Button>
                )}
              </div>
            </div>
          </CustomModal>

          <Button onClick={() => setIsModalOpen(true)}>خرید پکیج</Button>
        </div>
      </div>
    </section>
  );
};

export default PackagesInfo;
