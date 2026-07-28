"use client";

import { MemberGate } from "@/components/auth/member-gate";
import { KnowledgeMap } from "@/components/council/knowledge-map";

export default function MapaPage() {
  return (
    <MemberGate domain="mapa">
      <KnowledgeMap />
    </MemberGate>
  );
}
