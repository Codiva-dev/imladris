"use client";

import { motion, useReducedMotion } from "framer-motion";
import { veilTransition } from "@/lib/motion";

/**
 * Velo de niebla/oro al entrar en una vista.
 * Parte del lenguaje unificado de transición.
 */
export function PageVeil() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(200,169,107,0.14), transparent 65%), radial-gradient(ellipse 90% 70% at 50% 50%, rgba(21,36,30,0.55), transparent 70%)",
      }}
      initial={{ opacity: 0.85 }}
      animate={{ opacity: 0 }}
      transition={veilTransition}
    />
  );
}
