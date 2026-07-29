import { NextResponse } from "next/server";
import {
  getMembershipForUser,
  rejectIfSealed,
  requireSessionUser,
  setCouncilAndMeetingPhase,
} from "@/lib/council-access";
import { notifyCouncilMembers } from "@/lib/push";
import { prisma } from "@/lib/prisma";

/** Organizador sella TEMA_SELECCIONADO → CUENTA_REGRESIVA. */
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: meetingId } = await context.params;
  const membership = await getMembershipForUser(user.id);
  if (!membership || membership.role !== "ORGANIZADOR") {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }

  const sealed = await rejectIfSealed(membership.councilId);
  if (sealed) return sealed;

  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, councilId: membership.councilId },
    select: { id: true, phase: true, selection: { select: { id: true } } },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Reunión no encontrada" }, { status: 404 });
  }

  if (meeting.phase !== "TEMA_SELECCIONADO") {
    return NextResponse.json(
      { error: "Aún no hay tema seleccionado" },
      { status: 409 },
    );
  }

  if (!meeting.selection) {
    return NextResponse.json(
      { error: "Falta la selección de tema" },
      { status: 409 },
    );
  }

  await setCouncilAndMeetingPhase(
    membership.councilId,
    meetingId,
    "CUENTA_REGRESIVA",
  );

  await notifyCouncilMembers(membership.councilId, {
    title: "Cuenta regresiva",
    body: "El Consejo se acerca. La puerta se cierra.",
    url: "/",
  });

  return NextResponse.json({ ok: true, phase: "CUENTA_REGRESIVA" });
}
