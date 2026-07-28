import { NextResponse } from "next/server";
import { persistMeetingSelection } from "@/domains/selection";
import {
  getMembershipForUser,
  requireSessionUser,
} from "@/lib/council-access";
import { notifyCouncilMembers } from "@/lib/push";
import { prisma } from "@/lib/prisma";

/** Organizador confirma tema (+ enfoque) → cuenta regresiva. */
export async function POST(
  request: Request,
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

  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, councilId: membership.councilId },
    select: { id: true, phase: true },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Reunión no encontrada" }, { status: 404 });
  }

  if (meeting.phase !== "FECHA_CONFIRMADA") {
    return NextResponse.json(
      { error: "Aún no toca elegir tema" },
      { status: 409 },
    );
  }

  const body = (await request.json()) as {
    topicId?: string;
    approachId?: string | null;
    optionalMaterial?: string | null;
  };

  if (!body.topicId) {
    return NextResponse.json({ error: "topicId requerido" }, { status: 400 });
  }

  try {
    await persistMeetingSelection({
      councilId: membership.councilId,
      meetingId,
      topicId: body.topicId,
      approachId: body.approachId?.trim() || null,
      optionalMaterial: body.optionalMaterial?.trim() || null,
      nextPhase: "CUENTA_REGRESIVA",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status =
      message === "Ya hay un tema seleccionado" ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }

  const topic = await prisma.topic.findUnique({
    where: { id: body.topicId },
    select: { title: true },
  });

  await notifyCouncilMembers(membership.councilId, {
    title: "Tema elegido",
    body: topic?.title
      ? `El Consejo hablará de «${topic.title}».`
      : "Ya hay tema para el próximo Consejo.",
    url: "/",
  });

  return NextResponse.json({ ok: true, phase: "CUENTA_REGRESIVA" });
}
