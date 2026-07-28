"use client";

import { MemberGate } from "@/components/auth/member-gate";
import { BancoScreen } from "@/components/council/banco-screen";

export default function BancoPage() {
  return (
    <MemberGate domain="banco">
      <BancoScreen />
    </MemberGate>
  );
}
