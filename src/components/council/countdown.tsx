"use client";

import { useEffect, useState } from "react";

type Props = {
  target: Date;
  className?: string;
  /** Se dispara una vez al llegar a cero. */
  onComplete?: () => void;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Cuenta regresiva viva: tick 1s, se pausa en background y retoma al volver. */
export function Countdown({ target, className, onComplete }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const [completed, setCompleted] = useState(false);
  const targetMs = target.getTime();

  useEffect(() => {
    setCompleted(false);
  }, [targetMs]);

  useEffect(() => {
    let id: number | null = null;

    const tick = () => setNow(Date.now());

    const start = () => {
      if (id !== null) return;
      tick();
      id = window.setInterval(tick, 1000);
    };

    const stop = () => {
      if (id === null) return;
      window.clearInterval(id);
      id = null;
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const diff = Math.max(0, targetMs - now);

  useEffect(() => {
    if (diff === 0 && !completed) {
      setCompleted(true);
      onComplete?.();
    }
  }, [diff, completed, onComplete]);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  const showSeconds = days === 0 && hours < 12;

  return (
    <div className={className} aria-live="polite">
      <p className="font-subtitle text-parchment/70 text-sm tracking-[0.2em] uppercase mb-3">
        Quedan
      </p>
      <div className="flex items-baseline justify-center gap-3 sm:gap-4 font-display text-parchment">
        <TimeBlock value={days} label="días" />
        <Sep />
        <TimeBlock value={hours} label="horas" />
        <Sep />
        <TimeBlock value={minutes} label="min" />
        {showSeconds ? (
          <>
            <Sep />
            <TimeBlock value={seconds} label="seg" />
          </>
        ) : null}
      </div>
      <span className="sr-only">
        {days} días, {pad(hours)} horas, {pad(minutes)} minutos
        {showSeconds ? `, ${pad(seconds)} segundos` : ""}
      </span>
    </div>
  );
}

function Sep() {
  return (
    <span className="text-gold/60 text-2xl" aria-hidden>
      ·
    </span>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center min-w-[3.75rem] sm:min-w-[4.5rem]">
      <div className="text-4xl sm:text-5xl tabular-nums tracking-wide">
        {pad(value)}
      </div>
      <div className="font-subtitle text-parchment/55 text-sm mt-1">{label}</div>
    </div>
  );
}
