import { motion } from "framer-motion";

export default function ProxyErrorSymbol() {
  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 100 100"
      className="w-24 h-24 sm:w-28 sm:h-28 mb-6 drop-shadow-[0_8px_16px_rgba(239,68,68,0.25)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Red gradient fill */}
        <linearGradient id="red-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>

      {/* Outer rounded red triangle */}
      <motion.path
        d="M 45 15 C 47 11 53 11 55 15 L 88 73 C 90 77 87 83 82 83 L 18 83 C 13 83 10 77 12 73 Z"
        fill="url(#red-gradient)"
        stroke="#ef4444"
        strokeWidth="1.5"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", damping: 15 }}
      />

      {/* Inner white warning line */}
      <motion.path
        d="M 46 24 C 48 21 52 21 54 24 L 79 69 C 81 72 79 77 75 77 L 25 77 C 21 77 19 72 21 69 Z"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
      />

      {/* White Exclamation mark */}
      {/* Line */}
      <motion.path
        d="M 50 34 L 50 56"
        stroke="#ffffff"
        strokeWidth="7"
        strokeLinecap="round"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        style={{ originY: 0 }}
        transition={{ duration: 0.4, delay: 0.9, ease: "easeOut" }}
      />
      {/* Dot */}
      <motion.circle
        cx="50"
        cy="68"
        r="4.5"
        fill="#ffffff"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 1.2, type: "spring", stiffness: 200 }}
      />
    </svg>
  );
}
