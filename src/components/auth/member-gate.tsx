"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { useCouncilMe } from "@/hooks/use-council-me";
import { authClient } from "@/lib/auth-client";
import { isRitualSealed, RITUAL_SEAL_MESSAGE } from "@/lib/constants";

type Props = {
  children: ReactNode;
  domain?: "bitacora" | "mapa" | "banco" | "perfil" | "reglamento";
};

/**
 * Gate de miembro. Durante cuenta regresiva / en curso, redirige al Consejo.
 */
export function MemberGate({ children }: Props) {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();
  const { data: council, isPending: councilPending } = useCouncilMe(
    Boolean(session),
  );

  const sealed = Boolean(
    council?.sealed ||
      (council?.council.phase && isRitualSealed(council.council.phase)),
  );

  useEffect(() => {
    if (sealed) {
      router.replace("/");
    }
  }, [sealed, router]);

  if (error && process.env.NODE_ENV !== "production") {
    return <>{children}</>;
  }

  if (isPending || (session && councilPending && !council)) {
    return <div className="min-h-dvh" aria-busy="true" aria-label="Cargando" />;
  }

  if (!session) {
    return (
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center gap-8">
        <Reveal>
          <Logo size="md" withWordmark />
        </Reveal>
        <Reveal delay={0.15}>
          <Button href="/">Entrar</Button>
        </Reveal>
      </div>
    );
  }

  if (sealed) {
    return (
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center gap-6">
        <Reveal>
          <Logo size="md" withWordmark />
        </Reveal>
        <Reveal delay={0.12}>
          <p className="font-body text-parchment/55 text-sm max-w-[28ch]">
            {RITUAL_SEAL_MESSAGE}
          </p>
        </Reveal>
      </div>
    );
  }

  return <>{children}</>;
}
