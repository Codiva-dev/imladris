"use client";

import { MemberGate } from "@/components/auth/member-gate";
import { BitacoraScreen } from "@/components/council/bitacora-screen";

export default function BitacoraPage() {
  return (
    <MemberGate domain="bitacora">
      <BitacoraScreen />
    </MemberGate>
  );
}
