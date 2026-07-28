import type { CouncilPhase } from "@prisma/client";
import { ensureTopicStar } from "@/domains/mapa/stars";
import { prisma } from "@/lib/prisma";

type PersistInput = {
  councilId: string;
  meetingId: string;
  topicId: string;
  approachId: string | null;
  optionalMaterial: string | null;
  nextPhase?: CouncilPhase;
};

/** Confirma tema (+ enfoque) y avanza a cuenta regresiva. */
export async function persistMeetingSelection({
  councilId,
  meetingId,
  topicId,
  approachId,
  optionalMaterial,
  nextPhase = "CUENTA_REGRESIVA",
}: PersistInput) {
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const existing = await tx.meetingSelection.findUnique({
      where: { meetingId },
    });
    if (existing) {
      throw new Error("Ya hay un tema seleccionado");
    }

    const topic = await tx.topic.findFirst({
      where: { id: topicId, councilId },
    });
    if (!topic || topic.status === "ARCHIVADO") {
      throw new Error("Tema no disponible");
    }

    if (approachId) {
      const approach = await tx.approach.findFirst({
        where: { id: approachId, councilId },
      });
      if (!approach) throw new Error("Enfoque no disponible");
    }

    await tx.meetingSelection.create({
      data: {
        meetingId,
        topicId,
        approachId,
        optionalMaterial,
      },
    });

    await tx.topic.update({
      where: { id: topicId },
      data: {
        lastSelectedAt: now,
        timesUsed: { increment: 1 },
      },
    });

    await tx.meeting.update({
      where: { id: meetingId },
      data: { phase: nextPhase },
    });

    await tx.council.update({
      where: { id: councilId },
      data: { phase: nextPhase },
    });
  });

  const topic = await prisma.topic.findUniqueOrThrow({
    where: { id: topicId },
    select: { id: true, title: true, category: true },
  });
  await ensureTopicStar(councilId, topic);
}
