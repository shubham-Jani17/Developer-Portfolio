import { AnimatePresence, motion } from "framer-motion";
import { usePortfolio } from "../context/PortfolioContext";

export default function OverlayMenu({ open, onClose, onNavigate }) {
  const { portfolio } = usePortfolio();
  const navLinks = portfolio.navLinks ?? [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={onClose}
          />
          <motion.nav
            className="absolute left-3 right-3 top-[4.5rem] sm:top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border border-white/10 p-5 sm:p-6 flex flex-col gap-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(32,22,52,0.98) 50%, rgba(14,24,42,0.98) 100%)",
            }}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <ul className="flex flex-col gap-1">
              {navLinks.map(({ id, label }) => (
                <li key={id}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 rounded-xl text-white font-medium hover:bg-white/10 transition-colors"
                    onClick={() => onNavigate(id)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => onNavigate("contact")}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900"
            >
              Let&apos;s talk
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            </button>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
