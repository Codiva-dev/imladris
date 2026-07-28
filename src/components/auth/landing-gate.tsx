"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Reveal } from "@/components/council/phase-transition";

/** Landing pública: marca + iniciar sesión. Sin convocatoria. */
export function LandingGate() {
  const reduce = useReducedMotion();

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <Reveal delay={0.05}>
        <motion.div
          className="mb-6"
          initial={reduce ? false : { opacity: 0, scale: 0.85, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: reduce ? 0 : 1,
            ease: [0.22, 1, 0.36, 1],
            delay: reduce ? 0 : 0.1,
          }}
        >
          <Logo size="lg" withWordmark />
        </motion.div>
      </Reveal>

      <Reveal delay={0.28}>
        <h1 className="font-display text-parchment text-4xl sm:text-5xl leading-[1.15] max-w-[12ch] text-balance">
          El Consejo de Elrond
        </h1>
      </Reveal>

      <Reveal delay={0.45} className="w-full flex justify-center">
        <SignInForm />
      </Reveal>
    </div>
  );
}
