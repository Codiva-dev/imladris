import { NextResponse } from "next/server";
import { DEFAULT_RULES } from "@/domains/selection";
import {
  getMembershipForUser,
  requireSessionUser,
} from "@/lib/council-access";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Sin Consejo" }, { status: 404 });
  }

  const row =
    (await prisma.councilRules.findUnique({
      where: { councilId: membership.councilId },
    })) ??
    (await prisma.councilRules.create({
      data: { councilId: membership.councilId },
    }));

  return NextResponse.json({
    rules: {
      noRepeatTopicMonths: row.noRepeatTopicMonths,
      noConsecutiveCategory: row.noConsecutiveCategory,
      candidateCount: row.candidateCount,
      approachCount: row.approachCount,
      allowFreeCombination: row.allowFreeCombination,
      excludeArchivedTopics: row.excludeArchivedTopics,
    },
    defaults: DEFAULT_RULES,
  });
}

export async function PATCH(request: Request) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership || membership.role !== "ORGANIZADOR") {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }

  const body = (await request.json()) as Partial<{
    noRepeatTopicMonths: number;
    noConsecutiveCategory: boolean;
    candidateCount: number;
    approachCount: number;
    allowFreeCombination: boolean;
    excludeArchivedTopics: boolean;
  }>;

  const data: Record<string, number | boolean> = {};
  if (typeof body.noRepeatTopicMonths === "number") {
    data.noRepeatTopicMonths = Math.min(24, Math.max(1, body.noRepeatTopicMonths));
  }
  if (typeof body.candidateCount === "number") {
    data.candidateCount = Math.min(8, Math.max(1, body.candidateCount));
  }
  if (typeof body.approachCount === "number") {
    data.approachCount = Math.min(8, Math.max(1, body.approachCount));
  }
  if (typeof body.noConsecutiveCategory === "boolean") {
    data.noConsecutiveCategory = body.noConsecutiveCategory;
  }
  if (typeof body.allowFreeCombination === "boolean") {
    data.allowFreeCombination = body.allowFreeCombination;
  }
  if (typeof body.excludeArchivedTopics === "boolean") {
    data.excludeArchivedTopics = body.excludeArchivedTopics;
  }

  const row = await prisma.councilRules.upsert({
    where: { councilId: membership.councilId },
    create: { councilId: membership.councilId, ...data },
    update: data,
  });

  return NextResponse.json({
    rules: {
      noRepeatTopicMonths: row.noRepeatTopicMonths,
      noConsecutiveCategory: row.noConsecutiveCategory,
      candidateCount: row.candidateCount,
      approachCount: row.approachCount,
      allowFreeCombination: row.allowFreeCombination,
      excludeArchivedTopics: row.excludeArchivedTopics,
    },
  });
}
