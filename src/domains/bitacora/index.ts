import type { ReflectionKind, ReflectionVisibility } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureReflectionStar } from "@/domains/mapa/stars";

export const REFLECTION_KINDS = [
  "REFLEXION",
  "IDEA",
  "PREGUNTA",
  "PROXIMA_ACCION",
] as const;

export const REFLECTION_VISIBILITIES = [
  "PRIVADA",
  "COMPARTIDA",
  "ANONIMA",
] as const;

export const KIND_LABELS: Record<(typeof REFLECTION_KINDS)[number], string> = {
  REFLEXION: "Reflexión",
  IDEA: "Idea",
  PREGUNTA: "Pregunta",
  PROXIMA_ACCION: "Próxima acción",
};

export async function getOpenBitacoraMeeting(councilId: string) {
  return prisma.meeting.findFirst({
    where: { councilId, phase: "BITACORA_ABIERTA" },
    orderBy: { createdAt: "desc" },
    include: {
      selection: {
        include: {
          topic: {
            select: { id: true, title: true, category: true },
          },
          approach: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function listBitacoraEntries(
  meetingId: string,
  userId: string,
) {
  const rows = await prisma.reflection.findMany({
    where: {
      meetingId,
      OR: [
        { userId },
        { visibility: { in: ["COMPARTIDA", "ANONIMA"] } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    body: r.body,
    visibility: r.visibility,
    createdAt: r.createdAt,
    mine: r.userId === userId,
    author:
      r.visibility === "ANONIMA" && r.userId !== userId
        ? null
        : r.userId === userId
          ? "Tú"
          : r.user.name,
  }));
}

export async function createReflection(input: {
  councilId: string;
  meetingId: string;
  userId: string;
  kind: ReflectionKind;
  body: string;
  visibility: ReflectionVisibility;
  topicId: string | null;
}) {
  const body = input.body.trim();
  if (body.length < 2) throw new Error("Escribe un poco más");
  if (body.length > 2000) throw new Error("Demasiado largo");

  const reflection = await prisma.reflection.create({
    data: {
      meetingId: input.meetingId,
      userId: input.userId,
      kind: input.kind,
      body,
      visibility: input.visibility,
    },
  });

  if (input.visibility !== "PRIVADA") {
    await ensureReflectionStar(
      input.councilId,
      {
        id: reflection.id,
        body: reflection.body,
        visibility: input.visibility,
      },
      input.topicId,
    );
  }

  return reflection;
}
