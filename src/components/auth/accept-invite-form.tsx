"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type Props = {
  email: string;
};

export function AcceptInviteForm({ email }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name: name.trim(),
    });

    setPending(false);

    if (signUpError) {
      setError(signUpError.message ?? "No se pudo aceptar la invitación.");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 text-left">
      <label className="flex flex-col gap-1.5">
        <span className="font-subtitle text-parchment/70 text-sm">Correo</span>
        <input
          type="email"
          value={email}
          readOnly
          className="min-h-11 rounded-sm border border-parchment/20 bg-forest/40 px-3 text-parchment/80 outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-subtitle text-parchment/70 text-sm">Nombre</span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="min-h-11 rounded-sm border border-parchment/20 bg-forest/60 px-3 text-parchment outline-none focus:border-gold/50"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-subtitle text-parchment/70 text-sm">
          Contraseña
        </span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="min-h-11 rounded-sm border border-parchment/20 bg-forest/60 px-3 text-parchment outline-none focus:border-gold/50"
        />
      </label>

      {error ? (
        <p className="font-body text-sm text-gold" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full mt-2" disabled={pending}>
        {pending ? "Entrando…" : "Entrar al Consejo"}
      </Button>
    </form>
  );
}
