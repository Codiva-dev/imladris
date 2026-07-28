"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Fondo atmosférico: niebla + estrellas lentas. No es 3D ornamental. */
export function MistBackground() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-forest" />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(79,122,99,0.45), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(32,55,46,0.9), transparent), linear-gradient(180deg, #1a2e26 0%, #20372E 45%, #162821 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {!reduce &&
        STARS.map((star) => (
          <motion.span
            key={star.id}
            className="absolute rounded-full bg-parchment"
            style={{
              width: star.size,
              height: star.size,
              left: star.left,
              top: star.top,
              opacity: star.opacity,
            }}
            animate={{ opacity: [star.opacity, star.opacity * 0.35, star.opacity] }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: star.delay,
            }}
          />
        ))}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-forest to-transparent" />
    </div>
  );
}

const STARS = [
  { id: 1, left: "12%", top: "18%", size: 2, opacity: 0.45, duration: 7, delay: 0 },
  { id: 2, left: "28%", top: "12%", size: 1.5, opacity: 0.35, duration: 9, delay: 1.2 },
  { id: 3, left: "48%", top: "22%", size: 2, opacity: 0.5, duration: 8, delay: 0.4 },
  { id: 4, left: "67%", top: "14%", size: 1.5, opacity: 0.3, duration: 10, delay: 2 },
  { id: 5, left: "82%", top: "26%", size: 2.5, opacity: 0.4, duration: 6.5, delay: 0.8 },
  { id: 6, left: "18%", top: "38%", size: 1.5, opacity: 0.25, duration: 11, delay: 1.5 },
  { id: 7, left: "55%", top: "8%", size: 1.5, opacity: 0.35, duration: 8.5, delay: 2.4 },
  { id: 8, left: "90%", top: "40%", size: 2, opacity: 0.3, duration: 9.5, delay: 0.2 },
];
