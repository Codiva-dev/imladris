"use client";

import { useState } from "react";
import { ReglamentoBody } from "@/components/council/reglamento-body";

type Props = {
  text: string;
};

/** Lectura del pacto en la puerta de entrada (antes de unirse). */
export function ReglamentoPreview({ text }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-sm text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-subtitle text-gold/90 text-base min-h-11 w-full inline-flex items-center justify-center hover:text-gold"
        aria-expanded={open}
      >
        {open ? "Ocultar reglamento" : "Leer el reglamento"}
      </button>
      {open ? (
        <div className="mt-4 max-h-[50dvh] overflow-y-auto rounded-sm border border-parchment/15 bg-forest/40 px-4 py-5">
          <ReglamentoBody text={text} />
        </div>
      ) : null}
    </div>
  );
}
