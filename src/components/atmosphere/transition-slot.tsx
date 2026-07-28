"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { PageVeil } from "@/components/atmosphere/page-veil";
import { viewTransition, viewVariants } from "@/lib/motion";

type Props = {
  /** Clave que dispara la transición (phase, pathname, …). */
  transitionKey: string;
  children: ReactNode;
  className?: string;
  /** Evita animar el primer paint (fase dentro de una ruta ya animada). */
  skipInitial?: boolean;
};

/**
 * Slot unificado: fade/lift + PageVeil al entrar.
 * Usado en cambios de fase y de ruta.
 */
export function TransitionSlot({
  transitionKey,
  children,
  className,
  skipInitial = false,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={skipInitial ? false : !reduce}>
      <motion.div
        key={transitionKey}
        className={className ?? "relative z-10 min-h-dvh"}
        variants={reduce ? undefined : viewVariants}
        initial={reduce ? false : "initial"}
        animate="animate"
        exit={reduce ? undefined : "exit"}
        transition={reduce ? { duration: 0 } : viewTransition}
      >
        <PageVeil />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
