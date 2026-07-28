/** Fases únicas del Consejo — la UI vive en exactamente una. */
export const COUNCIL_PHASES = [
  "CONVOCATORIA",
  "DISPONIBILIDAD",
  "QUORUM_ALCANZADO",
  "FECHA_CONFIRMADA",
  "TEMA_SELECCIONADO",
  "CUENTA_REGRESIVA",
  "EN_CURSO",
  "BITACORA_ABIERTA",
  "CERRADO",
] as const;

export type CouncilPhase = (typeof COUNCIL_PHASES)[number];

export const QUORUM_OPTIONS = [60, 70, 75, 80, 85, 90, 100] as const;
export type QuorumPercent = (typeof QUORUM_OPTIONS)[number];
export const DEFAULT_QUORUM: QuorumPercent = 80;

export const DEFAULT_APPROACHES = [
  "Ética",
  "Historia",
  "Estrategia",
  "Economía",
  "Arte",
  "Religión",
  "Naturaleza",
  "Psicología",
  "Tecnología",
  "Experiencia personal",
  "Política",
  "Ciencia",
  "Ingeniería",
] as const;

export const PHASE_LABELS: Record<CouncilPhase, string> = {
  CONVOCATORIA: "Convocatoria",
  DISPONIBILIDAD: "Disponibilidad",
  QUORUM_ALCANZADO: "Fechas posibles",
  FECHA_CONFIRMADA: "Fecha confirmada",
  TEMA_SELECCIONADO: "Tema seleccionado",
  CUENTA_REGRESIVA: "Cuenta regresiva",
  EN_CURSO: "Consejo en curso",
  BITACORA_ABIERTA: "Bitácora abierta",
  CERRADO: "Consejo cerrado",
};

/** Fases donde la reunión gobierna toda la UI (pantalla principal desaparece). */
export const MEETING_DOMINANT_PHASES: CouncilPhase[] = [
  "FECHA_CONFIRMADA",
  "TEMA_SELECCIONADO",
  "CUENTA_REGRESIVA",
  "EN_CURSO",
  "BITACORA_ABIERTA",
];

export const BITACORA_WINDOW_HOURS = 72;
