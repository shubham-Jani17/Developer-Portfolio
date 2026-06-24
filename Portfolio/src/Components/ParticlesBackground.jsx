import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import useLiteMode from "../hooks/useLiteMode";

/* Static gradients + grid; cursor-tracking glow + particles on desktop */
export default function BackgroundFx() {
  const lite = useLiteMode();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(157,76,221,0.18), transparent 60%), radial-gradient(ellipse 80% 50% at 80% 30%, rgba(0,229,255,0.14), transparent 65%), radial-gradient(ellipse 60% 50% at 10% 80%, rgba(0,102,255,0.14), transparent 70%)",
        }}
      />

      <div className="absolute inset-0 grid-bg opacity-60" />

      {!lite && (
        <>
          <CursorGlow />
          <div
            className="bg-blob absolute top-[10%] left-[8%] w-[320px] h-[320px] lg:w-[420px] lg:h-[420px] blob float-slow"
            style={{ background: "rgba(0,229,255,0.35)" }}
          />
          <div
            className="bg-blob absolute top-[40%] right-[5%] w-[380px] h-[380px] lg:w-[480px] lg:h-[480px] blob float-slower"
            style={{ background: "rgba(157,76,221,0.35)" }}
          />
          <ParticlesCanvas />
        </>
      )}
    </div>
  );
}

/** Large soft neon circle that follows the pointer in the background */
function CursorGlow() {
  const x = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 0);
  const y = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 0);
  const springX = useSpring(x, { stiffness: 120, damping: 24, mass: 0.55 });
  const springY = useSpring(y, { stiffness: 120, damping: 24, mass: 0.55 });

  useEffect(() => {
    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  const size = "min(95vw, 820px)";

  return (
    <>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-0 mix-blend-screen"
        style={{
          x: springX,
          y: springY,
          width: size,
          height: size,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle at center, rgba(0,229,255,0.14) 0%, rgba(157,76,221,0.08) 35%, transparent 75%)",
          filter: "blur(96px)",
          WebkitFilter: "blur(96px)",
        }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-0 mix-blend-screen"
        style={{
          x: springX,
          y: springY,
          width: "min(70vw, 560px)",
          height: "min(70vw, 560px)",
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle at center, rgba(0,229,255,0.32) 0%, rgba(157,76,221,0.18) 28%, rgba(0,102,255,0.06) 50%, transparent 70%)",
          filter: "blur(64px)",
          WebkitFilter: "blur(64px)",
        }}
        aria-hidden
      />
    </>
  );
}

function ParticlesCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;
    let particles = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(28, Math.floor((width * height) / 32000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.2 + 0.4,
        a: Math.random() * 0.35 + 0.15,
      }));
    };

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(0, 229, 255, ${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      }
    };

    resize();
    tick();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 opacity-50" />;
}
