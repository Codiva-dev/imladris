"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useState } from "react";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { useInvalidateCouncil, type CouncilMe } from "@/hooks/use-council-me";

type Props = {
  meeting: NonNullable<CouncilMe["meeting"]>;
  isOrganizer: boolean;
  onEditAvailability: () => void;
};

export function QuorumScreen({
  meeting,
  isOrganizer,
  onEditAvailability,
}: Props) {
  const invalidate = useInvalidateCouncil();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function confirm(proposalId: string) {
    setPendingId(proposalId);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error");
      await invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="relative z-10 flex min-h-dvh flex-col px-6 py-10 max-w-lg mx-auto">
      <Reveal>
        <h1 className="font-display text-parchment text-3xl text-center">
          Fechas posibles
        </h1>
      </Reveal>

      <Reveal delay={0.15} className="mt-8 flex flex-col gap-3 flex-1">
        {meeting.proposals.map((p) => (
          <div
            key={p.id}
            className="border border-parchment/15 rounded-sm px-4 py-4 text-left"
          >
            <p className="font-subtitle text-parchment text-lg">
              {format(new Date(p.startsAt), "EEE d MMM · HH:mm", {
                locale: es,
              })}
            </p>
            <p className="font-body text-parchment/45 text-sm mt-1">
              #{p.rank} · {p.attendeeCount} disponibles
            </p>
            {isOrganizer ? (
              <Button
                className="w-full mt-4"
                disabled={pendingId !== null}
                onClick={() => confirm(p.id)}
              >
                {pendingId === p.id ? "Confirmando…" : "Confirmar esta fecha"}
              </Button>
            ) : null}
          </div>
        ))}
        {error ? (
          <p className="font-body text-sm text-gold" role="alert">
            {error}
          </p>
        ) : null}
      </Reveal>

      <Reveal delay={0.25} className="pb-8 pt-4">
        <Button variant="ghost" className="w-full" onClick={onEditAvailability}>
          Editar mi disponibilidad
        </Button>
      </Reveal>
    </div>
  );
}
