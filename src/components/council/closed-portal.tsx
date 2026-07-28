"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { useCouncilStore } from "@/stores/council-store";

/**
 * Umbral de entrada — cuando no hay Consejo en cuenta regresiva / en curso.
 * Una composición, un CTA. Bitácora y mapa viven en el espacio del miembro.
 */
export function ClosedPortal() {
  const setPhase = useCouncilStore((s) => s.setPhase);
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

      <Reveal delay={0.32}>
        <h1 className="font-display text-parchment text-4xl sm:text-5xl leading-[1.15] max-w-[12ch] text-balance">
          El Consejo de Elrond
        </h1>
      </Reveal>

      <Reveal delay={0.48}>
        <p className="font-subtitle text-parchment/70 text-lg sm:text-xl mt-6 max-w-[26ch] leading-relaxed italic">
          Un lugar que solo cobra vida cuando el Consejo está por reunirse.
        </p>
      </Reveal>

      <Reveal delay={0.68} className="mt-14 w-full max-w-xs">
        <Button
          className="w-full shadow-[0_0_32px_rgba(200,169,107,0.22)]"
          onClick={() => setPhase("CONVOCATORIA")}
          aria-label="Abrir una nueva convocatoria"
        >
          Nueva convocatoria
        </Button>
      </Reveal>
    </div>
  );
}
