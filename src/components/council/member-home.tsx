"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { InviteForm } from "@/components/auth/invite-form";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type Props = {
  isOrganizer: boolean;
  hasActiveMeeting: boolean;
  joinUrl: string | null;
  onStartConvocation: () => void;
  onOpenMeeting: () => void;
};

export function MemberHome({
  isOrganizer,
  hasActiveMeeting,
  joinUrl,
  onStartConvocation,
  onOpenMeeting,
}: Props) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function signOut() {
    await authClient.signOut();
    window.location.href = "/";
  }

  async function copyJoinLink() {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <Reveal>
        <Logo size="md" withWordmark className="mb-5" />
      </Reveal>

      <Reveal delay={0.15}>
        <h1 className="font-display text-parchment text-3xl sm:text-4xl max-w-[12ch] text-balance">
          El Consejo de Elrond
        </h1>
      </Reveal>

      <Reveal delay={0.3} className="mt-12 w-full max-w-xs flex flex-col gap-3">
        {hasActiveMeeting ? (
          <Button
            className="w-full shadow-[0_0_28px_rgba(200,169,107,0.18)]"
            onClick={onOpenMeeting}
          >
            Continuar convocatoria
          </Button>
        ) : null}

        {isOrganizer && !hasActiveMeeting ? (
          <Button
            className="w-full shadow-[0_0_28px_rgba(200,169,107,0.18)]"
            onClick={onStartConvocation}
          >
            Nueva convocatoria
          </Button>
        ) : null}

        {isOrganizer && joinUrl ? (
          <Button className="w-full" variant="ghost" onClick={copyJoinLink}>
            {copied ? "Enlace copiado" : "Copiar enlace de invitación"}
          </Button>
        ) : null}

        {isOrganizer ? (
          <Button
            className="w-full"
            variant="ghost"
            onClick={() => {
              setInviteOpen((v) => !v);
              setSentTo(null);
            }}
          >
            {inviteOpen ? "Cerrar" : "Invitar por correo"}
          </Button>
        ) : null}

        <div className="flex gap-3 pt-2">
          <Link href="/bitacora" className="flex-1">
            <Button variant="ghost" className="w-full">
              Bitácora
            </Button>
          </Link>
          <Link href="/mapa" className="flex-1">
            <Button variant="ghost" className="w-full">
              Mapa
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={signOut}
          className="mt-4 font-subtitle text-parchment/40 text-sm min-h-11 hover:text-parchment/70 transition-colors"
        >
          Salir
        </button>
      </Reveal>

      {inviteOpen ? (
        <Reveal
          delay={0.05}
          className="mt-8 w-full flex flex-col items-center gap-3"
        >
          <InviteForm onSent={(email) => setSentTo(email)} />
          {sentTo ? (
            <p className="font-subtitle text-gold text-sm" role="status">
              Enviado a {sentTo}
            </p>
          ) : null}
        </Reveal>
      ) : null}
    </div>
  );
}
