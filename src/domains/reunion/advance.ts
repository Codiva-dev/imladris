import { addHours, format } from "date-fns";
import { es } from "date-fns/locale/es";
import { BITACORA_WINDOW_HOURS } from "@/lib/constants";
import {
  appOrigin,
  setCouncilAndMeetingPhase,
} from "@/lib/council-access";
import { sendBitacoraOpenEmail } from "@/lib/email";
import { notifyCouncilMembers } from "@/lib/push";
import { prisma } from "@/lib/prisma";
import { ensureTopicStar } from "@/domains/mapa/stars";

/** Avanza fases por el reloj: cuenta regresiva → en curso → bitácora → cerrado. */
export async function advanceCouncilLifecycle(councilId: string) {
  const meeting = await prisma.meeting.findFirst({
    where: {
      councilId,
      phase: { not: "CERRADO" },
    },
    orderBy: { createdAt: "desc" },
    include: {
      selection: { include: { topic: true } },
    },
  });

  if (!meeting) return null;

  const now = new Date();

  if (
    meeting.phase === "CUENTA_REGRESIVA" &&
    meeting.startsAt &&
    meeting.startsAt.getTime() <= now.getTime()
  ) {
    await setCouncilAndMeetingPhase(councilId, meeting.id, "EN_CURSO");
    return "EN_CURSO";
  }

  if (
    meeting.phase === "EN_CURSO" &&
    meeting.endsAt &&
    meeting.endsAt.getTime() <= now.getTime()
  ) {
    await openBitacoraWindow(councilId, meeting.id);
    return "BITACORA_ABIERTA";
  }

  if (
    meeting.phase === "BITACORA_ABIERTA" &&
    meeting.bitacoraClosesAt &&
    meeting.bitacoraClosesAt.getTime() <= now.getTime()
  ) {
    await setCouncilAndMeetingPhase(councilId, meeting.id, "CERRADO");
    return "CERRADO";
  }

  return meeting.phase;
}

export async function openBitacoraWindow(
  councilId: string,
  meetingId: string,
  opts?: { notify?: boolean },
) {
  const opensAt = new Date();
  const closesAt = addHours(opensAt, BITACORA_WINDOW_HOURS);

  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, councilId },
    include: {
      selection: { include: { topic: true } },
    },
  });

  if (!meeting) throw new Error("Reunión no encontrada");
  if (
    meeting.phase !== "EN_CURSO" &&
    meeting.phase !== "CUENTA_REGRESIVA" &&
    meeting.phase !== "TEMA_SELECCIONADO"
  ) {
    if (meeting.phase === "BITACORA_ABIERTA") return meeting;
    throw new Error("No se puede abrir la bitácora aún");
  }

  if (meeting.selection?.topic) {
    await ensureTopicStar(councilId, meeting.selection.topic);
  }

  await prisma.$transaction([
    prisma.meeting.update({
      where: { id: meetingId },
      data: {
        phase: "BITACORA_ABIERTA",
        bitacoraOpensAt: opensAt,
        bitacoraClosesAt: closesAt,
      },
    }),
    prisma.council.update({
      where: { id: councilId },
      data: { phase: "BITACORA_ABIERTA" },
    }),
  ]);

  if (opts?.notify !== false) {
    const members = await prisma.councilMember.findMany({
      where: { councilId },
      include: { user: { select: { email: true } } },
    });
    const council = await prisma.council.findUniqueOrThrow({
      where: { id: councilId },
      select: { name: true },
    });
    const closesAtLabel = format(closesAt, "EEEE d MMMM · HH:mm", {
      locale: es,
    });
    const bitacoraUrl = `${appOrigin()}/bitacora`;

    await Promise.allSettled(
      members.map((m) =>
        sendBitacoraOpenEmail({
          to: m.user.email,
          councilName: council.name,
          closesAtLabel,
          bitacoraUrl,
        }),
      ),
    );

    await notifyCouncilMembers(councilId, {
      title: "Bitácora abierta",
      body: `Tienes 72 horas para dejar tu huella. Cierra ${closesAtLabel}.`,
      url: "/bitacora",
    });
  }

  return prisma.meeting.findUniqueOrThrow({ where: { id: meetingId } });
}
