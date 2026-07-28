import { NextResponse } from "next/server";
import { loadSelectionRules } from "@/domains/selection";
import {
  getMembershipForUser,
  requireSessionUser,
} from "@/lib/council-access";
import { prisma } from "@/lib/prisma";

const OPEN_PHASES = [
  "DISPONIBILIDAD",
  "QUORUM_ALCANZADO",
  "FECHA_CONFIRMADA",
] as const;

/** Propuestas de tema del miembro en esta convocatoria. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: meetingId } = await context.params;
  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Sin Consejo" }, { status: 404 });
  }

  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, councilId: membership.councilId },
    select: { id: true, phase: true },
  });
  if (!meeting) {
    return NextResponse.json({ error: "Reunión no encontrada" }, { status: 404 });
  }

  const rules = await loadSelectionRules(membership.councilId);
  const proposals = await prisma.topicProposal.findMany({
    where: { meetingId, userId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      topic: {
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
        },
      },
    },
  });

  return NextResponse.json({
    limit: rules.topicProposalsPerMember,
    open: (OPEN_PHASES as readonly string[]).includes(meeting.phase),
    proposals: proposals.map((p) => ({
      id: p.id,
      topicId: p.topicId,
      title: p.topic.title,
      description: p.topic.description,
      category: p.topic.category,
    })),
  });
}

/** Añadir propuesta (crea tema en el banco). */
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
  if (!membership) {
    return NextResponse.json({ error: "Sin Consejo" }, { status: 404 });
  }

  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, councilId: membership.councilId },
    select: { id: true, phase: true },
  });
  if (!meeting) {
    return NextResponse.json({ error: "Reunión no encontrada" }, { status: 404 });
  }

  if (!(OPEN_PHASES as readonly string[]).includes(meeting.phase)) {
    return NextResponse.json(
      { error: "Ya no se aceptan propuestas" },
      { status: 409 },
    );
  }

  const rules = await loadSelectionRules(membership.councilId);
  const existing = await prisma.topicProposal.count({
    where: { meetingId, userId: user.id },
  });
  if (existing >= rules.topicProposalsPerMember) {
    return NextResponse.json(
      {
        error: `Máximo ${rules.topicProposalsPerMember} propuesta${rules.topicProposalsPerMember === 1 ? "" : "s"}`,
      },
      { status: 409 },
    );
  }

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    category?: string;
  };

  const title = body.title?.trim() ?? "";
  const description = body.description?.trim() ?? "";
  const category = body.category?.trim() ?? "";

  if (title.length < 2) {
    return NextResponse.json({ error: "Título demasiado corto" }, { status: 400 });
  }
  if (description.length < 2) {
    return NextResponse.json(
      { error: "Descripción demasiado corta" },
      { status: 400 },
    );
  }
  if (category.length < 2) {
    return NextResponse.json({ error: "Categoría requerida" }, { status: 400 });
  }

  const created = await prisma.$transaction(async (tx) => {
    const topic = await tx.topic.create({
      data: {
        councilId: membership.councilId,
        title,
        description,
        category,
        proposedById: user.id,
      },
    });
    const proposal = await tx.topicProposal.create({
      data: {
        meetingId,
        userId: user.id,
        topicId: topic.id,
      },
    });
    return { proposal, topic };
  });

  return NextResponse.json(
    {
      id: created.proposal.id,
      topicId: created.topic.id,
      title: created.topic.title,
      description: created.topic.description,
      category: created.topic.category,
    },
    { status: 201 },
  );
}

/** Quitar una propuesta propia (el tema permanece en el banco). */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: meetingId } = await context.params;
  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Sin Consejo" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const proposalId = searchParams.get("id");
  if (!proposalId) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const proposal = await prisma.topicProposal.findFirst({
    where: {
      id: proposalId,
      meetingId,
      userId: user.id,
      meeting: { councilId: membership.councilId },
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  await prisma.topicProposal.delete({ where: { id: proposal.id } });
  return NextResponse.json({ ok: true });
}
