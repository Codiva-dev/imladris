"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type Props = {
  children: ReactNode;
  domain?: "bitacora" | "mapa" | "banco" | "perfil";
};

/**
 * Gate de miembro. En local, si auth no responde, deja pasar el stub.
 */
export function MemberGate({ children }: Props) {
  const { data: session, isPending, error } = authClient.useSession();

  if (error && process.env.NODE_ENV !== "production") {
    return <>{children}</>;
  }

  if (isPending) {
    return <div className="min-h-dvh" aria-busy="true" aria-label="Cargando" />;
  }

  if (!session) {
    return (
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center gap-8">
        <Reveal>
          <Logo size="md" withWordmark />
        </Reveal>
        <Reveal delay={0.15}>
          <Link href="/">
            <Button>Entrar</Button>
          </Link>
        </Reveal>
      </div>
    );
  }

  return <>{children}</>;
}
