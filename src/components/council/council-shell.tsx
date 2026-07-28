"use client";

import { ClosedPortal } from "@/components/council/closed-portal";
import { ConvocationScreen } from "@/components/council/convocation-screen";
import { PhaseTransition } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { PHASE_LABELS, type CouncilPhase } from "@/lib/constants";
import { useCouncilStore } from "@/stores/council-store";

/**
 * Shell gobernado por el estado del Consejo.
 * Una fase activa → una interfaz.
 */
export function CouncilShell() {
  const phase = useCouncilStore((s) => s.phase);

  switch (phase) {
    case "CERRADO":
      return <ClosedPortal />;
    case "CONVOCATORIA":
      return <ConvocationScreen />;
    default:
      return <PhasePlaceholder phase={phase} />;
  }
}

function PhasePlaceholder({ phase }: { phase: CouncilPhase }) {
  const setPhase = useCouncilStore((s) => s.setPhase);

  return (
    <PhaseTransition className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="font-subtitle text-gold/80 text-lg tracking-wide mb-2">
        {PHASE_LABELS[phase]}
      </p>
      <h1 className="font-display text-parchment text-3xl max-w-[16ch]">
        Esta fase se construirá a continuación
      </h1>
      <p className="font-body text-parchment/55 mt-4 max-w-[28ch]">
        El esqueleto de dominios ya está listo. La UI completa llega dominio a dominio.
      </p>
      <Button className="mt-10" variant="ghost" onClick={() => setPhase("CERRADO")}>
        Volver al umbral
      </Button>
    </PhaseTransition>
  );
}
