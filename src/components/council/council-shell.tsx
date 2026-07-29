"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LandingGate } from "@/components/auth/landing-gate";
import { TransitionSlot } from "@/components/atmosphere/transition-slot";
import { AvailabilityScreen } from "@/components/council/availability-screen";
import { BitacoraScreen } from "@/components/council/bitacora-screen";
import { ConvocationScreen } from "@/components/council/convocation-screen";
import { MeetingScreen } from "@/components/council/meeting-screen";
import { MemberHome } from "@/components/council/member-home";
import { QuorumScreen } from "@/components/council/quorum-screen";
import { TopicSelectionScreen } from "@/components/council/topic-selection-screen";
import { authClient } from "@/lib/auth-client";
import { useCouncilMe } from "@/hooks/use-council-me";
import { isRitualSealed } from "@/lib/constants";

/** Volver desde Espacios: abre el portal aunque haya fase activa (no durante el sello). */
export const PORTAL_HREF = "/?portal=1";

function CouncilShellInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preferPortal = searchParams.get("portal") === "1";
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data, isPending, isError, refetch } = useCouncilMe(Boolean(session));
  const [drafting, setDrafting] = useState(false);
  const [forceAvailability, setForceAvailability] = useState(false);

  const phase = data?.council.phase;
  const sealed = Boolean(
    data?.sealed || (phase && isRitualSealed(phase)),
  );

  useEffect(() => {
    if (!session) return;
    void refetch();
  }, [session, refetch]);

  useEffect(() => {
    if (sealed && preferPortal) {
      router.replace("/");
    }
  }, [sealed, preferPortal, router]);

  if (sessionPending || (session && isPending && !data)) {
    return <div className="min-h-dvh" aria-busy="true" aria-label="Cargando" />;
  }

  if (!session) {
    return (
      <TransitionSlot transitionKey="landing" skipInitial>
        <LandingGate />
      </TransitionSlot>
    );
  }

  if (isError || !data || !phase) {
    return (
      <div className="relative z-10 flex min-h-dvh items-center justify-center px-6">
        <button
          type="button"
          className="font-subtitle text-gold min-h-11"
          onClick={() => void refetch()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const isOrganizer = data.role === "ORGANIZADOR";
  const meeting = data.meeting;

  let view = "home";
  // Sello: solo la pantalla del Consejo. Sin portal ni otras vistas.
  if (sealed && meeting) view = "meeting";
  else if (preferPortal && !sealed) view = "home";
  else if (phase === "CONVOCATORIA" && isOrganizer) view = "convocation";
  else if (drafting && isOrganizer) view = "convocation";
  else if (forceAvailability && meeting) view = "availability";
  else if (phase === "DISPONIBILIDAD" && meeting) view = "availability";
  else if (phase === "QUORUM_ALCANZADO" && meeting) view = "quorum";
  else if (phase === "FECHA_CONFIRMADA" && meeting) view = "selection";
  else if (
    meeting &&
    (phase === "TEMA_SELECCIONADO" ||
      phase === "CUENTA_REGRESIVA" ||
      phase === "EN_CURSO")
  ) {
    view = "meeting";
  } else if (phase === "BITACORA_ABIERTA") view = "bitacora";
  else view = "home";

  function enterActiveMeeting() {
    setForceAvailability(false);
    router.replace("/");
    void refetch();
  }

  async function startConvocation() {
    router.replace("/");
    const res = await fetch("/api/meetings/convocation", { method: "POST" });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      console.error(body.error ?? "No se pudo abrir la convocatoria");
      return;
    }
    setDrafting(true);
    void refetch();
  }

  async function cancelConvocationDraft() {
    setDrafting(false);
    if (phase === "CONVOCATORIA") {
      await fetch("/api/meetings/convocation", { method: "DELETE" });
      void refetch();
    }
  }

  return (
    <TransitionSlot transitionKey={`${view}-${phase}`} skipInitial>
      {view === "convocation" ? (
        <ConvocationScreen onBack={() => void cancelConvocationDraft()} />
      ) : null}

      {view === "availability" && meeting ? (
        <AvailabilityScreen
          meeting={meeting}
          memberCount={data.council.memberCount}
          responseCount={meeting.responseCount}
          onSaved={() => setForceAvailability(false)}
        />
      ) : null}

      {view === "quorum" && meeting ? (
        <QuorumScreen
          meeting={meeting}
          isOrganizer={isOrganizer}
          onEditAvailability={() => setForceAvailability(true)}
        />
      ) : null}

      {view === "selection" && meeting ? (
        <TopicSelectionScreen meeting={meeting} isOrganizer={isOrganizer} />
      ) : null}

      {view === "meeting" && meeting ? (
        <MeetingScreen meeting={meeting} isOrganizer={isOrganizer} />
      ) : null}

      {view === "bitacora" ? <BitacoraScreen embedded /> : null}

      {view === "home" ? (
        <MemberHome
          isOrganizer={isOrganizer}
          hasActiveMeeting={Boolean(meeting) && phase !== "CERRADO"}
          joinUrl={data.council.joinUrl}
          organizerLabel={data.organizer?.label ?? null}
          onStartConvocation={() => {
            void startConvocation();
          }}
          onOpenMeeting={enterActiveMeeting}
        />
      ) : null}
    </TransitionSlot>
  );
}

export function CouncilShell() {
  return (
    <Suspense
      fallback={<div className="min-h-dvh" aria-busy="true" aria-label="Cargando" />}
    >
      <CouncilShellInner />
    </Suspense>
  );
}
