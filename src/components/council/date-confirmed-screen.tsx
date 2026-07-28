"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { Reveal } from "@/components/council/phase-transition";
import type { CouncilMe } from "@/hooks/use-council-me";

type Props = {
  meeting: NonNullable<CouncilMe["meeting"]>;
};

export function DateConfirmedScreen({ meeting }: Props) {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center max-w-lg mx-auto">
      <Reveal>
        <h1 className="font-display text-parchment text-3xl sm:text-4xl">
          Fecha confirmada
        </h1>
      </Reveal>
      {meeting.startsAt ? (
        <Reveal delay={0.15}>
          <p className="font-subtitle text-gold text-xl mt-6">
            {format(new Date(meeting.startsAt), "EEEE d MMMM · HH:mm", {
              locale: es,
            })}
          </p>
        </Reveal>
      ) : null}
      {meeting.location ? (
        <Reveal delay={0.25}>
          <p className="font-subtitle text-parchment/60 text-lg mt-3">
            {meeting.location}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
