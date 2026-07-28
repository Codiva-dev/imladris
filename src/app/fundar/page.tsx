"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BootstrapOrganizerForm } from "@/components/auth/bootstrap-organizer-form";
import { Logo } from "@/components/brand/logo";

function FundarContent() {
  const params = useSearchParams();
  const email = params.get("email") ?? undefined;

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <Logo size="md" withWordmark className="mb-5" />
      <h1 className="font-display text-parchment text-3xl sm:text-4xl leading-tight max-w-[14ch]">
        Abrir el Consejo
      </h1>
      <BootstrapOrganizerForm initialEmail={email} />
    </div>
  );
}

export default function FundarPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
      <FundarContent />
    </Suspense>
  );
}
