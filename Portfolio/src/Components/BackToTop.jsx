import { useEffect, useState } from "react";
import { HiArrowUp } from "react-icons/hi2";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-5 md:right-8 z-50 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-foreground backdrop-blur-md hover:bg-white/15 hover:glow-cyan transition-all"
    >
      <HiArrowUp className="h-5 w-5" />
    </button>
  );
}
