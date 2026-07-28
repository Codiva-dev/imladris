"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { TransitionSlot } from "@/components/atmosphere/transition-slot";

/** Transición unificada entre rutas (pathname). */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <TransitionSlot transitionKey={pathname}>{children}</TransitionSlot>
  );
}
