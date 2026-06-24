import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";

export default function LoadingScreen() {
  const { portfolio } = usePortfolio();
  const site = portfolio.site ?? { initials: "SJ" };
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          data-testid="loading-screen"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] } }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative flex items-center justify-center px-10 py-8 sm:px-12 sm:py-10">
              <motion.div
                className="pointer-events-none absolute inset-0 -m-10 sm:-m-12 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(0,229,255,0.5), transparent 70%)" }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
                style={{ transformOrigin: "center center" }}
                className="relative font-display font-black tracking-tight text-5xl md:text-7xl text-gradient leading-none select-none"
              >
                {site.initials}
              </motion.div>
            </div>
            <motion.div
              className="h-px w-32 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-center text-xs tracking-[0.4em] uppercase text-muted-foreground font-mono-display"
            >
              loading portfolio
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}