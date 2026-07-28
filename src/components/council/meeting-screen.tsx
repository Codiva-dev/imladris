"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useEffect, useState } from "react";
import { AttendanceBar } from "@/components/council/attendance-bar";
import { Countdown } from "@/components/council/countdown";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import {
  useInvalidateCouncil,
  type CouncilMe,
} from "@/hooks/use-council-me";
import { isRitualSealed } from "@/lib/constants";

type Props = {
  meeting: NonNullable<CouncilMe["meeting"]>;
  isOrganizer: boolean;
};

/**
 * Pantalla del Consejo próximo / en curso.
 * En cuenta regresiva y en curso: solo contemplación (sello ritual).
 * Abrir bitácora solo en EN_CURSO (salida del sello).
 */
export function MeetingScreen({ meeting, isOrganizer }: Props) {
  const invalidate = useInvalidateCouncil();
  const selection = meeting.selection;
  const startsAt = meeting.startsAt ? new Date(meeting.startsAt) : null;
  const [now, setNow] = useState(() => Date.now());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      void invalidate();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [invalidate]);

  const underway = startsAt ? startsAt.getTime() <= now : false;
  const sealed = isRitualSealed(meeting.phase);
  const canOpenBitacora = isOrganizer && meeting.phase === "EN_CURSO";
  const showAttendance =
    !sealed &&
    Boolean(meeting.confirmedAt) &&
    meeting.phase === "TEMA_SELECCIONADO";

  async function openBitacora() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/bitacora`, {
        method: "POST",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error");
      await invalidate();
      window.location.href = "/bitacora";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center max-w-lg mx-auto">
      <Reveal>
        <p className="font-subtitle text-parchment/35 text-sm tracking-[0.18em] uppercase mb-4">
          {meeting.phase === "EN_CURSO" || underway
            ? "En curso"
            : "Próximo Consejo"}
        </p>
      </Reveal>

      {selection ? (
        <Reveal delay={0.08}>
          <h1 className="font-display text-parchment text-3xl sm:text-4xl text-balance leading-tight max-w-[16ch]">
            {selection.topic.title}
          </h1>
          {selection.approach ? (
            <p className="font-subtitle text-gold text-lg mt-4">
              {selection.approach.name}
            </p>
          ) : null}
          <p className="font-body text-parchment/50 text-sm mt-3 max-w-[36ch] mx-auto">
            {selection.topic.description}
          </p>
        </Reveal>
      ) : (
        <Reveal delay={0.08}>
          <h1 className="font-display text-parchment text-3xl">
            El Consejo se acerca
          </h1>
        </Reveal>
      )}

      {startsAt && !underway && meeting.phase !== "EN_CURSO" ? (
        <Reveal delay={0.22} className="mt-12 w-full">
          <Countdown
            target={startsAt}
            onComplete={() => {
              void invalidate();
            }}
          />
        </Reveal>
      ) : null}

      {startsAt ? (
        <Reveal delay={0.32}>
          <p className="font-subtitle text-parchment/55 text-base mt-10">
            {format(startsAt, "EEEE d MMMM · HH:mm", { locale: es })}
          </p>
        </Reveal>
      ) : null}

      {meeting.location ? (
        <Reveal delay={0.4}>
          <p className="font-subtitle text-parchment/40 text-base mt-2">
            {meeting.location}
          </p>
        </Reveal>
      ) : null}

      {selection?.optionalMaterial && !sealed ? (
        <Reveal delay={0.48} className="mt-8">
          {/^https?:\/\//i.test(selection.optionalMaterial) ? (
            <a
              href={selection.optionalMaterial}
              target="_blank"
              rel="noreferrer"
              className="font-body text-gold/80 text-sm inline-block min-h-11 leading-[2.75rem] underline-offset-4 hover:underline"
            >
              Material de lectura
            </a>
          ) : (
            <p className="font-body text-parchment/45 text-sm">
              {selection.optionalMaterial}
            </p>
          )}
        </Reveal>
      ) : null}

      {selection?.optionalMaterial && sealed ? (
        <Reveal delay={0.48} className="mt-8">
          <p className="font-body text-parchment/45 text-sm max-w-[32ch] mx-auto">
            {/^https?:\/\//i.test(selection.optionalMaterial)
              ? "Hay material de lectura preparado para el círculo."
              : selection.optionalMaterial}
          </p>
        </Reveal>
      ) : null}

      {showAttendance ? (
        <Reveal delay={0.5} className="mt-10 w-full max-w-sm">
          <AttendanceBar
            meetingId={meeting.id}
            attendance={meeting.attendance}
          />
        </Reveal>
      ) : null}

      {sealed ? (
        <Reveal delay={0.52} className="mt-10">
          <p className="font-subtitle text-parchment/40 text-sm max-w-[28ch] mx-auto">
            El círculo está en silencio. Nada más se mueve hasta que termine.
          </p>
        </Reveal>
      ) : null}

      {canOpenBitacora ? (
        <Reveal delay={0.55} className="mt-12 w-full max-w-sm">
          <Button
            className="w-full"
            disabled={pending}
            onClick={() => void openBitacora()}
          >
            {pending ? "Abriendo…" : "Abrir bitácora"}
          </Button>
        </Reveal>
      ) : null}

      {error ? (
        <p className="font-body text-sm text-gold mt-4" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
