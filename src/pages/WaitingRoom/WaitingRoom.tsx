import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSpinner,
  FaClock,
  FaStore,
  FaCheckCircle,
  FaTimesCircle,
  FaBuilding,
  FaPhone,
  FaMapMarkerAlt,
  FaHashtag,
  FaUserClock,
  FaUsers,
  FaCheck,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useBusinessMe } from "../../hooks/business/useBusinessMe";

interface WaitingRoomProps {
  estimatedTime?: number;
  position?: number;
  totalAhead?: number;
  onCancel?: () => void;
  onNavigateToDashboard?: () => void;
  onRetry?: () => void;
}

type StatusType =
  | "loading"
  | "error"
  | "pending"
  | "reviewing"
  | "approved"
  | "rejected";

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  salon: "سالن زیبایی",
  barbershop: "آرایشگاه مردانه",
  spa: "اسپا",
  clinic: "کلینیک",
  gym: "باشگاه ورزشی",
  male_salon: "آرایشگاه مردانه",
  female_salon: "سالن زیبایی زنانه",
};

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  estimatedTime = 24,
  position = 3,
  totalAhead = 5,
}) => {
  const { data: businessData, isLoading, error } = useBusinessMe();

  const [timeLeft, setTimeLeft] = useState(estimatedTime);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleGoToDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ["business-me"] });
    navigate("/dashboard");
  };

  const handleRetry = () => {
    navigate("/create-business");
  };

  // Derive Current Status
  const currentStatus = useMemo<StatusType>(() => {
    if (isLoading) return "loading";
    if (error) return "error";
    if (!businessData) return "pending";

    // BusinessResponse uses is_active flag
    if (businessData.is_active === true) return "approved";

    // If there's no explicit status field, we can infer from is_active
    // You might want to add additional logic here based on your backend
    return "pending";
  }, [isLoading, error, businessData]);

  // Handle waiting timer progress
  useEffect(() => {
    if (currentStatus !== "pending") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 0.01));
      setProgress((prev) => Math.min(100, prev + 0.01));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-primary-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <FaTimesCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            خطا در دریافت اطلاعات
          </h3>
          <p className="text-gray-600 mb-6">
            مشکلی در دریافت اطلاعات کسب‌وکار شما وجود دارد
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-primary-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="bg-gradient-to-br from-primary-green-50 via-emerald-50 to-teal-50 flex items-center justify-center min-h-screen"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="w-full max-w-2xl max-h-screen overflow-y-auto
    [-webkit-overflow-scrolling:touch]
    [scrollbar-width:none]
    [&::-webkit-scrollbar]:hidden"
        >
          <div className="bg-white shadow-2xl overflow-hidden">
            {/* Header - Fixed height, no scroll */}
            <div className="bg-gradient-to-r from-primary-green-600 via-primary-green-500 to-emerald-600 p-6 sm:p-8 text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                  {currentStatus === "approved" ? (
                    <FaCheck className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  ) : (
                    <FaSpinner className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-spin" />
                  )}
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                {currentStatus === "approved"
                  ? "تبریک! کسب‌وکار شما تأیید شد"
                  : "در انتظار تأیید کسب‌وکار"}
              </h2>
              <p className="text-white/90 text-base sm:text-lg">
                {businessData?.name || "کسب‌وکار شما"}
              </p>
              {businessData?.random_code && (
                <p className="text-white/70 text-sm mt-1">
                  کد: {businessData.random_code}
                </p>
              )}
            </div>

            {/* Content - Scrollable */}
            <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              {/* Status Badge */}
              <StatusBadge
                status={currentStatus}
                businessId={businessData?.id}
              />

              {/* Business Info - Collapsible/Compact */}
              {businessData && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaStore className="text-primary-green-500" />
                    اطلاعات کسب‌وکار
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <BusinessDetailItem
                      icon={FaStore}
                      title="نام"
                      value={businessData.name}
                    />
                    <BusinessDetailItem
                      icon={FaHashtag}
                      title="شناسه"
                      value={businessData.slug}
                    />
                    <BusinessDetailItem
                      icon={FaBuilding}
                      title="نوع"
                      value={
                        BUSINESS_TYPE_LABELS[businessData.business_type] ||
                        businessData.business_type
                      }
                    />
                    <BusinessDetailItem
                      icon={FaMapMarkerAlt}
                      title="آدرس"
                      value={businessData.address}
                    />
                    <BusinessDetailItem
                      icon={FaPhone}
                      title="شماره تماس"
                      value={businessData.phone_number}
                    />
                  </div>
                </div>
              )}

              {/* Pending Progress */}
              {currentStatus === "pending" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        زمان تقریبی بررسی
                      </span>
                      <span className="text-sm font-bold text-primary-green-600">
                        {Math.ceil(timeLeft)} ساعت
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-green-500 to-emerald-500 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary-green-50 rounded-xl p-3 sm:p-4 text-center border border-primary-green-100">
                      <div className="flex items-center justify-center gap-2">
                        <FaUserClock className="text-primary-green-500 text-xl" />
                        <div className="text-2xl font-bold text-primary-green-600">
                          {position}
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">
                        موقعیت شما در صف
                      </div>
                    </div>
                    <div className="bg-primary-green-50 rounded-xl p-3 sm:p-4 text-center border border-primary-green-100">
                      <div className="flex items-center justify-center gap-2">
                        <FaUsers className="text-primary-green-500 text-xl" />
                        <div className="text-2xl font-bold text-primary-green-600">
                          {totalAhead}
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">
                        کسب‌وکارهای قبل از شما
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Approved View */}
              {currentStatus === "approved" && (
                <button
                  onClick={handleGoToDashboard}
                  className="w-full bg-gradient-to-r from-primary-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow text-sm sm:text-base"
                >
                  ورود به پنل مدیریت کسب‌وکار
                </button>
              )}
              {currentStatus === "rejected" && (
                <button
                  onClick={handleRetry}
                  className="w-full bg-gradient-to-r from-primary-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow text-sm sm:text-base"
                >
                  ثبت مجدد درخواست
                </button>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3" dir="rtl">
                {/* Actions can be uncommented when needed */}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Helper Components
const BusinessDetailItem: React.FC<{
  icon: React.ElementType;
  title: string;
  value?: string;
}> = ({ icon: Icon, title, value }) => (
  <div className="flex items-center gap-2 p-1.5">
    <Icon className="text-primary-green-500 text-base sm:text-lg flex-shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-sm font-semibold text-gray-800 truncate">
        {value || "-"}
      </p>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: StatusType; businessId?: number }> = ({
  status,
  businessId,
}) => {
  const configs = {
    pending: {
      icon: <FaClock className="text-yellow-500 text-xl sm:text-2xl" />,
      title: "در انتظار تأیید",
      desc: "کسب‌وکار شما در صف بررسی قرار دارد",
      style: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-700",
    },
    approved: {
      icon: <FaCheckCircle className="text-green-500 text-xl sm:text-2xl" />,
      title: "تأیید شد",
      desc: "کسب‌وکار شما با موفقیت تأیید شد",
      style: "bg-green-50 border-green-200",
      textColor: "text-green-700",
    },
    rejected: {
      icon: <FaTimesCircle className="text-red-500 text-xl sm:text-2xl" />,
      title: "رد شده",
      desc: "درخواست شما تایید نشد",
      style: "bg-red-50 border-red-200",
      textColor: "text-red-700",
    },
    reviewing: {
      icon: <FaClock className="text-blue-500 text-xl sm:text-2xl" />,
      title: "در حال بررسی",
      desc: "کارشناسان در حال بررسی هستند",
      style: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700",
    },
    loading: {
      icon: (
        <FaSpinner className="text-primary-green-500 animate-spin text-xl sm:text-2xl" />
      ),
      title: "بارگذاری",
      desc: "در حال دریافت اطلاعات...",
      style: "bg-primary-green-50 border-primary-green-200",
      textColor: "text-primary-green-700",
    },
    error: {
      icon: <FaTimesCircle className="text-red-500 text-xl sm:text-2xl" />,
      title: "خطا",
      desc: "مشکل در دریافت داده",
      style: "bg-red-50 border-red-200",
      textColor: "text-red-700",
    },
  };

  const current = configs[status] || configs.pending;

  return (
    <div
      className={`${current.style} border-2 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4`}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex-shrink-0">{current.icon}</div>
        <div className="text-right">
          <span className={`font-semibold block ${current.textColor}`}>
            {current.title}
          </span>
          <span className="text-xs sm:text-sm text-gray-600">
            {current.desc}
          </span>
        </div>
      </div>
      {businessId && (
        <span className="text-xs sm:text-sm text-gray-400 font-mono bg-white/50 px-3 py-1 rounded-full">
          #{businessId}
        </span>
      )}
    </div>
  );
};

export default WaitingRoom;
