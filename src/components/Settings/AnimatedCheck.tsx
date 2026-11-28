import React from "react";
import { motion } from "framer-motion";

export const AnimatedCheck: React.FC = () => (
  <motion.svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    initial="hidden"
    animate="visible"
    aria-hidden="true"
  >
    <motion.path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={{
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
          pathLength: 1,
          opacity: 1,
          transition: { duration: 0.4, ease: "easeOut" },
        },
      }}
    />
  </motion.svg>
);
