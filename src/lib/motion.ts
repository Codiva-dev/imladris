import type { Transition, Variants } from "framer-motion";

/** Easing ritual compartido — un solo lenguaje de movimiento. */
export const ritualEase = [0.22, 1, 0.36, 1] as const;

export const viewTransition: Transition = {
  duration: 0.55,
  ease: ritualEase,
};

export const viewVariants: Variants = {
  initial: {
    opacity: 0,
    y: 18,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -12,
  },
};

export const veilTransition: Transition = {
  duration: 0.7,
  ease: ritualEase,
};
