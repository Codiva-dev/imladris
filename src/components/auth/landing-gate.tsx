"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { reportClientError } from "@/lib/client-log";
import { ritualEase } from "@/lib/motion";

type GatePhase = "closed" | "open" | "entering";

/** Landing: botón cerrado → se abre el umbral → se pliega al entrar. */
export function LandingGate() {
  const reduce = useReducedMotion();
  const { error: toastError } = useToast();
  const [phase, setPhase] = useState<GatePhase>("closed");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const normalizedEmail = email.trim().toLowerCase();
    const { error: signInError } = await authClient.signIn.email({
      email: normalizedEmail,
      password,
    });

    if (signInError) {
      setPending(false);
      const message = signInError.message ?? "No se pudo entrar.";
      setError(message);
      toastError(message);
      reportClientError({
        scope: "landing.signin",
        message,
        fields: {
          email: normalizedEmail,
          code: "SIGNIN_FAILED",
          authMessage: signInError.message,
        },
      });
      return;
    }

    setPhase("entering");
    window.setTimeout(
      () => {
        window.location.href = "/";
      },
      reduce ? 0 : 700,
    );
  }

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <Reveal delay={0.05}>
        <motion.div
          className="mb-6"
          initial={reduce ? false : { opacity: 0, scale: 0.85, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: reduce ? 0 : 1,
            ease: ritualEase,
            delay: reduce ? 0 : 0.1,
          }}
        >
          <Logo size="lg" withWordmark />
        </motion.div>
      </Reveal>

      <Reveal delay={0.28}>
        <h1 className="font-display text-parchment text-4xl sm:text-5xl leading-[1.15] max-w-[12ch] text-balance">
          El Consejo de Elrond
        </h1>
      </Reveal>

      <div className="mt-14 w-full max-w-sm flex justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "closed" ? (
            <motion.div
              key="closed"
              initial={reduce ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={
                reduce
                  ? undefined
                  : { opacity: 0, scale: 0.9, y: -8 }
              }
              transition={{ duration: reduce ? 0 : 0.4, ease: ritualEase }}
              className="w-full"
            >
              <Button
                className="w-full shadow-[0_0_32px_rgba(200,169,107,0.22)]"
                onClick={() => setPhase("open")}
              >
                Entrar
              </Button>
            </motion.div>
          ) : null}

          {phase === "open" ? (
            <motion.div
              key="open"
              initial={
                reduce ? false : { opacity: 0, height: 0, y: 12 }
              }
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={
                reduce
                  ? undefined
                  : { opacity: 0, scale: 0.85, y: -24, filter: "blur(4px)" }
              }
              transition={{ duration: reduce ? 0 : 0.55, ease: ritualEase }}
              className="w-full overflow-hidden"
            >
              <form
                onSubmit={onSubmit}
                className="flex flex-col gap-4 pt-1"
              >
                <Field
                  label="Correo"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Field
                  label="Contraseña"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error ? (
                  <p className="font-body text-sm text-gold text-left" role="alert">
                    {error}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  className="w-full mt-1 shadow-[0_0_32px_rgba(200,169,107,0.22)]"
                  disabled={pending}
                >
                  {pending ? "Abriendo…" : "Abrir el umbral"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setPhase("closed");
                    setError(null);
                  }}
                  className="font-subtitle text-parchment/40 text-sm min-h-11 hover:text-parchment/70 transition-colors"
                >
                  Cerrar
                </button>
              </form>
            </motion.div>
          ) : null}

          {phase === "entering" ? (
            <motion.div
              key="entering"
              initial={{ opacity: 1, scale: 1 }}
              animate={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.6, y: -40, filter: "blur(8px)" }
              }
              transition={{ duration: reduce ? 0.15 : 0.65, ease: ritualEase }}
              className="w-full flex justify-center"
              aria-busy="true"
              aria-label="Entrando"
            >
              <p className="font-subtitle text-gold text-lg tracking-[0.14em]">
                Imladris
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
