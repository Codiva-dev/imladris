"use client";

import Link from "next/link";
import { ScrollText } from "lucide-react";
import { MemberGate } from "@/components/auth/member-gate";
import { Reveal } from "@/components/council/phase-transition";

export default function BitacoraPage() {
  return (
    <MemberGate domain="bitacora">
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center gap-6">
        <Reveal>
          <ScrollText className="mx-auto h-10 w-10 text-gold" strokeWidth={1.25} aria-hidden />
        </Reveal>
        <Reveal delay={0.12}>
          <h1 className="font-display text-parchment text-3xl">Bitácora</h1>
        </Reveal>
        <Reveal delay={0.24}>
          <p className="font-subtitle text-parchment/55 text-lg">Cerrada</p>
        </Reveal>
        <Reveal delay={0.36}>
          <Link
            href="/"
            className="font-subtitle text-parchment/50 text-base min-h-11 inline-flex items-center hover:text-parchment/80"
          >
            ← Volver
          </Link>
        </Reveal>
      </div>
    </MemberGate>
  );
}
