import { create } from "zustand";
import {
  type CouncilPhase,
  type QuorumPercent,
  DEFAULT_QUORUM,
} from "@/lib/constants";

export type CouncilSnapshot = {
  phase: CouncilPhase;
  quorum: QuorumPercent;
  meetingStartsAt: string | null;
  location: string | null;
  topicTitle: string | null;
  approachName: string | null;
};

type CouncilStore = CouncilSnapshot & {
  setPhase: (phase: CouncilPhase) => void;
  setQuorum: (quorum: QuorumPercent) => void;
  setMeeting: (
    partial: Partial<
      Pick<CouncilSnapshot, "meetingStartsAt" | "location" | "topicTitle" | "approachName">
    >,
  ) => void;
  reset: () => void;
};

const initial: CouncilSnapshot = {
  phase: "CERRADO",
  quorum: DEFAULT_QUORUM,
  meetingStartsAt: null,
  location: null,
  topicTitle: null,
  approachName: null,
};

export const useCouncilStore = create<CouncilStore>((set) => ({
  ...initial,
  setPhase: (phase) => set({ phase }),
  setQuorum: (quorum) => set({ quorum }),
  setMeeting: (partial) => set(partial),
  reset: () => set(initial),
}));
