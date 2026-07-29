import { DEFAULT_APPROACHES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

/** Completa enfoques semilla que falten (p. ej. consejos fundados con lista corta). */
export async function ensureDefaultApproaches(councilId: string) {
  const existing = await prisma.approach.findMany({
    where: { councilId },
    select: { name: true },
  });
  const have = new Set(existing.map((a) => a.name));
  const missing = DEFAULT_APPROACHES.filter((name) => !have.has(name));
  if (missing.length === 0) return;

  await prisma.approach.createMany({
    data: missing.map((name) => ({ councilId, name })),
    skipDuplicates: true,
  });
}
