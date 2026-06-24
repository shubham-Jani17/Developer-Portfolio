import { useEffect, useState } from "react";

/** True on mobile, reduced-motion, or low-end devices — lighter visuals & animations */
function getLiteMode() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  const cores = navigator.hardwareConcurrency ?? 8;
  if (cores <= 4) return true;
  const conn = navigator.connection;
  if (conn?.saveData) return true;
  return false;
}

export default function useLiteMode() {
  const [lite, setLite] = useState(getLiteMode);

  useEffect(() => {
    const update = () => {
      const next = getLiteMode();
      setLite(next);
      document.documentElement.dataset.perf = next ? "lite" : "full";
    };
    update();

    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    mqMotion.addEventListener("change", update);
    return () => {
      mqMotion.removeEventListener("change", update);
    };
  }, []);

  return lite;
}
