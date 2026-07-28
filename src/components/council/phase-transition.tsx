"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { ritualEase, viewTransition, viewVariants } from "@/lib/motion";

export { viewTransition, viewVariants, ritualEase };

type Props = {
  children: ReactNode;
  className?: string;
};

/** Wrap simple; prefer TransitionSlot para cambios de fase/ruta. */
export function PhaseTransition({ children, className }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.55, ease: ritualEase }}
    >
      {children}
    </motion.div>
  );
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/** Cascada dentro de una pantalla (después del velo de ruta/fase). */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? 0 : 0.65,
        delay: reduce ? 0 : delay,
        ease: ritualEase,
      }}
    >
      {children}
    </motion.div>
  );
}
