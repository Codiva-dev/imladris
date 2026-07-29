"use client";

import { MemberGate } from "@/components/auth/member-gate";
import { MembersScreen } from "@/components/council/members-screen";

export default function MiembrosPage() {
  return (
    <MemberGate domain="miembros">
      <MembersScreen />
    </MemberGate>
  );
}
