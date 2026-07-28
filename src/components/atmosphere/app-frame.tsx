"use client";

import type { ReactNode } from "react";
import { MistBackground } from "@/components/atmosphere/mist-background";

type Props = {
  children: ReactNode;
};

/**
 * Marco de la app: niebla fija.
 * Las transiciones de ruta viven en `app/template.tsx`.
 */
export function AppFrame({ children }: Props) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <MistBackground />
      {children}
    </div>
  );
}
