"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { CouncilPhase, QuorumPercent } from "@/lib/constants";

export type CouncilMe = {
  user: { id: string; name: string; email: string };
  role: "ORGANIZADOR" | "MIEMBRO";
  sealed: boolean;
  organizer: {
    userId: string;
    label: string;
    pendingInRound: number;
    servedInRound: number;
    memberCount: number;
  } | null;
  council: {
    id: string;
    name: string;
    phase: CouncilPhase;
    quorum: QuorumPercent;
    memberCount: number;
    joinUrl: string | null;
  };
  meeting: {
    id: string;
    phase: CouncilPhase;
    location: string | null;
    startsAt: string | null;
    endsAt: string | null;
    confirmedAt: string | null;
    bitacoraOpensAt: string | null;
    bitacoraClosesAt: string | null;
    slots: { id: string; startsAt: string; endsAt: string }[];
    proposals: {
      id: string;
      slotId: string;
      rank: number;
      score: number;
      attendeeCount: number;
      confirmed: boolean;
      startsAt: string;
      endsAt: string;
    }[];
    myAvailabilities: { slotId: string; status: string }[];
    responseCount: number;
    attendance: {
      mine: "VOY" | "TAL_VEZ" | "NO_VOY" | null;
      counts: { VOY: number; TAL_VEZ: number; NO_VOY: number };
      responses: {
        userId: string;
        name: string;
        status: "VOY" | "TAL_VEZ" | "NO_VOY";
      }[];
    };
    selection: {
      topic: {
        id: string;
        title: string;
        description: string;
        category: string;
      };
      approach: { id: string; name: string } | null;
      optionalMaterial: string | null;
      selectedAt: string;
    } | null;
  } | null;
};

async function fetchCouncilMe(): Promise<CouncilMe> {
  const res = await fetch("/api/council/me");
  if (!res.ok) {
    throw new Error("No se pudo cargar el Consejo");
  }
  return res.json();
}

export function useCouncilMe(enabled = true) {
  return useQuery({
    queryKey: ["council-me"],
    queryFn: fetchCouncilMe,
    staleTime: 10_000,
    enabled,
    retry: false,
  });
}

export function useInvalidateCouncil() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["council-me"] });
}
