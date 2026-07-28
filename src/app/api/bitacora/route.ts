import { NextResponse } from "next/server";
import {
  createReflection,
  getOpenBitacoraMeeting,
  KIND_LABELS,
  listBitacoraEntries,
  REFLECTION_KINDS,
  REFLECTION_VISIBILITIES,
} from "@/domains/bitacora";
import { advanceCouncilLifecycle } from "@/domains/reunion";
import {
  getMembershipForUser,
  rejectIfSealed,
  requireSessionUser,
} from "@/lib/council-access";
import type { ReflectionKind, ReflectionVisibility } from "@prisma/client";

export async function GET() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Sin Consejo" }, { status: 404 });
  }

  await advanceCouncilLifecycle(membership.councilId);

  const meeting = await getOpenBitacoraMeeting(membership.councilId);
  if (!meeting) {
    return NextResponse.json({
      open: false,
      meeting: null,
      entries: [],
      kinds: REFLECTION_KINDS.map((k) => ({ id: k, label: KIND_LABELS[k] })),
      visibilities: REFLECTION_VISIBILITIES,
    });
  }

  const entries = await listBitacoraEntries(meeting.id, user.id);

  return NextResponse.json({
    open: true,
    meeting: {
      id: meeting.id,
      bitacoraOpensAt: meeting.bitacoraOpensAt,
      bitacoraClosesAt: meeting.bitacoraClosesAt,
      topic: meeting.selection?.topic ?? null,
      approach: meeting.selection?.approach ?? null,
    },
    entries,
    kinds: REFLECTION_KINDS.map((k) => ({ id: k, label: KIND_LABELS[k] })),
    visibilities: REFLECTION_VISIBILITIES,
  });
}

export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Sin Consejo" }, { status: 404 });
  }

  const sealed = await rejectIfSealed(membership.councilId);
  if (sealed) return sealed;

  await advanceCouncilLifecycle(membership.councilId);

  const meeting = await getOpenBitacoraMeeting(membership.councilId);
  if (!meeting) {
    return NextResponse.json(
      { error: "La bitácora está cerrada" },
      { status: 409 },
    );
  }

  const body = (await request.json()) as {
    kind?: string;
    visibility?: string;
    body?: string;
  };

  if (
    !body.kind ||
    !(REFLECTION_KINDS as readonly string[]).includes(body.kind)
  ) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }
  if (
    !body.visibility ||
    !(REFLECTION_VISIBILITIES as readonly string[]).includes(body.visibility)
  ) {
    return NextResponse.json({ error: "Visibilidad inválida" }, { status: 400 });
  }

  try {
    const reflection = await createReflection({
      councilId: membership.councilId,
      meetingId: meeting.id,
      userId: user.id,
      kind: body.kind as ReflectionKind,
      body: body.body ?? "",
      visibility: body.visibility as ReflectionVisibility,
      topicId: meeting.selection?.topicId ?? null,
    });
    return NextResponse.json({ id: reflection.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 },
    );
  }
}
