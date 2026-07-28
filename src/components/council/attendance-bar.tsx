"use client";

import { useState } from "react";
import { useInvalidateCouncil, type CouncilMe } from "@/hooks/use-council-me";
import { cn } from "@/lib/utils";

type AttendanceStatus = "VOY" | "TAL_VEZ" | "NO_VOY";

const OPTIONS: { id: AttendanceStatus; label: string }[] = [
  { id: "VOY", label: "Voy" },
  { id: "TAL_VEZ", label: "Tal vez" },
  { id: "NO_VOY", label: "No voy" },
];

type Props = {
  meetingId: string;
  attendance: NonNullable<CouncilMe["meeting"]>["attendance"];
};

export function AttendanceBar({ meetingId, attendance }: Props) {
  const invalidate = useInvalidateCouncil();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(status: AttendanceStatus) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/attendance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error");
      await invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full">
      <p className="font-subtitle text-parchment/35 text-sm tracking-[0.16em] uppercase mb-3 text-center">
        Asistencia
      </p>
      <div className="flex gap-2 justify-center flex-wrap">
        {OPTIONS.map((o) => {
          const selected = attendance.mine === o.id;
          return (
            <button
              key={o.id}
              type="button"
              disabled={pending}
              onClick={() => void setStatus(o.id)}
              className={cn(
                "min-h-11 px-4 rounded-sm border font-subtitle text-base transition-colors",
                selected
                  ? "border-gold/55 text-gold bg-gold/[0.07]"
                  : "border-parchment/15 text-parchment/70 hover:border-parchment/30",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <p className="font-body text-parchment/40 text-sm mt-4 text-center">
        {attendance.counts.VOY} van · {attendance.counts.TAL_VEZ} tal vez ·{" "}
        {attendance.counts.NO_VOY} no
      </p>
      {error ? (
        <p className="font-body text-sm text-gold mt-2 text-center" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
