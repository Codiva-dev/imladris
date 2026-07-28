"use client";

import { useEffect, useState } from "react";
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

export function CouncilShell() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data, isPending, isError, refetch } = useCouncilMe(Boolean(session));
  const [drafting, setDrafting] = useState(false);
  const [forceAvailability, setForceAvailability] = useState(false);

  useEffect(() => {
    if (!session) return;
    void refetch();
  }, [session, refetch]);

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

  if (isError || !data) {
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

  const phase = data.council.phase;
  const isOrganizer = data.role === "ORGANIZADOR";
  const meeting = data.meeting;

  let view = "home";
  if (drafting) view = "convocation";
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
  else if (phase === "CERRADO") view = "home";
  else view = "home";

  return (
    <TransitionSlot transitionKey={`${view}-${phase}`} skipInitial>
      {view === "convocation" ? (
        <ConvocationScreen
          quorum={data.council.quorum}
          onBack={() => setDrafting(false)}
        />
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
          onStartConvocation={() => setDrafting(true)}
          onOpenMeeting={() => {
            setForceAvailability(false);
            void refetch();
          }}
        />
      ) : null}
    </TransitionSlot>
  );
}
