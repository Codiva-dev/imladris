import { NextResponse } from "next/server";
import {
  ensureDefaultApproaches,
  persistMeetingSelection,
} from "@/domains/selection";
import {
  getMembershipForUser,
  rejectIfSealed,
  requireSessionUser,
} from "@/lib/council-access";
import { notifyCouncilMembers } from "@/lib/push";
import { prisma } from "@/lib/prisma";

/** Organizador confirma tema (+ enfoque) → TEMA_SELECCIONADO. */
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

  const sealed = await rejectIfSealed(membership.councilId);
  if (sealed) return sealed;

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
    optionalMaterial?: string | null;
  };

  if (!body.topicId) {
    return NextResponse.json({ error: "topicId requerido" }, { status: 400 });
  }

  await ensureDefaultApproaches(membership.councilId);

  const approaches = await prisma.approach.findMany({
    where: { councilId: membership.councilId },
    select: { id: true },
  });
  const approachId =
    approaches.length > 0
      ? approaches[Math.floor(Math.random() * approaches.length)]!.id
      : null;

  try {
    await persistMeetingSelection({
      councilId: membership.councilId,
      meetingId,
      topicId: body.topicId,
      approachId,
      optionalMaterial: body.optionalMaterial?.trim() || null,
      nextPhase: "TEMA_SELECCIONADO",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status =
      message === "Ya hay un tema seleccionado" ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }

  const [topic, approach] = await Promise.all([
    prisma.topic.findUnique({
      where: { id: body.topicId },
      select: { title: true },
    }),
    approachId
      ? prisma.approach.findUnique({
          where: { id: approachId },
          select: { name: true },
        })
      : null,
  ]);

  await notifyCouncilMembers(membership.councilId, {
    title: "Tema elegido",
    body: topic?.title
      ? approach?.name
        ? `«${topic.title}» · ${approach.name}`
        : `El Consejo hablará de «${topic.title}».`
      : "Ya hay tema para el próximo Consejo.",
    url: "/",
  });

  return NextResponse.json({
    ok: true,
    phase: "TEMA_SELECCIONADO",
    approachId,
    approachName: approach?.name ?? null,
  });
}
