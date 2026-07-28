"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { InviteForm } from "@/components/auth/invite-form";
import { Reveal } from "@/components/council/phase-transition";
import { PushOptIn } from "@/components/pwa/push-opt-in";
import { Button } from "@/components/ui/button";
import { useInvalidateCouncil } from "@/hooks/use-council-me";
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
  const invalidate = useInvalidateCouncil();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [rotateMsg, setRotateMsg] = useState<string | null>(null);

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

  async function rotateJoinLink() {
    setRotating(true);
    setRotateMsg(null);
    try {
      const res = await fetch("/api/council/join-token", { method: "POST" });
      const data = (await res.json()) as { error?: string; joinUrl?: string };
      if (!res.ok) throw new Error(data.error ?? "Error");
      await invalidate();
      setRotateMsg("Enlace renovado — el anterior ya no sirve");
      if (data.joinUrl) {
        try {
          await navigator.clipboard.writeText(data.joinUrl);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          // ignore
        }
      }
    } catch (e) {
      setRotateMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setRotating(false);
    }
  }

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-20 sm:py-24 text-center">
      <Reveal>
        <Logo size="lg" withWordmark className="mb-8" />
      </Reveal>

      <Reveal delay={0.12}>
        <h1 className="font-display text-parchment text-3xl sm:text-4xl max-w-[12ch] text-balance leading-tight">
          El Consejo de Elrond
        </h1>
      </Reveal>

      <Reveal
        delay={0.28}
        className="mt-16 w-full max-w-sm flex flex-col gap-8"
      >
        <div className="flex flex-col gap-4">
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
        </div>

        {isOrganizer ? (
          <div className="flex flex-col gap-4 pt-2 border-t border-parchment/10">
            <p className="font-subtitle text-parchment/35 text-sm tracking-[0.16em] uppercase pt-6">
              Círculo
            </p>
            {joinUrl ? (
              <Button className="w-full" variant="ghost" onClick={copyJoinLink}>
                {copied ? "Enlace copiado" : "Copiar enlace de invitación"}
              </Button>
            ) : null}
            <Button
              className="w-full"
              variant="ghost"
              disabled={rotating}
              onClick={() => void rotateJoinLink()}
            >
              {rotating ? "Renovando…" : "Rotar enlace"}
            </Button>
            {rotateMsg ? (
              <p className="font-subtitle text-parchment/45 text-xs" role="status">
                {rotateMsg}
              </p>
            ) : null}
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
          </div>
        ) : null}

        <div className="flex flex-col gap-4 pt-2 border-t border-parchment/10">
          <p className="font-subtitle text-parchment/35 text-sm tracking-[0.16em] uppercase pt-6">
            Espacios
          </p>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/perfil">
              <Button variant="ghost" className="w-full">
                Perfil
              </Button>
            </Link>
            <Link href="/bitacora">
              <Button variant="ghost" className="w-full">
                Bitácora
              </Button>
            </Link>
            <Link href="/mapa">
              <Button variant="ghost" className="w-full">
                Mapa
              </Button>
            </Link>
            {isOrganizer ? (
              <Link href="/banco">
                <Button variant="ghost" className="w-full">
                  Banco
                </Button>
              </Link>
            ) : null}
            <PushOptIn />
          </div>
        </div>

        <button
          type="button"
          onClick={signOut}
          className="mt-2 font-subtitle text-parchment/35 text-sm min-h-11 hover:text-parchment/70 transition-colors"
        >
          Salir
        </button>
      </Reveal>

      {inviteOpen ? (
        <Reveal
          delay={0.05}
          className="mt-10 w-full max-w-sm flex flex-col items-center gap-4"
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
