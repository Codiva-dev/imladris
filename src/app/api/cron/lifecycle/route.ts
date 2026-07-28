import { NextResponse } from "next/server";
import { advanceCouncilLifecycle } from "@/domains/reunion";
import { prisma } from "@/lib/prisma";

/**
 * Cron Vercel: avanza fases de todos los consejos activos.
 * Auth: Authorization: Bearer $CRON_SECRET (o header x-vercel-cron).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const vercelCron = request.headers.get("x-vercel-cron");

  const authorized =
    Boolean(vercelCron) ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`);

  if (!authorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const councils = await prisma.council.findMany({
    where: { phase: { not: "CERRADO" } },
    select: { id: true, phase: true },
  });

  const results: { id: string; from: string; to: string | null }[] = [];

  for (const c of councils) {
    const next = await advanceCouncilLifecycle(c.id);
    results.push({
      id: c.id,
      from: c.phase,
      to: next,
    });
  }

  return NextResponse.json({
    ok: true,
    checked: councils.length,
    results,
  });
}
