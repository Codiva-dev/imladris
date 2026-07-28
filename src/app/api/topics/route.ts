import { NextResponse } from "next/server";
import {
  getMembershipForUser,
  requireSessionUser,
} from "@/lib/council-access";
import { prisma } from "@/lib/prisma";

/** Banco de temas del Consejo. */
export async function GET() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Sin Consejo" }, { status: 404 });
  }

  const topics = await prisma.topic.findMany({
    where: { councilId: membership.councilId },
    orderBy: [{ status: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      status: true,
      timesUsed: true,
      lastSelectedAt: true,
      proposedBy: { select: { id: true, name: true, username: true } },
    },
  });

  return NextResponse.json({ topics });
}

/** Añadir tema al banco (organizador). */
export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership || membership.role !== "ORGANIZADOR") {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
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
    return NextResponse.json(
      { error: "Categoría requerida" },
      { status: 400 },
    );
  }

  const topic = await prisma.topic.create({
    data: {
      councilId: membership.councilId,
      title,
      description,
      category,
      proposedById: user.id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      status: true,
      timesUsed: true,
      proposedBy: { select: { id: true, name: true, username: true } },
    },
  });

  return NextResponse.json({ topic }, { status: 201 });
}
