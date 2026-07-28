"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/** Opt-in a avisos del Consejo (Web Push). */
export function PushOptIn() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setSupported(ok);
    if (!ok) return;

    const res = await fetch("/api/push");
    if (!res.ok) return;
    const data = (await res.json()) as {
      enabled: boolean;
      publicKey: string | null;
      subscribed: boolean;
    };
    setEnabled(data.enabled);
    setPublicKey(data.publicKey);
    setSubscribed(data.subscribed);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function subscribe() {
    if (!publicKey) return;
    setPending(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Permiso denegado");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = sub.toJSON();
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });
      if (!res.ok) throw new Error("No se pudo guardar");
      setSubscribed(true);
      setMessage("Avisos activos");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setPending(false);
    }
  }

  async function unsubscribe() {
    setPending(true);
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      } else {
        await fetch("/api/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      }
      setSubscribed(false);
      setMessage("Avisos desactivados");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setPending(false);
    }
  }

  if (!supported || !enabled) {
    return (
      <p className="font-body text-parchment/40 text-sm text-left">
        Los avisos no están disponibles en este dispositivo.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <Button
        variant="ghost"
        className="w-full"
        disabled={pending}
        onClick={() => void (subscribed ? unsubscribe() : subscribe())}
      >
        {pending
          ? "…"
          : subscribed
            ? "Desactivar avisos"
            : "Activar avisos"}
      </Button>
      {message ? (
        <p className="font-subtitle text-parchment/40 text-xs" role="status">
          {message}
        </p>
      ) : subscribed && !message ? (
        <p className="font-subtitle text-parchment/40 text-xs" role="status">
          Avisos activos en este dispositivo
        </p>
      ) : null}
    </div>
  );
}
