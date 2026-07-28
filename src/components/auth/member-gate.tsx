"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/council/phase-transition";
import { authClient } from "@/lib/auth-client";

type Props = {
  children: ReactNode;
  domain: "bitacora" | "mapa";
};

const COPY = {
  bitacora: {
    title: "La bitácora es del círculo",
    body: "Solo los miembros del Consejo pueden abrir este cuaderno.",
  },
  mapa: {
    title: "El mapa es del círculo",
    body: "El cielo del conocimiento se revela a quienes forman el Consejo.",
  },
} as const;

/**
 * Gate de miembro — placeholder hasta auth estable en producción.
 * Sin sesión: mensaje ritual. En local, si el API de auth no responde, deja pasar el stub.
 */
export function MemberGate({ children, domain }: Props) {
  const { data: session, isPending, error } = authClient.useSession();

  if (error && process.env.NODE_ENV !== "production") {
    return <>{children}</>;
  }

  if (isPending) {
    return <div className="min-h-dvh" aria-busy="true" aria-label="Cargando" />;
  }

  if (!session) {
    const copy = COPY[domain];
    return (
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
        <Reveal>
          <Logo size="md" className="mb-5" />
        </Reveal>
        <Reveal delay={0.12}>
          <h1 className="font-display text-parchment text-3xl max-w-[14ch] text-balance">
            {copy.title}
          </h1>
        </Reveal>
        <Reveal delay={0.26}>
          <p className="font-subtitle text-parchment/65 text-lg mt-5 max-w-[28ch] leading-relaxed">
            {copy.body}
          </p>
        </Reveal>
        <Reveal delay={0.4} className="mt-12 flex flex-col items-center gap-4">
          <Link
            href="/fundar"
            className="font-subtitle text-gold text-lg min-h-11 inline-flex items-center hover:text-[#d4b87a] transition-colors"
          >
            Entrar al Consejo
          </Link>
          <Link
            href="/"
            className="font-subtitle text-parchment/50 text-base min-h-11 inline-flex items-center hover:text-parchment/80 transition-colors"
          >
            ← Volver al umbral
          </Link>
        </Reveal>
      </div>
    );
  }

  return <>{children}</>;
}
