import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  MdOutlineWifiOff,
  MdOutlineWifi,
  MdOutlineRefresh,
} from "react-icons/md";
import toast from "react-hot-toast";
import Button from "../../components/Button/Button";

const OfflinePage: React.FC = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && !isRetrying) {
      const timer = setTimeout(() => navigate(-1), 1200);
      return () => clearTimeout(timer);
    }
  }, [isOnline, navigate, isRetrying]);

  const handleRetry = () => {
    setIsRetrying(true);
    if (navigator.onLine) {
      toast.success("اتصال برقرار شد!");
      setTimeout(() => navigate(-1), 500);
    } else {
      toast.error("هنوز آفلاین هستید.");
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full text-center"
      >
        {/* Icon */}
        <motion.div
          animate={
            !isOnline
              ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, -5, 0],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center mb-6"
        >
          <div
            className={`p-6 rounded-full ${
              isOnline
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-red-100 dark:bg-red-900/30"
            }`}
          >
            {isOnline ? (
              <MdOutlineWifi
                size={56}
                className="text-green-600 dark:text-green-400"
              />
            ) : (
              <MdOutlineWifiOff
                size={56}
                className="text-red-600 dark:text-red-400"
              />
            )}
          </div>
        </motion.div>

        {/* Title */}
        <h1
          className={`text-2xl font-bold mb-3 ${
            isOnline
              ? "text-green-600 dark:text-green-400"
              : "text-gray-800 dark:text-white"
          }`}
        >
          {isOnline ? "اتصال برقرار شد!" : "آفلاین"}
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {isOnline
            ? "در حال انتقال به صفحه قبلی..."
            : "اتصال اینترنت شما قطع شده است. لطفاً بررسی کنید."}
        </p>

        {/* Button */}
        {!isOnline && (
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full"
          >
            <span className="flex items-center justify-center gap-2">
              {isRetrying ? (
                <>
                  <MdOutlineRefresh size={18} className="animate-spin" />
                  در حال بررسی...
                </>
              ) : (
                <>
                  <MdOutlineRefresh size={18} />
                  تلاش مجدد
                </>
              )}
            </span>
          </Button>
        )}

        {/* Progress bar */}
        {isOnline && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1 }}
            className="mt-4 h-1 bg-green-500 rounded-full mx-auto max-w-[200px]"
          />
        )}
      </motion.div>
    </div>
  );
};

export default OfflinePage;
