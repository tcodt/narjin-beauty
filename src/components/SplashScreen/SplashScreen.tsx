import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useThemeColor } from "../../context/ThemeColor";
import { logoMap } from "../../utils/logoMap";
import { motion, AnimatePresence } from "framer-motion";

// Define the type for theme colors
type ThemeColorType =
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "orange"
  | "primary-green";

interface ColorShades {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

const colorMap: Record<ThemeColorType, ColorShades> = {
  blue: {
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  green: {
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  purple: {
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7c2ae8",
    800: "#6b21a8",
    900: "#581c87",
  },
  red: {
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
  orange: {
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },
  "primary-green": {
    100: "#d1f0e8",
    200: "#a3e0d1",
    300: "#75d1ba",
    400: "#47c1a3",
    500: "#19705D", // base color
    600: "#14584b",
    700: "#0f4038",
    800: "#0a2826",
    900: "#051013",
  },
};

const SplashScreen: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();
  const { themeColor } = useThemeColor();

  const logoSrc = logoMap[themeColor] || "/images/logo-main.jpg";

  // Safely get colors with type assertion
  const colors =
    colorMap[themeColor as ThemeColorType] || colorMap["primary-green"];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setTimeout(() => {
        navigate(token ? "/dashboard" : "/auth");
      }, 800);
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate, token]);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splash"
          className="flex items-center justify-center h-screen w-screen fixed top-0 left-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                `linear-gradient(45deg, ${colors[400]}, ${colors[600]}, ${colors[300]})`,
                `linear-gradient(135deg, ${colors[600]}, ${colors[400]}, ${colors[500]})`,
                `linear-gradient(225deg, ${colors[500]}, ${colors[300]}, ${colors[600]})`,
                `linear-gradient(315deg, ${colors[300]}, ${colors[600]}, ${colors[400]})`,
                `linear-gradient(45deg, ${colors[400]}, ${colors[600]}, ${colors[300]})`,
              ],
            }}
            transition={{
              duration: 8,
              ease: "linear",
              repeat: Infinity,
            }}
            style={{
              backgroundSize: "400% 400%",
            }}
          />

          {/* Wave effect overlay */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            }}
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            }}
          />

          {/* Logo */}
          <motion.img
            src={logoSrc}
            alt="Logo"
            className="w-44 h-44 object-contain rounded-full border-4 shadow-xl relative z-10"
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{
              scale: [1.2, 1],
              rotate: 0,
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 120,
                damping: 10,
                duration: 1.2,
              },
            }}
            exit={{
              scale: 0.5,
              opacity: 0,
              transition: { duration: 0.6, ease: "easeInOut" },
            }}
            style={{
              borderColor: colors[500],
              boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
