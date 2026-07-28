"use client";

import { useEffect } from "react";

/** Registra el service worker PWA (offline shell + push). */
export function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "development") {
      // En local también registramos para probar push; si falla, no bloquea.
    }

    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silencioso: PWA es mejora progresiva.
    });
  }, []);

  return null;
}
