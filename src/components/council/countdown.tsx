"use client";

import { useEffect, useState } from "react";

type Props = {
  target: Date;
  className?: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Countdown({ target, className }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return (
    <div className={className} aria-live="polite">
      <p className="font-subtitle text-parchment/70 text-sm tracking-[0.2em] uppercase mb-3">
        Quedan
      </p>
      <div className="flex items-baseline justify-center gap-4 font-display text-parchment">
        <TimeBlock value={days} label="días" />
        <span className="text-gold/60 text-2xl" aria-hidden>
          ·
        </span>
        <TimeBlock value={hours} label="horas" />
        <span className="text-gold/60 text-2xl" aria-hidden>
          ·
        </span>
        <TimeBlock value={minutes} label="min" />
      </div>
      <span className="sr-only">
        {days} días, {pad(hours)} horas, {pad(minutes)} minutos
      </span>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center min-w-[4.5rem]">
      <div className="text-4xl sm:text-5xl tabular-nums tracking-wide">{pad(value)}</div>
      <div className="font-subtitle text-parchment/55 text-sm mt-1">{label}</div>
    </div>
  );
}
