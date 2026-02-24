import { FeedbackSource } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { generateFeedbackTemplate } from "@/lib/feedback/template";
import { PermissionDeniedError, ResourceNotFoundError } from "@/lib/rbac/errors";
import { type CanvasInput, canvasSchema, createVentureSchema } from "@/lib/validation/venture";

export async function createVenture(ownerUserId: string, title: string, idea: string) {
  const parsed = createVentureSchema.parse({ title, idea });

  return prisma.venture.create({
    data: {
      ownerUserId,
      title: parsed.title,
      idea: parsed.idea,
      leanCanvas: {
        create: {},
      },
    },
  });
}

export async function getStudentVentures(ownerUserId: string) {
  return prisma.venture.findMany({
    where: { ownerUserId },
    include: {
      _count: {
        select: { feedbackEntries: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVentureForStudent(ventureId: string, ownerUserId: string) {
  await assertStudentOwnsVenture(ventureId, ownerUserId);

  const venture = await prisma.venture.findUnique({
    where: { id: ventureId },
    include: {
      leanCanvas: true,
      feedbackEntries: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!venture) {
    throw new ResourceNotFoundError("Venture not found.");
  }

  return venture;
}

export async function updateCanvasForStudent(ventureId: string, ownerUserId: string, canvasInput: CanvasInput) {
  await assertStudentOwnsVenture(ventureId, ownerUserId);

  const parsed = canvasSchema.parse(canvasInput);

  return prisma.leanCanvas.upsert({
    where: { ventureId },
    update: parsed,
    create: {
      ventureId,
      ...parsed,
    },
  });
}

export async function requestFeedbackForStudent(ventureId: string, ownerUserId: string) {
  await assertStudentOwnsVenture(ventureId, ownerUserId);

  const venture = await prisma.venture.findUnique({
    where: { id: ventureId },
    include: {
      leanCanvas: true,
    },
  });

  if (!venture) {
    throw new ResourceNotFoundError("Venture not found.");
  }

  if (!venture.leanCanvas) {
    throw new ResourceNotFoundError("Lean Canvas not found.");
  }

  const content = generateFeedbackTemplate({
    venture,
    canvas: venture.leanCanvas,
  });

  return prisma.feedbackEntry.create({
    data: {
      ventureId,
      requestedByUserId: ownerUserId,
      source: FeedbackSource.SYSTEM_TEMPLATE,
      content,
    },
  });
}

export async function getFeedbackHistoryForStudent(ventureId: string, ownerUserId: string) {
  await assertStudentOwnsVenture(ventureId, ownerUserId);

  return prisma.feedbackEntry.findMany({
    where: { ventureId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllVenturesForAdmin() {
  return prisma.venture.findMany({
    include: {
      owner: {
        select: {
          email: true,
        },
      },
      _count: {
        select: {
          feedbackEntries: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVentureDetailForAdmin(ventureId: string) {
  const venture = await prisma.venture.findUnique({
    where: { id: ventureId },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
        },
      },
      leanCanvas: true,
      feedbackEntries: {
        include: {
          requestedBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!venture) {
    throw new ResourceNotFoundError("Venture not found.");
  }

  return venture;
}

async function assertStudentOwnsVenture(ventureId: string, ownerUserId: string) {
  const venture = await prisma.venture.findUnique({
    where: { id: ventureId },
    select: {
      ownerUserId: true,
    },
  });

  if (!venture) {
    throw new ResourceNotFoundError("Venture not found.");
  }

  if (venture.ownerUserId !== ownerUserId) {
    throw new PermissionDeniedError("Student cannot access this venture.");
  }
}
