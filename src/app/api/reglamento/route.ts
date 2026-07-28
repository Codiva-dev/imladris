import { NextResponse } from "next/server";
import {
  getMembershipForUser,
  requireSessionUser,
} from "@/lib/council-access";
import { prisma } from "@/lib/prisma";
import { resolveReglamento } from "@/lib/reglamento";

export async function GET() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Sin Consejo" }, { status: 404 });
  }

  const council = await prisma.council.findUniqueOrThrow({
    where: { id: membership.councilId },
    select: { reglamento: true, name: true },
  });

  const body = resolveReglamento(council.reglamento);

  return NextResponse.json({
    councilName: council.name,
    body,
    isDefault: !council.reglamento?.trim(),
    canEdit: membership.role === "ORGANIZADOR",
  });
}

export async function PUT(request: Request) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership || membership.role !== "ORGANIZADOR") {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }

  const payload = (await request.json()) as { body?: string; reset?: boolean };

  if (payload.reset) {
    await prisma.council.update({
      where: { id: membership.councilId },
      data: { reglamento: null },
    });
    return NextResponse.json({
      body: resolveReglamento(null),
      isDefault: true,
    });
  }

  const body = payload.body?.trim() ?? "";
  if (body.length < 20) {
    return NextResponse.json(
      { error: "El reglamento es demasiado corto" },
      { status: 400 },
    );
  }
  if (body.length > 20_000) {
    return NextResponse.json(
      { error: "El reglamento es demasiado largo" },
      { status: 400 },
    );
  }

  await prisma.council.update({
    where: { id: membership.councilId },
    data: { reglamento: body },
  });

  return NextResponse.json({ body, isDefault: false });
}
